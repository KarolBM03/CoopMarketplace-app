import { Request, Response } from "express";
import prisma from "../../../../infrastructure/database/prisma";
import { processCooperativeEvent } from "../../../../infrastructure/external-services/cooperative-webhook.service";

export const cooperativeWebhookController = async (
  req: Request,
  res: Response,
) => {
  try {
    const secret = req.headers["x-coop-secret"];

    if (secret !== process.env.COOP_WEBHOOK_SECRET) {
      return res.status(401).json({
        message: "Webhook no autorizado",
      });
    }

    const payload = req.body;
    const event = payload.event;
    const externalId =
      payload.externalLoanId ||
      payload.externalServiceId ||
      payload.externalPaymentId ||
      null;

    await prisma.cooperativeWebhookEvent.create({
      data: {
        event,
        externalId,
        payload,
        processed: false,
      },
    });

    await processCooperativeEvent(payload);

    const webhookEvent = await prisma.cooperativeWebhookEvent.create({
      data: {
        event,
        externalId,
        payload,
        processed: false,
      },
    });

    await processCooperativeEvent(payload);

    await prisma.cooperativeWebhookEvent.update({
      where: {
        id: webhookEvent.id,
      },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    });

    return res.json({
      message: "Webhook recibido",
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "No pude recibir el webhook",
    });
  }
};
