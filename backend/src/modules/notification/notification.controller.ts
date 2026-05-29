import { Request, Response } from "express";
import { getNotificationsByUser } from "../../services/notification.service";

export const getByUser = async (req: Request, res: Response) => {
  try {
    const notifications = await getNotificationsByUser(
      req.params.userId as string,
      Number(req.query.page) || 1,
      Number(req.query.limit) || 10,
    );

    res.json(notifications);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};
