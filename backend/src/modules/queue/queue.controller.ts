import { Request, Response } from "express";
import {
  processLoanQueue,
  processPayoutQueue,
  retryFailedJobs,
} from "./queue.service";

export const payoutQueue = async (_req: Request, res: Response) => {
  try {
    const result = await processPayoutQueue();
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const loanQueue = async (_req: Request, res: Response) => {
  try {
    const result = await processLoanQueue();
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const retryJobs = async (_req: Request, res: Response) => {
  try {
    const result = await retryFailedJobs();
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
