import { UserStore, User } from "../../models/user";
import pool from "../../database";

const store = new UserStore();

describe("User Model", () => {
  let createdUserId: number;

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

  it("should have an index method", () => {
    expect(store.index).toBeDefined();
  });

  it("should have a show method", () => {
    expect(store.show).toBeDefined();
  });

  it("should have a create method", () => {
    expect(store.create).toBeDefined();
  });

  it("should have an authenticate method", () => {
    expect(store.authenticate).toBeDefined();
  });

  it("create method should add a user", async () => {
    const result = await store.create({
      username: "testuser",
      firstname: "Test",
      lastname: "User",
      password: "password123",
    });
    createdUserId = result.id as number;
    expect(result.username).toEqual("testuser");
    expect(result.firstname).toEqual("Test");
    expect(result.lastname).toEqual("User");
  });

  it("create method should throw 409 for duplicate username", async () => {
    try {
      await store.create({
        username: "testuser",
        firstname: "Another",
        lastname: "User",
        password: "password456",
      });
      fail("Expected error for duplicate username");
    } catch (err: any) {
      expect(err.status).toEqual(409);
      expect(err.message).toContain("testuser");
    }
  });

  it("index method should return a list of users", async () => {
    const result = await store.index();
    expect(result.length).toBeGreaterThan(0);
  });

  it("show method should return the correct user", async () => {
    const result = await store.show(createdUserId);
    expect(result).not.toBeNull();
    expect(result!.username).toEqual("testuser");
    expect(result!.firstname).toEqual("Test");
    expect(result!.lastname).toEqual("User");
  });

  it("show method should return null for non-existent user", async () => {
    const result = await store.show(999999);
    expect(result).toBeNull();
  });

  it("authenticate method should return the user for correct credentials", async () => {
    const result = await store.authenticate("testuser", "password123");
    expect(result).not.toBeNull();
    expect(result!.username).toEqual("testuser");
  });

  it("authenticate method should return null for incorrect password", async () => {
    const result = await store.authenticate("testuser", "wrongpassword");
    expect(result).toBeNull();
  });

  it("authenticate method should return null for non-existent user", async () => {
    const result = await store.authenticate("nonexistent", "password123");
    expect(result).toBeNull();
  });
});
