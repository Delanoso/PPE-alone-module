import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { hashToken } from "../lib/signature.js";

const completeSignatureSchema = z.object({
  signerName: z.string().min(2),
  signerMobile: z.string().min(8),
  signatureType: z.enum(["draw", "type", "consent"]),
  signaturePayload: z.string().min(1),
});

export const publicSignatureRoutes: FastifyPluginAsync = async (app) => {
  app.get("/sign/:token/preview", async (request, reply) => {
    const params = z.object({ token: z.string().min(10) }).parse(request.params);
    const tokenHash = hashToken(params.token);

    const token = await prisma.signatureToken.findUnique({
      where: { tokenHash },
      include: {
        issueTransaction: {
          include: {
            person: true,
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
        },
      },
    });

    if (!token) {
      return reply.gone("Signature link is invalid");
    }
    if (token.expiresAt < new Date()) {
      return reply.gone("Signature link has expired");
    }
    if (token.tokenStatus === "signed" || token.tokenStatus === "revoked") {
      return reply.gone("Signature link already used");
    }

    if (!token.openedAt) {
      await prisma.signatureToken.update({
        where: { id: token.id },
        data: {
          tokenStatus: "opened",
          openedAt: new Date(),
        },
      });
    }

    return {
      success: true,
      data: {
        issue: token.issueTransaction,
        expiresAt: token.expiresAt,
      },
    };
  });

  app.post("/sign/:token/complete", async (request, reply) => {
    const params = z.object({ token: z.string().min(10) }).parse(request.params);
    const payload = completeSignatureSchema.parse(request.body);
    const tokenHash = hashToken(params.token);

    const token = await prisma.signatureToken.findUnique({
      where: { tokenHash },
      include: {
        issueTransaction: true,
      },
    });

    if (!token) return reply.gone("Signature link is invalid");
    if (token.expiresAt < new Date()) return reply.gone("Signature link has expired");
    if (token.tokenStatus === "signed" || token.tokenStatus === "revoked") {
      return reply.gone("Signature link already used");
    }
    if (token.currentAttempts >= token.maxAttempts) {
      return reply.tooManyRequests("Signature attempts exceeded");
    }

    await prisma.$transaction(async (tx) => {
      await tx.signatureRecord.create({
        data: {
          issueTransactionId: token.issueTransactionId,
          signatureTokenId: token.id,
          signatureType: payload.signatureType,
          signaturePayloadUri: payload.signaturePayload,
          signerName: payload.signerName,
          signerMobile: payload.signerMobile,
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"]?.toString(),
        },
      });

      await tx.issueTransaction.update({
        where: { id: token.issueTransactionId },
        data: {
          issueStatus: "signed",
          signedAt: new Date(),
        },
      });

      await tx.signatureToken.update({
        where: { id: token.id },
        data: {
          tokenStatus: "signed",
          currentAttempts: { increment: 1 },
          signedAt: new Date(),
        },
      });
    });

    return {
      success: true,
      message: "Signature captured successfully",
    };
  });
};
