import { Request, Response } from "express";
import { PrismaProductRepository } from "../../../infrastructure/respositories/PrismaProductRepository";
import { CreateProductUseCase } from "../../../application/use-cases/product/CreateProductUseCase";
import { GetProductsUseCase } from "../../../application/use-cases/product/GetProductsUseCase";
import { GetProductByIdUseCase } from "../../../application/use-cases/product/GetProductByIdUseCase";
import { UpdateProductUseCase } from "../../../application/use-cases/product/UpdateProductUseCase";
import { DeleteProductUseCase } from "../../../application/use-cases/product/DeleteProductUseCase";
import { GetSellerProductsUseCase } from "../../../application/use-cases/product/GetSellerProductsUseCase";
import { AuthRequest } from "../../../middlewares/auth.middleware";

const productRepository = new PrismaProductRepository();

export const createProductController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const useCase = new CreateProductUseCase(productRepository);

    const product = await useCase.execute({
      ...req.body,
      sellerId: req.user?.id,
    });

    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getProductsController = async (req: Request, res: Response) => {
  try {
    const useCase = new GetProductsUseCase(productRepository);

    const result = await useCase.execute({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 12,
      search: req.query.search as string,
      category: req.query.category as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      sort: (req.query.sort as string) || "newest",
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getProductByIdController = async (req: Request, res: Response) => {
  try {
    const useCase = new GetProductByIdUseCase(productRepository);

    const product = await useCase.execute(req.params.productId as string);

    res.json(product);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProductController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const useCase = new UpdateProductUseCase(productRepository);

    const product = await useCase.execute(
      req.params.productId as string,
      req.body,
      req.user,
    );

    res.json(product);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProductController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const useCase = new DeleteProductUseCase(productRepository);

    const product = await useCase.execute(
      req.params.productId as string,
      req.user,
    );

    res.json(product);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getSellerProductsController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const useCase = new GetSellerProductsUseCase(productRepository);

    const sellerId =
      req.user?.role === "ADMIN" && req.params.sellerId
        ? req.params.sellerId
        : req.user?.id;

    const products = await useCase.execute(sellerId as string);

    res.json(products);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
