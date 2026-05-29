import prisma from "../../config/prisma";
import { createNotification } from "../../services/notification.service";

export const checkOverdueInstallments = async () => {
  const today = new Date();

  const overdueInstallments = await prisma.installment.findMany({
    where: {
      paid: false,
      dueDate: {
        lt: today,
      },
      status: "PENDING",
    },

    include: {
      financing: true,
    },
  });

  for (const installment of overdueInstallments) {
    await prisma.installment.update({
      where: {
        id: installment.id,
      },
      data: {
        status: "OVERDUE",
      },
    });

    await createNotification(
      installment.financing.customerId,
      "Cuota vencida",
      `Tu cuota #${installment.number} está vencida`,
    );
  }

  console.log(`Cuotas vencidas detectadas: ${overdueInstallments.length}`);
};
