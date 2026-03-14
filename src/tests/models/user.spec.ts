import { UserStore, User } from "../../models/user";
import pool from "../../database";

const store = new UserStore();

describe("User Model", () => {
  let createdUserId: number;
  let createdUser2Id: number;

  beforeAll(async () => {
    const conn = await pool.connect();
    await conn.query("DELETE FROM users WHERE username='testuser' OR username='testuser2'");
    conn.release();
  });

  afterAll(async () => {
    const conn = await pool.connect();
    await conn.query("DELETE FROM users WHERE username='testuser' OR username='testuser2'");
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

  it("should have an update method", () => {
    expect(store.update).toBeDefined();
  });

  it("should have a delete method", () => {
    expect(store.delete).toBeDefined();
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

  it("update method should update a user password", async () => {
    const result = await store.update(createdUserId, {
      password: "newpassword123",
    });
    expect(result).not.toBeNull();
    expect(result.id).toEqual(createdUserId);
  });

  it("update method should persist the password change in the database", async () => {
    const result = await store.authenticate("testuser", "newpassword123");
    expect(result).not.toBeNull();
    expect(result!.username).toEqual("testuser");
  });

  it("update method should invalidate the old password", async () => {
    const result = await store.authenticate("testuser", "password123");
    expect(result).toBeNull();
  });

  it("delete method should remove a user", async () => {
    // Create a second user for deletion test
    const user2Result = await store.create({
      username: "testuser2",
      firstname: "Test",
      lastname: "User2",
      password: "password123",
    });
    createdUser2Id = user2Result.id as number;

    await store.delete(createdUser2Id);
    const result = await store.show(createdUser2Id);
    expect(result).toBeNull();
  });

  it("delete method should persist the deletion in the database", async () => {
    const result = await store.index();
    const deleted = result.find((u) => u.id === createdUser2Id);
    expect(deleted).toBeUndefined();
  });
});