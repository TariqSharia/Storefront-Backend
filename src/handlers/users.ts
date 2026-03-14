import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UserStore } from "../models/user";
import verifyAuthToken from "../middleware/auth";

dotenv.config();

const store = new UserStore();

const index = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await store.index();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Could not retrieve users." });
  }
};

const show = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as unknown as string);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid user ID." });
      return;
    }
    const user = await store.show(id);
    if (!user) {
      res.status(404).json({ error: `User with id ${id} not found.` });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Could not retrieve user." });
  }
};

const create = async (req: Request, res: Response): Promise<void> => {
  const { username, firstname, lastname, password } = req.body;
  if (!username || !firstname || !lastname || !password) {
    res.status(400).json({ error: "username, firstname, lastname and password are required." });
    return;
  }
  try {
    const user = await store.create({ username, firstname, lastname, password });
    const token = jwt.sign({ user }, process.env.JWT_SECRET as string);
    res.json({ user, token });
  } catch (err: any) {
    if (err.status === 409) {
      res.status(409).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: "Could not create user." });
  }
};

const update = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id as unknown as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid user ID." });
    return;
  }
  const { username, firstname, lastname, password } = req.body;
  if (username === undefined && firstname === undefined && lastname === undefined && password === undefined) {
    res.status(400).json({ error: "At least one of username, firstname, lastname or password is required for update." });
    return;
  }
  try {
    const user = await store.update(id, { username, firstname, lastname, password });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Could not update user." });
  }
};

const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id as unknown as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid user ID." });
    return;
  }
  try {
    await store.delete(id);
    res.json({ message: `User with id ${id} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ error: "Could not delete user." });
  }
};

const authenticate = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "username and password are required." });
    return;
  }
  try {
    const user = await store.authenticate(username, password);
    if (!user) {
      res.status(401).json({ error: "Invalid username or password." });
      return;
    }
    const token = jwt.sign({ user }, process.env.JWT_SECRET as string);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: "Authentication failed." });
  }
};

const userRoutes = (app: any) => {
  app.get("/users", verifyAuthToken, index);
  app.get("/users/:id", verifyAuthToken, show);
  app.post("/users", create);
  app.post("/users/authenticate", authenticate);
  app.patch("/users/:id", verifyAuthToken, update);
  app.delete("/users/:id", verifyAuthToken, deleteUser);
};

export default userRoutes;
