import supertest from "supertest";
import app from "../../server";
import pool from "../../database";

const request = supertest(app);

describe("Products Handler", () => {
  let token: string;
  let productId: number;

  beforeAll(async () => {
    const userResponse = await request.post("/users").send({
      username: "productTestUser",
      firstname: "Product",
      lastname: "Tester",
      password: "testpassword",
    });
    token = userResponse.body.token;

    const conn = await pool.connect();
    await conn.query("DELETE FROM products WHERE name IN ('Test Product', 'Category Product')");
    conn.release();
  });

  afterAll(async () => {
    const conn = await pool.connect();
    await conn.query("DELETE FROM products WHERE name IN ('Test Product', 'Category Product')");
    await conn.query("DELETE FROM users WHERE username='productTestUser'");
    conn.release();
  });

  it("POST /products - creates a product with valid token", async () => {
    const response = await request
      .post("/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Product",
        price: 59.99,
        category: "Test Category",
      });
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Test Product");
    productId = response.body.id;
  });

  it("POST /products - returns 400 when required fields are missing", async () => {
    const response = await request
      .post("/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ category: "Missing Fields" });
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it("POST /products - returns 401 without token", async () => {
    const response = await request.post("/products").send({
      name: "Unauthorized Product",
      price: 19.99,
    });
    expect(response.status).toBe(401);
  });

  it("POST /products - returns 401 with invalid token", async () => {
    const response = await request
      .post("/products")
      .set("Authorization", "Bearer invalidtoken")
      .send({ name: "Bad Token Product", price: 9.99 });
    expect(response.status).toBe(401);
  });

  it("GET /products - returns list of products", async () => {
    const response = await request.get("/products");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("GET /products/:id - returns a product by id", async () => {
    const response = await request.get(`/products/${productId}`);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Test Product");
  });

  it("GET /products/:id - returns 404 for non-existent product", async () => {
    const response = await request.get("/products/999999");
    expect(response.status).toBe(404);
  });

  it("GET /products/popular - returns top 5 popular products", async () => {
    const response = await request.get("/products/popular");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(5);
  });

  it("GET /products/category/:category - returns products by category", async () => {
    // Create a product in a specific category first
    await request
      .post("/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Category Product", price: 25.0, category: "Test Category" });

    const response = await request.get("/products/category/Test Category");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    response.body.forEach((p: any) => expect(p.category).toBe("Test Category"));
  });

  it("GET /products/category/:category - returns 404 for unknown category", async () => {
    const response = await request.get("/products/category/NonExistentCategory");
    expect(response.status).toBe(404);
  });
});
