import { Request, Response } from "express";
import crypto from "crypto";
import prisma from "../../../../infrastructure/database/prisma";
import { processCooperativeEvent } from "../../../../infrastructure/external-services/cooperative-webhook.service";

const safeEqual = (a?: string, b?: string) => {
  if (!a || !b) return false;

  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

export const cooperativeWebhookController = async (
  req: Request,
  res: Response,
) => {
  let webhookEventId: string | null = null;

  try {
    const configuredSecret = process.env.COOP_WEBHOOK_SECRET;
    const receivedSecret = String(req.headers["x-coop-secret"] || "");

    if (!configuredSecret || !safeEqual(receivedSecret, configuredSecret)) {
      return res.status(401).json({
        message: "Webhook no autorizado",
      });
    }

    const payload = req.body;
    const event = payload.event;
    const externalId =
      payload.eventId ||
      payload.externalLoanId ||
      payload.externalServiceId ||
      payload.externalPaymentId ||
      null;

    if (payload.eventId) {
      const previousEvent = await prisma.cooperativeWebhookEvent.findFirst({
        where: {
          event,
          externalId: payload.eventId,
          processed: true,
        },
      });

      if (previousEvent) {
        return res.json({
          message: "Webhook ya procesado",
          idempotent: true,
        });
      }
    }

    const webhookEvent = await prisma.cooperativeWebhookEvent.create({
      data: {
        event,
        externalId,
        payload,
        processed: false,
      },
    });
    webhookEventId = webhookEvent.id;

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
    if (webhookEventId) {
      await prisma.cooperativeWebhookEvent.update({
        where: { id: webhookEventId },
        data: {
          processed: false,
          errorMessage: error.message || "Error procesando webhook",
        },
      });
    }

    return res.status(400).json({
      message: error.message || "No pude recibir el webhook",
    });
  }
};
