import { FinancingStatus } from "@prisma/client";
import prisma from "../database/prisma";

export const processCooperativeEvent = async (payload: any) => {
  switch (payload.event) {
    case "loan.approved":
      await prisma.financing.updateMany({
        where: {
          externalLoanId: payload.externalLoanId,
        },
        data: {
          status: FinancingStatus.APPROVED_BY_COOPERATIVE,
          externalStatus: "APPROVED",
          approvedAt: new Date(),
          approvedAmount: payload.approvedAmount,
          approvedMonths: payload.approvedMonths,
          approvedMonthlyPayment: payload.approvedMonthlyPayment,
          cooperativeResponse: payload,
        },
      });
      break;

    case "loan.rejected":
      await prisma.financing.updateMany({
        where: {
          externalLoanId: payload.externalLoanId,
        },
        data: {
          status: FinancingStatus.REJECTED,
          externalStatus: "REJECTED",
          rejectedAt: new Date(),
          rejectionReason: payload.reason || payload.message,
          cooperativeResponse: payload,
        },
      });
      break;

    case "down_payment.paid":
      await prisma.financing.updateMany({
        where: {
          externalLoanId: payload.externalLoanId,
        },
        data: {
          status: FinancingStatus.ACTIVE,
          externalStatus: "DOWN_PAYMENT_PAID",
          activatedAt: new Date(),
          cooperativeResponse: payload,
        },
      });
      break;

    case "service.paid":
      await prisma.serviceRequest.updateMany({
        where: {
          id: payload.serviceRequestId,
        },
        data: {
          status: "ASSIGNED",
          amount: payload.amount,
          providerExternalId: payload.providerExternalId,
          providerName: payload.providerName,
          cooperativeResponse: payload,
        },
      });
      break;

    case "service.completed":
      await prisma.serviceRequest.updateMany({
        where: {
          id: payload.serviceRequestId,
        },
        data: {
          status: "COMPLETED",
          cooperativeResponse: payload,
        },
      });
      break;

    default:
      break;
  }
};
