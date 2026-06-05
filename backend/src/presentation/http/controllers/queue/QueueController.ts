import { Request, Response } from "express";
import {
  processLoanQueue,
  retryFailedJobs,
} from "../../../../infrastructure/external-services/queue.service";

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



