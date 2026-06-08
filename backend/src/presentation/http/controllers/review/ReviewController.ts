import { Response, Request } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { CreateProductReviewUseCase } from "../../../../application/use-cases/review/CreateProductReviewUseCase";
import { GetProductReviewsUseCase } from "../../../../application/use-cases/review/GetProductReviewsUseCase";

export const createProductReviewController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const useCase = new CreateProductReviewUseCase();

    const result = await useCase.execute({
      productId: req.params.productId as string,
      customerId: req.user?.id as string,
      orderId: req.body.orderId,
      rating: Number(req.body.rating),
      comment: req.body.comment,
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "No pude guardar tu opinión",
    });
  }
};

export const getProductReviewsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const useCase = new GetProductReviewsUseCase();

    const reviews = await useCase.execute(req.params.productId as string);

    res.json(reviews);
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "No pude cargar las opiniones",
    });
  }
};
