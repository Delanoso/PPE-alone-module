import { prisma } from "./prisma.js";
import { Prisma } from "@prisma/client";

type AuditInput = {
  actorUserId?: string;
  action: string;
  entityName: string;
  entityId?: string;
  beforeJson?: unknown;
  afterJson?: unknown;
  ipAddress?: string;
  userAgent?: string;
};

function normalizeJson(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function createAuditLog(input: AuditInput) {
  await prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      entityName: input.entityName,
      entityId: input.entityId,
      beforeJson: normalizeJson(input.beforeJson),
      afterJson: normalizeJson(input.afterJson),
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });
}
