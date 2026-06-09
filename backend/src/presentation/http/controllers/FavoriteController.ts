import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  AddFavoriteUseCase,
  GetMyFavoritesUseCase,
  RemoveFavoriteUseCase,
} from "../../../application/use-cases/favorite/FavoriteUseCases";

export const addFavoriteController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const useCase = new AddFavoriteUseCase();

    const result = await useCase.execute(
      req.user?.id as string,
      req.params.productId as string,
    );

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "No pude guardar este producto",
    });
  }
};

export const getMyFavoritesController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const useCase = new GetMyFavoritesUseCase();

    const favorites = await useCase.execute(req.user?.id as string);

    res.json(favorites);
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "No pude cargar tus favoritos",
    });
  }
};

export const removeFavoriteController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const useCase = new RemoveFavoriteUseCase();

    const result = await useCase.execute(
      req.user?.id as string,
      req.params.productId as string,
    );

    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "No pude quitar este producto",
    });
  }
};
