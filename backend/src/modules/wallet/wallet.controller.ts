import { Request, Response } from "express";
import { getWalletByUser } from "../../services/wallet.service";
import { rechargeWallet } from "../../services/wallet.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const getByUser = async (req: Request, res: Response) => {
  try {
    const wallet = await getWalletByUser(req.params.userId as string);

    res.json(wallet);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getMyWallet = async (req: AuthRequest, res: Response) => {
  try {
    const wallet = await getWalletByUser(req.user!.id);
    res.json(wallet);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const recharge = async (req: AuthRequest, res: Response) => {
  try {
    const userId =
      req.user?.role === "ADMIN" && req.body.userId
        ? req.body.userId
        : req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const wallet = await rechargeWallet(
      userId,
      Number(req.body.amount),
      req.headers["idempotency-key"] as string | undefined,
    );

    res.json(wallet);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};
