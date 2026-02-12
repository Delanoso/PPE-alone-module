import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { createAuditLog } from "../lib/audit.js";

const createVariantSchema = z.object({
  ppeItemId: z.string().uuid(),
  variantCode: z.string().min(2),
  sizeValue: z.string().min(1),
  color: z.string().optional(),
  minStockLevel: z.number().nonnegative().default(0),
});

const stockMovementSchema = z.object({
  ppeVariantId: z.string().uuid(),
  locationId: z.string().uuid(),
  movementType: z.enum(["receipt", "issue", "adjustment", "return"]),
  quantity: z.number(),
  reasonCode: z.string().optional(),
  notes: z.string().optional(),
});

export const ppeRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/ppe/items",
    {
      preHandler: [app.authenticate],
    },
    async () => {
      const items = await prisma.ppeItem.findMany({
        where: { isActive: true },
        include: { category: true, variants: true },
        orderBy: { itemName: "asc" },
      });
      return { success: true, data: items };
    },
  );

  app.get(
    "/ppe/variants",
    {
      preHandler: [app.authenticate],
    },
    async () => {
      const variants = await prisma.ppeVariant.findMany({
        where: { isActive: true },
        include: {
          ppeItem: true,
        },
        orderBy: [{ ppeItem: { itemName: "asc" } }, { sizeValue: "asc" }],
      });
      return { success: true, data: variants };
    },
  );

  app.post(
    "/ppe/variants",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const payload = createVariantSchema.parse(request.body);

      const variant = await prisma.ppeVariant.create({
        data: payload,
      });

      await createAuditLog({
        actorUserId: request.user.userId,
        action: "create",
        entityName: "ppe_variant",
        entityId: variant.id,
        afterJson: variant,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"]?.toString(),
      });

      return reply.code(201).send({ success: true, data: variant });
    },
  );

  app.get(
    "/stock/locations",
    {
      preHandler: [app.authenticate],
    },
    async () => {
      const locations = await prisma.location.findMany({
        where: { isActive: true },
        orderBy: { locationName: "asc" },
      });
      return { success: true, data: locations };
    },
  );

  app.get(
    "/stock/movements",
    {
      preHandler: [app.authenticate],
    },
    async () => {
      const movements = await prisma.stockMovement.findMany({
        include: {
          variant: {
            include: { ppeItem: true },
          },
          location: true,
        },
        orderBy: { movementDate: "desc" },
      });

      return { success: true, data: movements };
    },
  );

  app.post(
    "/stock/movements",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const payload = stockMovementSchema.parse(request.body);

      if (payload.movementType === "issue" && payload.quantity > 0) {
        return reply.badRequest("Issue movement must be a negative quantity");
      }
      if (payload.movementType !== "issue" && payload.quantity < 0) {
        return reply.badRequest("Only issue movement may use a negative quantity");
      }

      const movement = await prisma.stockMovement.create({
        data: {
          ppeVariantId: payload.ppeVariantId,
          locationId: payload.locationId,
          movementType: payload.movementType,
          quantity: payload.quantity,
          reasonCode: payload.reasonCode,
          notes: payload.notes,
          createdByUserId: request.user.userId,
        },
      });

      await createAuditLog({
        actorUserId: request.user.userId,
        action: "stock_movement",
        entityName: "stock_movement",
        entityId: movement.id,
        afterJson: movement,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"]?.toString(),
      });

      return reply.code(201).send({ success: true, data: movement });
    },
  );

  app.get(
    "/stock/balances",
    {
      preHandler: [app.authenticate],
    },
    async () => {
      const balances = await prisma.stockMovement.groupBy({
        by: ["ppeVariantId", "locationId"],
        _sum: {
          quantity: true,
        },
      });

      return { success: true, data: balances };
    },
  );
};
