import type { FastifyPluginAsync } from "fastify";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createPersonSchema, updatePersonSchema } from "@hfr/ppe-shared";
import { prisma } from "../lib/prisma.js";
import { createAuditLog } from "../lib/audit.js";

const listQuerySchema = z.object({
  departmentId: z.string().uuid().optional(),
  subDepartmentId: z.string().uuid().optional(),
  search: z.string().optional(),
});

export const peopleRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/people",
    {
      preHandler: [app.authenticate],
    },
    async (request) => {
      const query = listQuerySchema.parse(request.query);

      const where: Prisma.PersonWhereInput = {
        deletedAt: null,
      };

      if (query.departmentId) where.departmentId = query.departmentId;
      if (query.subDepartmentId) where.subDepartmentId = query.subDepartmentId;
      if (query.search) {
        where.OR = [
          { firstName: { contains: query.search, mode: "insensitive" } },
          { lastName: { contains: query.search, mode: "insensitive" } },
          { employeeNo: { contains: query.search, mode: "insensitive" } },
        ];
      }

      const people = await prisma.person.findMany({
        where,
        include: {
          department: true,
          subDepartment: true,
          jobTitle: true,
          sizes: true,
        },
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      });

      return { success: true, data: people };
    },
  );

  app.post(
    "/people",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const payload = createPersonSchema.parse(request.body);

      const person = await prisma.person.create({
        data: {
          employeeNo: payload.employeeNo,
          firstName: payload.firstName,
          lastName: payload.lastName,
          mobileNumber: payload.mobileNumber,
          departmentId: payload.departmentId,
          subDepartmentId: payload.subDepartmentId,
          jobTitleId: payload.jobTitleId,
          sizes: {
            createMany: {
              data: payload.sizes.map((size) => ({
                sizeType: size.sizeType,
                sizeValue: size.sizeValue,
                updatedBy: request.user.userId,
              })),
            },
          },
        },
        include: {
          sizes: true,
        },
      });

      await createAuditLog({
        actorUserId: request.user.userId,
        action: "create",
        entityName: "person",
        entityId: person.id,
        afterJson: person,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"]?.toString(),
      });

      return reply.code(201).send({ success: true, data: person });
    },
  );

  app.patch(
    "/people/:personId",
    {
      preHandler: [app.authenticate],
    },
    async (request) => {
      const params = z.object({ personId: z.string().uuid() }).parse(request.params);
      const payload = updatePersonSchema.parse(request.body);

      const before = await prisma.person.findUnique({ where: { id: params.personId } });
      if (!before || before.deletedAt) {
        throw app.httpErrors.notFound("Person not found");
      }

      const person = await prisma.person.update({
        where: { id: params.personId },
        data: {
          firstName: payload.firstName,
          lastName: payload.lastName,
          mobileNumber: payload.mobileNumber,
          departmentId: payload.departmentId,
          subDepartmentId: payload.subDepartmentId,
          employmentStatus: payload.employmentStatus,
        },
      });

      await createAuditLog({
        actorUserId: request.user.userId,
        action: "update",
        entityName: "person",
        entityId: person.id,
        beforeJson: before,
        afterJson: person,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"]?.toString(),
      });

      return { success: true, data: person };
    },
  );

  app.put(
    "/people/:personId/sizes",
    {
      preHandler: [app.authenticate],
    },
    async (request) => {
      const params = z.object({ personId: z.string().uuid() }).parse(request.params);
      const payload = z
        .object({
          sizes: z.array(
            z.object({
              sizeType: z.string().min(1),
              sizeValue: z.string().min(1),
            }),
          ),
        })
        .parse(request.body);

      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.personSizeProfile.deleteMany({
          where: { personId: params.personId },
        });

        if (payload.sizes.length > 0) {
          await tx.personSizeProfile.createMany({
            data: payload.sizes.map((size) => ({
              personId: params.personId,
              sizeType: size.sizeType,
              sizeValue: size.sizeValue,
              updatedBy: request.user.userId,
            })),
          });
        }
      });

      const sizes = await prisma.personSizeProfile.findMany({
        where: { personId: params.personId },
        orderBy: { sizeType: "asc" },
      });

      await createAuditLog({
        actorUserId: request.user.userId,
        action: "update_sizes",
        entityName: "person",
        entityId: params.personId,
        afterJson: sizes,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"]?.toString(),
      });

      return { success: true, data: sizes };
    },
  );

  app.delete(
    "/people/:personId",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const params = z.object({ personId: z.string().uuid() }).parse(request.params);
      const before = await prisma.person.findUnique({ where: { id: params.personId } });

      if (!before || before.deletedAt) {
        throw app.httpErrors.notFound("Person not found");
      }

      await prisma.person.update({
        where: { id: params.personId },
        data: {
          deletedAt: new Date(),
          employmentStatus: "inactive",
        },
      });

      await createAuditLog({
        actorUserId: request.user.userId,
        action: "delete",
        entityName: "person",
        entityId: params.personId,
        beforeJson: before,
        afterJson: { deletedAt: new Date().toISOString() },
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"]?.toString(),
      });

      return reply.code(204).send();
    },
  );
};
