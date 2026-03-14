import { OrderProductStore } from "../../models/orderProduct";
import { OrderStore } from "../../models/order";
import { ProductStore } from "../../models/product";
import { UserStore } from "../../models/user";
import pool from "../../database";

const orderProductStore = new OrderProductStore();
const orderStore = new OrderStore();
const productStore = new ProductStore();
const userStore = new UserStore();

describe("OrderProduct Model", () => {
  let orderPorductId: number;
  let orderId: number;
  let productId: number;
  let userId: number;

  beforeAll(async () => {
    const conn = await pool.connect();
    await conn.query("DELETE FROM order_products");
    await conn.query("DELETE FROM orders");
    await conn.query(
      "DELETE FROM products WHERE name='OrderProduct Test Product'",
    );
    await conn.query("DELETE FROM users WHERE username='orderProductTestUser'");
    conn.release();

    const userResult = await userStore.create({
      username: "orderProductTestUser",
      firstname: "OrderProduct",
      lastname: "TestUser",
      password: "password123",
    });
    userId = userResult.id as number;

    const productResult = await productStore.create({
      name: "OrderProduct Test Product",
      price: 9.99,
      category: "Test Category",
    });
    productId = productResult.id as number;

    const orderResult = await orderStore.create({
      user_id: userId,
      status: "active",
    });
    orderId = orderResult.id as number;
  });
  afterAll(async () => {
    const conn = await pool.connect();
    await conn.query("DELETE FROM order_products");
    await conn.query("DELETE FROM orders");
    await conn.query(
      "DELETE FROM products WHERE name='OrderProduct Test Product'",
    );
    await conn.query("DELETE FROM users WHERE username='orderProductTestUser'");
    conn.release();
  });

  it("should have an index method", async () => {
    expect(orderProductStore.index).toBeDefined();
  });

  it("should have a show method", () => {
    expect(orderProductStore.show).toBeDefined();
  });

  it("should have a create method", () => {
    expect(orderProductStore.create).toBeDefined();
  });

  it("should have an update method", () => {
    expect(orderProductStore.update).toBeDefined();
  });

  it("should have a delete method", () => {
    expect(orderProductStore.delete).toBeDefined();
  });

  it("should have a productsByOrder method", () => {
    expect(orderProductStore.productsByOrder).toBeDefined();
  });

  it("should have a totalQuantityByProduct method", () => {
    expect(orderProductStore.totalQuantityByProduct).toBeDefined();
  });

  it("create method should add an order product", async () => {
    const result = await orderProductStore.create({
      quantity: 2,
      order_id: orderId,
      product_id: productId,
    });
    orderPorductId = result.id as number;
    expect(result.quantity).toEqual(2);
    expect(result.order_id).toEqual(orderId);
    expect(result.product_id).toEqual(productId);
  });

  it("index method should return a list of order products", async () => {
    const result = await orderProductStore.index();
    expect(result.length).toBeGreaterThan(0);
  });

  it("show method should return the correct order product", async () => {
    const result = await orderProductStore.show(orderPorductId);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.id).toEqual(orderPorductId);
      expect(result.quantity).toEqual(2);
      expect(result.order_id).toEqual(orderId);
      expect(result.product_id).toEqual(productId);
    }
  });

  it("update method should update the quantity of an order product", async () => {
    const result = await orderProductStore.update(orderPorductId, {
      quantity: 5,
    });
    expect(result.id).toEqual(orderPorductId);
    expect(result.quantity).toEqual(5);
    expect(result.order_id).toEqual(orderId);
    expect(result.product_id).toEqual(productId);
  });
  it("update method should persist the changes in the database", async () => {
    const result = await orderProductStore.show(orderPorductId);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.quantity).toEqual(5);
    }
  });
  it("productsByOrder method should return all products in an order", async () => {
    const result = await orderProductStore.productsByOrder(orderId);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].order_id).toEqual(orderId);
  });

  it("totalQuantityByProduct method should return the total quantity of a product", async () => {
    const result = await orderProductStore.totalQuantityByProduct(productId);
    expect(result).toBeGreaterThan(0);
  });

  it("delete method should remove an order product", async () => {
    await orderProductStore.delete(orderPorductId);
    const result = await orderProductStore.show(orderPorductId);
    expect(result).toBeNull();
  });

  it("delete method should persist the deletion in the database", async () => {
    const result = await orderProductStore.index();
    const deleted = result.find((op) => op.id === orderPorductId);
    expect(deleted).toBeUndefined();
  });
});
