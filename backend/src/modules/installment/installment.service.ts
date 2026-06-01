import prisma from "../../config/prisma";
import { createNotification } from "../../services/notification.service";
import { createTransaction } from "../../services/transaction.service";
import { createLedgerEntry } from "../../services/ledger.service";
import { createAuditLog } from "../../services/audit.service";

export const payInstallment = async (
  _installmentId: string,
  _actorId?: string,
  _idempotencyKey?: string,
) => {
  throw new Error("Las cuotas se pagan y confirman desde CoopHispanica");
};
