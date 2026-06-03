import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { savePushToken } from "./push.service";

export const registerPushToken = async (req: AuthRequest, res: Response) => {
  try {
    const pushToken = await savePushToken({
      userId: req.user?.id as string,
      token: req.body.token,
      platform: req.body.platform || "WEB",
    });

    res.status(201).json(pushToken);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};
