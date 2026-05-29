import prisma from "../../config/prisma";
import {
  sendSellerApprovedEmail,
  sendSellerRejectedEmail,
} from "../../services/email.service";
import { createAuditLog } from "../../services/audit.service";

export const getPlatformMetrics = async () => {
  const [
    users,
    products,
    orders,
    paidOrders,
    completedOrders,
    financings,
    activeFinancings,
    lateFinancings,
    transactions,
    fraudAlerts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.financing.count(),
    prisma.financing.count({ where: { status: "ACTIVE" } }),
    prisma.financing.count({ where: { status: "LATE" } }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS" },
    }),
    prisma.fraudAlert.count({
      where: { resolved: false },
    }),
  ]);

  return {
    users,
    products,
    orders,
    paidOrders,
    completedOrders,
    financings,
    activeFinancings,
    lateFinancings,
    totalTransactionAmount: transactions._sum.amount || 0,
    unresolvedFraudAlerts: fraudAlerts,
  };
};

export const generateFinancialReport = async () => {
  const [
    payments,
    credits,
    debits,
    paidOrders,
    completedOrders,
    activeFinancings,
    lateFinancings,
    fraudAlerts,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        type: "PAYMENT",
        status: "SUCCESS",
      },
    }),

    prisma.ledgerEntry.aggregate({
      _sum: { amount: true },
      where: {
        type: "CREDIT",
      },
    }),

    prisma.ledgerEntry.aggregate({
      _sum: { amount: true },
      where: {
        type: "DEBIT",
      },
    }),

    prisma.order.count({
      where: {
        status: "PAID",
      },
    }),

    prisma.order.count({
      where: {
        status: "COMPLETED",
      },
    }),

    prisma.financing.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.financing.count({
      where: {
        status: "LATE",
      },
    }),

    prisma.fraudAlert.count({
      where: {
        resolved: false,
      },
    }),
  ]);

  return {
    totalPayments: payments._sum.amount || 0,
    totalCredits: credits._sum.amount || 0,
    totalDebits: debits._sum.amount || 0,
    paidOrders,
    completedOrders,
    activeFinancings,
    lateFinancings,
    unresolvedFraudAlerts: fraudAlerts,
  };
};

export const getUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      isVerified: true,
      isBlocked: true,
      storeName: true,
      mainCategory: true,
      city: true,
      documentId: true,
      bankAccount: true,
      identityImageUrl: true,
      sellerStatus: true,
      acceptedTerms: true,
      createdAt: true,
      wallet: {
        select: {
          balance: true,
          frozenBalance: true,
        },
      },
      products: {
        select: {
          id: true,
        },
      },
      orders: {
        select: {
          id: true,
        },
      },
      financings: {
        select: {
          id: true,
          status: true,
        },
      },
      payouts: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getFraudAlerts = async () => {
  const alerts = await prisma.fraudAlert.findMany({
    where: {
      resolved: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: alerts.map((alert) => alert.userId),
      },
    },
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  });

  return alerts.map((alert) => ({
    ...alert,
    user: users.find((user) => user.id === alert.userId) || null,
  }));
};

export const blockUser = async (userId: string, actorId?: string) => {
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isBlocked: true,
    },
  });

  await createAuditLog({
    userId: actorId,
    action: "USER_BLOCK",
    entity: "USER",
    entityId: userId,
    description: "Usuario bloqueado por admininistrador",
  });

  return user;
};

export const unblockUser = async (userId: string, actorId?: string) => {
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isBlocked: false,
    },
  });

  await createAuditLog({
    userId: actorId,
    action: "USER_UNBLOCK",
    entity: "USER",
    entityId: userId,
    description: "Usuario desbloqueado por admininistrador",
  });

  return user;
};

export const deleteUser = async (userId: string, actorId?: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const deletedUser = await prisma.$transaction(async (tx) => {
    const userProducts = await tx.product.findMany({
      where: {
        sellerId: userId,
      },
      select: {
        id: true,
      },
    });

    const productIds = userProducts.map((product) => product.id);

    const financingFilters: any[] = [
      {
        customerId: userId,
      },
    ];

    if (productIds.length) {
      financingFilters.push({
        productId: {
          in: productIds,
        },
      });
    }

    const financings = await tx.financing.findMany({
      where: {
        OR: financingFilters,
      },
      select: {
        id: true,
      },
    });

    const financingIds = financings.map((financing) => financing.id);

    const userOrders = await tx.order.findMany({
      where: {
        customerId: userId,
      },
      select: {
        id: true,
      },
    });

    const orderIds = userOrders.map((order) => order.id);

    if (financingIds.length) {
      await tx.installment.deleteMany({
        where: {
          financingId: {
            in: financingIds,
          },
        },
      });

      await tx.financing.deleteMany({
        where: {
          id: {
            in: financingIds,
          },
        },
      });
    }

    if (productIds.length) {
      await tx.orderItem.deleteMany({
        where: {
          productId: {
            in: productIds,
          },
        },
      });

      await tx.product.deleteMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });
    }

    if (orderIds.length) {
      await tx.orderItem.deleteMany({
        where: {
          orderId: {
            in: orderIds,
          },
        },
      });

      await tx.order.deleteMany({
        where: {
          id: {
            in: orderIds,
          },
        },
      });
    }

    await tx.loan.deleteMany({
      where: {
        userId,
      },
    });

    await tx.payout.deleteMany({
      where: {
        sellerId: userId,
      },
    });

    await tx.wallet.deleteMany({
      where: {
        userId,
      },
    });

    await tx.notification.deleteMany({
      where: {
        userId,
      },
    });

    await tx.ledgerEntry.deleteMany({
      where: {
        userId,
      },
    });

    await tx.transaction.deleteMany({
      where: {
        userId,
      },
    });

    await tx.auditLog.deleteMany({
      where: {
        userId,
      },
    });

    await tx.fraudAlert.deleteMany({
      where: {
        userId,
      },
    });

    return await tx.user.delete({
      where: {
        id: userId,
      },
    });
  });

  await createAuditLog({
    userId: actorId,
    action: "USER_DELETE",
    entity: "USER",
    entityId: userId,
    description: "Usuario eliminado por admininistrador",
    metadata: { deletedEmail: user.email, deletedRole: user.role },
  });

  return deletedUser;
};

export const approveSeller = async (userId: string, actorId?: string) => {
  const seller = await prisma.user.update({
    where: { id: userId },
    data: {
      sellerStatus: "APPROVED",
    },
  });

  await sendSellerApprovedEmail(seller.email, seller.fullName);

  await createAuditLog({
    userId: actorId,
    action: "SELLER_APPROVE",
    entity: "USER",
    entityId: userId,
    description: "Vendedor aprobado por admininistrador",
  });

  return seller;
};

export const rejectSeller = async (userId: string, actorId?: string) => {
  const seller = await prisma.user.update({
    where: { id: userId },
    data: {
      sellerStatus: "REJECTED",
    },
  });

  await sendSellerRejectedEmail(seller.email, seller.fullName);

  await createAuditLog({
    userId: actorId,
    action: "SELLER_REJECT",
    entity: "USER",
    entityId: userId,
    description: "Vendedor rechazado por administrador",
  });

  return seller;
};

export const getSellers = async () => {
  return await prisma.user.findMany({
    where: {
      role: "SELLER",
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      isVerified: true,
      isBlocked: true,
      storeName: true,
      mainCategory: true,
      city: true,
      documentId: true,
      bankAccount: true,
      identityImageUrl: true,
      sellerStatus: true,
      acceptedTerms: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
