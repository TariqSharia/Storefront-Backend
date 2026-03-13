import { Request, Response } from "express";
import { ProductStore } from "../models/product";
import verifyAuthToken from "../middleware/auth";

const store = new ProductStore();

const index = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await store.index();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Could not retrieve products." });
  }
};

const show = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as unknown as string);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid product ID." });
      return;
    }
    const product = await store.show(id);
    if (!product) {
      res.status(404).json({ error: `Product with id ${id} not found.` });
      return;
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Could not retrieve product." });
  }
};

const create = async (req: Request, res: Response): Promise<void> => {
  const { name, price } = req.body;
  if (!name || price === undefined) {
    res.status(400).json({ error: "name and price are required." });
    return;
  }
  try {
    const product = await store.create(req.body);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Could not create product." });
  }
};

// [OPTIONAL] GET /products/popular - Top 5 most popular products
const topFivePopular = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await store.topFivePopular();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Could not retrieve popular products." });
  }
};

// [OPTIONAL] GET /products/category/:category - Products by category
const byCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const products = await store.byCategory(category as unknown as string);
    if (!products.length) {
      res.status(404).json({ error: `No products found in category '${category}'.` });
      return;
    }
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Could not retrieve products by category." });
  }
};

const productRoutes = (app: any) => {
  app.get("/products/popular", topFivePopular);
  app.get("/products/category/:category", byCategory);
  app.get("/products", index);
  app.get("/products/:id", show);
  app.post("/products", verifyAuthToken, create);
};

export default productRoutes;
