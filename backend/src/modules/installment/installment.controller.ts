import { Request, Response } from "express";
import { payInstallment } from "./installment.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const pay = async (req: AuthRequest, res: Response) => {
  try {
    const installment = await payInstallment(
      req.params.installmentId as string,
      req.user?.id,
      req.headers["idempotency-key"] as string | undefined,
    );

    res.json(installment);
  } catch (error: any) {
    console.log("ERROR PAY INSTALLMENT:", error.message);

    res.status(400).json({
      message: error.message,
    });
  }
};
