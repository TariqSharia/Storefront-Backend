import supertest from "supertest";
import app from "../../server";
import pool from "../../database";

const request = supertest(app);

describe("User Handlers", () => {
  let token: string;
  let userId: number;

  beforeAll(async () => {
    const conn = await pool.connect();
    await conn.query("DELETE FROM users WHERE username='testuser'");
    conn.release();
  });

  afterAll(async () => {
    const conn = await pool.connect();
    await conn.query("DELETE FROM users WHERE username='testuser'");
    conn.release();
  });

  it("POST /users - creates user and returns token", async () => {
    const response = await request.post("/users").send({
      username: "testuser",
      firstname: "Test",
      lastname: "User",
      password: "password123",
    });
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.username).toEqual("testuser");
    token = response.body.token;
    userId = response.body.user.id;
  });

  it("POST /users - returns 409 for duplicate username", async () => {
    const response = await request.post("/users").send({
      username: "testuser",
      firstname: "Another",
      lastname: "Person",
      password: "password456",
    });
    expect(response.status).toBe(409);
    expect(response.body.error).toContain("testuser");
  });

  it("POST /users - returns 400 when required fields are missing", async () => {
    const response = await request.post("/users").send({
      username: "incomplete",
    });
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it("POST /users/authenticate - authenticates user and returns token", async () => {
    const response = await request.post("/users/authenticate").send({
      username: "testuser",
      password: "password123",
    });
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.username).toEqual("testuser");
  });

  it("POST /users/authenticate - returns 401 for wrong password", async () => {
    const response = await request.post("/users/authenticate").send({
      username: "testuser",
      password: "wrongpassword",
    });
    expect(response.status).toBe(401);
    expect(response.body.error).toBeDefined();
  });

  it("POST /users/authenticate - returns 400 when fields are missing", async () => {
    const response = await request.post("/users/authenticate").send({
      username: "testuser",
    });
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it("GET /users - returns list of users with valid token", async () => {
    const response = await request
      .get("/users")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it("GET /users - returns 401 without token", async () => {
    const response = await request.get("/users");
    expect(response.status).toBe(401);
  });

  it("GET /users/:id - returns user details with valid token", async () => {
    const response = await request
      .get(`/users/${userId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.username).toEqual("testuser");
  });

  it("GET /users/:id - returns 404 for non-existent user", async () => {
    const response = await request
      .get("/users/999999")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(404);
  });

  it("GET /users/:id - returns 401 without token", async () => {
    const response = await request.get(`/users/${userId}`);
    expect(response.status).toBe(401);
  });
});
