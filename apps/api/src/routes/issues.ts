import type { FastifyPluginAsync } from "fastify";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { createIssueSchema } from "@hfr/ppe-shared";
import { prisma } from "../lib/prisma.js";
import { createAuditLog } from "../lib/audit.js";
import { buildIssueNumber, generateRawToken, hashToken } from "../lib/signature.js";
import { env } from "../config/env.js";

export const issueRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/issues",
    {
      preHandler: [app.authenticate],
    },
    async () => {
      const issues = await prisma.issueTransaction.findMany({
        include: {
          person: true,
          issuedByUser: true,
          lines: {
            include: {
              ppeVariant: {
                include: {
                  ppeItem: true,
                },
              },
            },
          },
        },
        orderBy: { issueDate: "desc" },
      });
      return { success: true, data: issues };
    },
  );

  app.post(
    "/issues",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const payload = createIssueSchema.parse(request.body);

      const person = await prisma.person.findUnique({
        where: { id: payload.personId },
      });
      if (!person || person.deletedAt) {
        return reply.badRequest("Person not found");
      }

      const issue = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        for (const line of payload.lines) {
          const balance = await tx.stockMovement.aggregate({
            where: {
              ppeVariantId: line.ppeVariantId,
              locationId: payload.locationId,
            },
            _sum: {
              quantity: true,
            },
          });

          const available = Number(balance._sum.quantity ?? 0);
          if (available < line.quantity) {
            throw app.httpErrors.badRequest(`Insufficient stock for variant ${line.ppeVariantId}`);
          }
        }

        const issueRecord = await tx.issueTransaction.create({
          data: {
            issueNo: buildIssueNumber(),
            personId: payload.personId,
            issuedByUserId: request.user.userId,
            locationId: payload.locationId,
            signatureMode: payload.signatureMode,
            issueStatus: payload.signatureMode === "remote" ? "pending_signature" : "draft",
            notes: payload.notes,
            lines: {
              createMany: {
                data: payload.lines.map((line) => ({
                  ppeVariantId: line.ppeVariantId,
                  quantity: line.quantity,
                })),
              },
            },
          },
          include: {
            lines: true,
          },
        });

        await tx.stockMovement.createMany({
          data: payload.lines.map((line) => ({
            ppeVariantId: line.ppeVariantId,
            locationId: payload.locationId,
            movementType: "issue",
            quantity: -Math.abs(line.quantity),
            referenceType: "issue",
            referenceId: issueRecord.id,
            reasonCode: "PPE_ISSUE",
            createdByUserId: request.user.userId,
          })),
        });

        return issueRecord;
      });

      await createAuditLog({
        actorUserId: request.user.userId,
        action: "create",
        entityName: "issue_transaction",
        entityId: issue.id,
        afterJson: issue,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"]?.toString(),
      });

      return reply.code(201).send({ success: true, data: issue });
    },
  );

  app.get(
    "/issues/:issueId",
    {
      preHandler: [app.authenticate],
    },
    async (request) => {
      const params = z.object({ issueId: z.string().uuid() }).parse(request.params);

      const issue = await prisma.issueTransaction.findUnique({
        where: { id: params.issueId },
        include: {
          person: true,
          issuedByUser: true,
          lines: {
            include: {
              ppeVariant: {
                include: {
                  ppeItem: true,
                },
              },
            },
          },
          signatureTokens: true,
          signatureRecord: true,
        },
      });

      if (!issue) {
        throw app.httpErrors.notFound("Issue not found");
      }

      return { success: true, data: issue };
    },
  );

  app.patch(
    "/issues/:issueId",
    {
      preHandler: [app.authenticate],
    },
    async (request) => {
      const params = z.object({ issueId: z.string().uuid() }).parse(request.params);
      const payload = z
        .object({
          issueStatus: z.enum(["draft", "pending_signature", "signed", "cancelled"]).optional(),
          notes: z.string().optional(),
        })
        .parse(request.body);

      const before = await prisma.issueTransaction.findUnique({ where: { id: params.issueId } });
      if (!before) {
        throw app.httpErrors.notFound("Issue not found");
      }

      const issue = await prisma.issueTransaction.update({
        where: { id: params.issueId },
        data: {
          issueStatus: payload.issueStatus,
          notes: payload.notes,
          cancelledAt: payload.issueStatus === "cancelled" ? new Date() : undefined,
          cancelledByUserId: payload.issueStatus === "cancelled" ? request.user.userId : undefined,
          signedAt: payload.issueStatus === "signed" ? new Date() : undefined,
        },
      });

      await createAuditLog({
        actorUserId: request.user.userId,
        action: "update",
        entityName: "issue_transaction",
        entityId: issue.id,
        beforeJson: before,
        afterJson: issue,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"]?.toString(),
      });

      return { success: true, data: issue };
    },
  );

  app.post(
    "/issues/:issueId/send-signature-link",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const params = z.object({ issueId: z.string().uuid() }).parse(request.params);
      const payload = z.object({ mobileNumber: z.string().min(8).optional() }).parse(request.body ?? {});

      const issue = await prisma.issueTransaction.findUnique({
        where: { id: params.issueId },
        include: {
          person: true,
        },
      });

      if (!issue) {
        throw app.httpErrors.notFound("Issue not found");
      }

      if (issue.issueStatus === "signed") {
        return reply.badRequest("Issue already signed");
      }

      const rawToken = generateRawToken();
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + env.SIGNING_LINK_TTL_HOURS * 3600 * 1000);

      const token = await prisma.signatureToken.create({
        data: {
          issueTransactionId: issue.id,
          tokenHash,
          tokenStatus: "sent",
          expiresAt,
          sentAt: new Date(),
          createdByUserId: request.user.userId,
        },
      });

      const signingLink = `${env.SIGNING_LINK_BASE_URL}/${rawToken}`;
      const recipient = payload.mobileNumber ?? issue.person.mobileNumber;

      await prisma.notificationLog.create({
        data: {
          channel: "whatsapp",
          recipient,
          templateCode: "PPE_SIGNATURE_LINK_V1",
          issueTransactionId: issue.id,
          signatureTokenId: token.id,
          status: "queued",
          payloadJson: {
            personId: issue.personId,
            issueNo: issue.issueNo,
            signingLink,
          },
        },
      });

      await createAuditLog({
        actorUserId: request.user.userId,
        action: "send_signature_link",
        entityName: "signature_token",
        entityId: token.id,
        afterJson: {
          issueId: issue.id,
          recipient,
          expiresAt: expiresAt.toISOString(),
        },
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"]?.toString(),
      });

      return reply.code(202).send({
        success: true,
        message: "Signature link queued",
        data: {
          issueId: issue.id,
          recipient,
          expiresAt,
          signingLink,
        },
      });
    },
  );
};
