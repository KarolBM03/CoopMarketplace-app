import prisma from "../database/prisma";
import { Prisma } from "@prisma/client";

interface AuditData {
  userId?: string;
  action: string;
  entity: string;
  entityId: string;
  description: string;
  metadata?: Prisma.InputJsonValue;
  ip?: string;
}

export const createAuditLog = async ({
  userId,
  action,
  entity,
  entityId,
  description,
  metadata,
  ip,
}: AuditData) => {
  return await prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      description,
      metadata,
      ip,
    },
  });
};



