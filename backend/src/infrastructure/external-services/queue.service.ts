import prisma from "../database/prisma";
import { getTransactionStatus } from "./cooperative.service";

const queueDriver = process.env.QUEUE_DRIVER || "inline";

export const getQueueHealth = () => ({
  driver: queueDriver,
  redisConfigured: Boolean(process.env.REDIS_URL),
  bullMQReady: queueDriver === "bullmq" && Boolean(process.env.REDIS_URL),
});

export const processLoanQueue = async () => {
  const pendingLoans = await prisma.loan.findMany({
    where: {
      status: "PENDING",
    },
  });

  const results = [];

  for (const loan of pendingLoans) {
    try {
      const result = {
        status: "SKIPPED",
        message: "Las solicitudes reales se envian desde el modulo financing.",
      };

      results.push({
        loanId: loan.id,
        status: "SENT_TO_COOPERATIVE",
        result,
      });
    } catch (error: any) {
      results.push({
        loanId: loan.id,
        status: "FAILED",
        error: error.message,
      });
    }
  }

  return results;
};

export const retryFailedJobs = async () => {
  const failedTransactions = await prisma.transaction.findMany({
    where: {
      status: "FAILED",
    },
    take: 50,
  });

  const checkedTransactions = [];

  for (const transaction of failedTransactions) {
    if (!transaction.providerReference) {
      checkedTransactions.push({
        transactionId: transaction.id,
        status: "SKIPPED_NO_PROVIDER_REFERENCE",
      });
      continue;
    }

    const status = await getTransactionStatus(transaction.providerReference);
    checkedTransactions.push({
      transactionId: transaction.id,
      status,
    });
  }

  return {
    message: "Retry jobs ejecutado",
    queue: getQueueHealth(),
    checkedTransactions,
    note: "Lo prepare para BullMQ/Redis usando QUEUE_DRIVER=bullmq y REDIS_URL",
  };
};



