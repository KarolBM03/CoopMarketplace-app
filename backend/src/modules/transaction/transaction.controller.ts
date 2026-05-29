import { Request, Response } from "express";
import { getTransactionsByUser } from "../../services/transaction.service";

export const getByUser = async (req: Request, res: Response) => {
  try {
    const transactions = await getTransactionsByUser(
      req.params.userId as string,
    );

    res.json(transactions);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};
