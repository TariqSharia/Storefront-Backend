import supertest from "supertest";
import app from "../../server";
import pool from "../../database";

const request = supertest(app);

describe("Orders Handler", () => {
  let token: string;
  let orderId: number;
  let userId: number;
  let productId: number;

  beforeAll(async () => {
    const userResponse = await request.post("/users").send({
      username: "orderTestUser",
      firstname: "Order",
      lastname: "Tester",
      password: "orderTestPassword",
    });
    token = userResponse.body.token;
    userId = userResponse.body.user.id;

    const productResponse = await request
      .post("/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Order Test Product",
        price: 59.8,
        category: "Order Test Category",
      });
    productId = productResponse.body.id;
  });

  afterAll(async () => {
    const conn = await pool.connect();
    await conn.query(
      "DELETE FROM order_products WHERE order_id IN (SELECT id FROM orders WHERE user_id=$1)",
      [userId]
    );
    await conn.query("DELETE FROM orders WHERE user_id=$1", [userId]);
    await conn.query("DELETE FROM products WHERE name='Order Test Product'");
    await conn.query("DELETE FROM users WHERE username='orderTestUser'");
    conn.release();
  });

  it("POST /orders - creates a new order with valid token", async () => {
    const response = await request
      .post("/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ user_id: userId, status: "active" });
    expect(response.status).toBe(200);
    expect(response.body.user_id).toBe(userId);
    expect(response.body.status).toBe("active");
    orderId = response.body.id;
  });

  it("POST /orders - returns 400 when required fields are missing", async () => {
    const response = await request
      .post("/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ user_id: userId });
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it("POST /orders - returns 401 without token", async () => {
    const response = await request
      .post("/orders")
      .send({ user_id: userId, status: "active" });
    expect(response.status).toBe(401);
  });

  it("POST /orders - returns 401 with invalid token", async () => {
    const response = await request
      .post("/orders")
      .set("Authorization", "Bearer invalidtoken")
      .send({ user_id: userId, status: "active" });
    expect(response.status).toBe(401);
  });

  it("GET /orders - returns current active order for authenticated user", async () => {
    const response = await request
      .get("/orders")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.user_id).toBe(userId);
    expect(response.body.status).toBe("active");
  });

  it("GET /orders - returns 401 without token", async () => {
    const response = await request.get("/orders");
    expect(response.status).toBe(401);
  });

  it("GET /orders/:id - returns an order by id", async () => {
    const response = await request
      .get(`/orders/${orderId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(orderId);
  });

  it("GET /orders/:id - returns 404 for non-existent order", async () => {
    const response = await request
      .get("/orders/999999")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(404);
  });

  it("POST /orders/:id/products - adds a product to an order", async () => {
    const response = await request
      .post(`/orders/${orderId}/products`)
      .set("Authorization", `Bearer ${token}`)
      .send({ product_id: productId, quantity: 2 });
    expect(response.status).toBe(200);
    expect(response.body.order_id).toBe(orderId);
    expect(response.body.product_id).toBe(productId);
    expect(response.body.quantity).toBe(2);
  });

  it("POST /orders/:id/products - returns 400 when fields are missing", async () => {
    const response = await request
      .post(`/orders/${orderId}/products`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 2 });
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it("POST /orders/:id/products - returns 401 without token", async () => {
    const response = await request
      .post(`/orders/${orderId}/products`)
      .send({ product_id: productId, quantity: 2 });
    expect(response.status).toBe(401);
  });

  it("POST /orders/:id/products - returns 401 with invalid token", async () => {
    const response = await request
      .post(`/orders/${orderId}/products`)
      .set("Authorization", "Bearer invalidtoken")
      .send({ product_id: productId, quantity: 2 });
    expect(response.status).toBe(401);
  });

  it("GET /orders/completed/:user_id - returns completed orders for user", async () => {
    // Create a completed order first
    await request
      .post("/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ user_id: userId, status: "complete" });

    const response = await request
      .get(`/orders/completed/${userId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    response.body.forEach((o: any) => expect(o.status).toBe("complete"));
  });

  it("GET /orders/completed/:user_id - returns 401 without token", async () => {
    const response = await request.get(`/orders/completed/${userId}`);
    expect(response.status).toBe(401);
  });
});
