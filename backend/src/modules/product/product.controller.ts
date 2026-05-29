import { Request, Response } from "express";

import {
  createProduct,
  getProducts,
  searchProducts,
  updateProduct,
  deleteProduct,
  getProductById,
  getSellerProducts,
} from "./product.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const product = await createProduct({
      ...req.body,
      sellerId:
        req.user?.role === "ADMIN" && req.body.sellerId
          ? req.body.sellerId
          : req.user?.id,
    });
    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const products = await getProducts(
      Number(req.query.page) || 1,
      Number(req.query.limit) || 12,
      (req.query.search as string) || "",
      (req.query.category as string) || "",
      req.query.minPrice ? Number(req.query.minPrice) : undefined,
      req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      (req.query.sort as string) || "newest",
    );

    res.json(products);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const search = async (req: Request, res: Response) => {
  try {
    const products = await searchProducts({
      q: req.query.q as string | undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    });

    res.json(products);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const product = await updateProduct(req.params.id as string, req.body, req.user);

    res.json(product);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const product = await deleteProduct(req.params.id as string, req.user);

    res.json(product);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const product = await getProductById(req.params.id as string);
    res.json(product);
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const getSeller = async (req: Request, res: Response) => {
  try {
    const products = await getSellerProducts(req.params.sellerId as string);

    res.json(products);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};
