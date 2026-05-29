import { Request, Response } from "express";
import { getPlatformMetrics } from "./admin.service";
import { generateFinancialReport } from "./admin.service";
import { getUsers } from "./admin.service";
import { getFraudAlerts } from "./admin.service";
import { blockUser, deleteUser, unblockUser } from "./admin.service";
import { approveSeller, rejectSeller, getSellers } from "./admin.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const metrics = async (_req: Request, res: Response) => {
  try {
    const data = await getPlatformMetrics();

    res.json(data);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const financialReport = async (_req: Request, res: Response) => {
  try {
    const report = await generateFinancialReport();

    res.json(report);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getAllFraudAlerts = async (_req: Request, res: Response) => {
  try {
    const alerts = await getFraudAlerts();
    res.json(alerts);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const blockUserController = async (req: AuthRequest, res: Response) => {
  try {
    const user = await blockUser(req.params.userId as string, req.user?.id);

    res.json(user);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const unblockUserController = async (req: AuthRequest, res: Response) => {
  try {
    const user = await unblockUser(req.params.userId as string, req.user?.id);

    res.json(user);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const deleteUserController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId as string;

    if (req.user?.id === userId) {
      throw new Error("No puedes eliminar tu propio usuario");
    }

    const user = await deleteUser(userId, req.user?.id);

    res.json({
      message: "Usuario eliminado correctamente",
      user,
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const approveSellerController = async (req: AuthRequest, res: Response) => {
  try {
    const seller = await approveSeller(req.params.userId as string, req.user?.id);
    res.json(seller);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const rejectSellerController = async (req: AuthRequest, res: Response) => {
  try {
    const seller = await rejectSeller(req.params.userId as string, req.user?.id);
    res.json(seller);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getSellersController = async (req: Request, res: Response) => {
  try {
    const sellers = await getSellers();

    res.json(sellers);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};
