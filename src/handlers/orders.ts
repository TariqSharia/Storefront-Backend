import { Request, Response } from "express";
import { OrderStore } from "../models/order";
import verifyAuthToken from "../middleware/auth";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const store = new OrderStore();

// Helper to extract user id from JWT token
const getUserIdFromToken = (req: Request): number => {
  const authHeader = req.headers.authorization as string;
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
    user: { id: number };
  };
  return decoded.user.id;
};

// GET /orders - Current active order for the authenticated user
const currentOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserIdFromToken(req);
    const order = await store.currentOrder(userId);
    if (!order) {
      res.status(404).json({ error: "No active order found for this user." });
      return;
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Could not retrieve current order." });
  }
};

// GET /orders/:id - Show a specific order
const show = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as unknown as string);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid order ID." });
      return;
    }
    const order = await store.show(id);
    if (!order) {
      res.status(404).json({ error: `Order with id ${id} not found.` });
      return;
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Could not retrieve order." });
  }
};

// POST /orders - Create a new order
const create = async (req: Request, res: Response): Promise<void> => {
  const { user_id, status } = req.body;
  if (!user_id || !status) {
    res.status(400).json({ error: "user_id and status are required." });
    return;
  }
  try {
    const order = await store.create(req.body);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Could not create order." });
  }
};

// POST /orders/:id/products - Add a product to an order
const addProduct = async (req: Request, res: Response): Promise<void> => {
  const orderId = parseInt(req.params.id as unknown as string);
  const { product_id, quantity } = req.body;

  if (isNaN(orderId)) {
    res.status(400).json({ error: "Invalid order ID." });
    return;
  }
  if (!product_id || !quantity) {
    res.status(400).json({ error: "product_id and quantity are required." });
    return;
  }
  try {
    const result = await store.addProduct(quantity, orderId, product_id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: `Could not add product to order ${orderId}.` });
  }
};

// [OPTIONAL] GET /orders/completed/:user_id - Completed orders for a user
const completedOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.user_id as unknown as string);
    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID." });
      return;
    }
    const orders = await store.completedOrders(userId);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Could not retrieve completed orders." });
  }
};

const orderRoutes = (app: any) => {
  app.get("/orders/completed/:user_id", verifyAuthToken, completedOrders);
  app.get("/orders", verifyAuthToken, currentOrder);
  app.get("/orders/:id", verifyAuthToken, show);
  app.post("/orders", verifyAuthToken, create);
  app.post("/orders/:id/products", verifyAuthToken, addProduct);
};

export default orderRoutes;
