import { OrderStore } from "../../models/order";
import pool from "../../database";
import { UserStore } from "../../models/user";
import { ProductStore } from "../../models/product";

const orderStore = new OrderStore();
const productStore = new ProductStore();
const userStore = new UserStore();

describe("Order Model", () => {
  let createdOrderId: number;
  let createdUserId: number;
  let createdProductId: number;

  beforeAll(async () => {
    const conn = await pool.connect();
    await conn.query("DELETE FROM order_products");
    await conn.query("DELETE FROM orders");
    await conn.query("DELETE FROM users WHERE username='testuser'");
    await conn.query("DELETE FROM products WHERE name='Testing Product'");
    conn.release();

    const userResult = await userStore.create({
      username: "testuser",
      firstname: "Test",
      lastname: "User",
      password: "password123",
    });
    createdUserId = userResult.id as number;

    const productResult = await productStore.create({
      name: "Testing Product",
      price: 5.98,
      category: "Testing Category",
    });
    createdProductId = productResult.id as number;
  });

  afterAll(async () => {
    const conn = await pool.connect();
    await conn.query("DELETE FROM order_products");
    await conn.query("DELETE FROM orders");
    await conn.query("DELETE FROM users WHERE username='testuser'");
    await conn.query("DELETE FROM products WHERE name='Testing Product'");
    conn.release();
  });

  it("should have an index method", () => {
    expect(orderStore.index).toBeDefined();
  });

  it("should have a show method", () => {
    expect(orderStore.show).toBeDefined();
  });

  it("should have a create method", () => {
    expect(orderStore.create).toBeDefined();
  });

  it("should have an addProduct method", () => {
    expect(orderStore.addProduct).toBeDefined();
  });

  it("should have a currentOrder method", () => {
    expect(orderStore.currentOrder).toBeDefined();
  });

  it("should have a completedOrders method", () => {
    expect(orderStore.completedOrders).toBeDefined();
  });

  it("create method should add an active order", async () => {
    const result = await orderStore.create({
      user_id: createdUserId,
      status: "active",
    });
    createdOrderId = result.id as number;
    expect(result.user_id).toEqual(createdUserId);
    expect(result.status).toEqual("active");
  });

  it("index method should return a list of orders", async () => {
    const result = await orderStore.index();
    expect(result.length).toBeGreaterThan(0);
  });

  it("show method should return the correct order", async () => {
    const result = await orderStore.show(createdOrderId);
    expect(result).not.toBeNull();
    expect(result!.user_id).toEqual(createdUserId);
    expect(result!.status).toEqual("active");
  });

  it("show method should return null for non-existent order", async () => {
    const result = await orderStore.show(999999);
    expect(result).toBeNull();
  });

  it("addProduct method should add a product to the order", async () => {
    const result = await orderStore.addProduct(3, createdOrderId, createdProductId);
    expect(result.order_id).toEqual(createdOrderId);
    expect(result.product_id).toEqual(createdProductId);
    expect(result.quantity).toEqual(3);
  });

  it("currentOrder method should return the active order for a user", async () => {
    const result = await orderStore.currentOrder(createdUserId);
    expect(result).not.toBeNull();
    expect(result!.user_id).toEqual(createdUserId);
    expect(result!.status).toEqual("active");
  });

  it("currentOrder method should return null when no active order exists", async () => {
    const result = await orderStore.currentOrder(999999);
    expect(result).toBeNull();
  });

  it("completedOrders method should return completed orders for a user", async () => {
    // Create a completed order first
    await orderStore.create({ user_id: createdUserId, status: "complete" });
    const result = await orderStore.completedOrders(createdUserId);
    expect(result.length).toBeGreaterThan(0);
    result.forEach((o) => expect(o.status).toEqual("complete"));
  });

  it("completedOrders method should return empty array when no completed orders", async () => {
    const result = await orderStore.completedOrders(999999);
    expect(result).toEqual([]);
  });
});
