import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { createAuditLog } from "../lib/audit.js";

const departmentInput = z.object({
  departmentCode: z.string().min(2),
  departmentName: z.string().min(2),
});

export const organizationRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/departments",
    {
      preHandler: [app.authenticate],
    },
    async () => {
      const departments = await prisma.department.findMany({
        where: { isActive: true },
        include: {
          subDepartments: {
            where: { isActive: true },
            orderBy: { subDepartmentName: "asc" },
          },
        },
        orderBy: { departmentName: "asc" },
      });

      return { success: true, data: departments };
    },
  );

  app.post(
    "/departments",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const payload = departmentInput.parse(request.body);

      const department = await prisma.department.create({
        data: payload,
      });

      await createAuditLog({
        actorUserId: request.user.userId,
        action: "create",
        entityName: "department",
        entityId: department.id,
        afterJson: department,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"]?.toString(),
      });

      return reply.code(201).send({ success: true, data: department });
    },
  );

  app.get(
    "/departments/:departmentId/sub-departments",
    {
      preHandler: [app.authenticate],
    },
    async (request) => {
      const params = z.object({ departmentId: z.string().uuid() }).parse(request.params);

      const subDepartments = await prisma.subDepartment.findMany({
        where: {
          departmentId: params.departmentId,
          isActive: true,
        },
        orderBy: { subDepartmentName: "asc" },
      });

      return { success: true, data: subDepartments };
    },
  );
};
