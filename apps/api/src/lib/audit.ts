import { prisma } from "./prisma.js";

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

export async function createAuditLog(input: AuditInput) {
  await prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      entityName: input.entityName,
      entityId: input.entityId,
      beforeJson: input.beforeJson,
      afterJson: input.afterJson,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });
}
