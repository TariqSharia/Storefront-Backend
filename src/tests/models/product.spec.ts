import { ProductStore } from "../../models/product";
import pool from "../../database";

const store = new ProductStore();

describe("Product Model", () => {
  let createdProductId: number;
  let secondProductId: number;

  beforeAll(async () => {
    const conn = await pool.connect();
    await conn.query(
      "DELETE FROM products WHERE name IN ('Testing Product', 'Popular Product', 'Product to Delete')",
    );
    conn.release();
  });

  afterAll(async () => {
    const conn = await pool.connect();
    await conn.query(
      "DELETE FROM products WHERE name IN ('Testing Product', 'Popular Product', 'Product to Delete')",
    );
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

  it("should have a topFivePopular method", () => {
    expect(store.topFivePopular).toBeDefined();
  });

  it("should have a byCategory method", () => {
    expect(store.byCategory).toBeDefined();
  });

  it("create method should add a product", async () => {
    const result = await store.create({
      name: "Testing Product",
      price: 10.93,
      category: "Testing Category",
    });
    createdProductId = result.id as number;
    expect(result.name).toEqual("Testing Product");
    expect(parseFloat(result.price as unknown as string)).toEqual(10.93);
    expect(result.category).toEqual("Testing Category");
  });

  it("index method should return a list of products", async () => {
    const result = await store.index();
    expect(result.length).toBeGreaterThan(0);
  });

  it("show method should return the correct product", async () => {
    const result = await store.show(createdProductId);
    expect(result).not.toBeNull();
    expect(result!.name).toEqual("Testing Product");
    expect(parseFloat(result!.price as unknown as string)).toEqual(10.93);
    expect(result!.category).toEqual("Testing Category");
  });

  it("show method should return null for non-existent product", async () => {
    const result = await store.show(999999);
    expect(result).toBeNull();
  });

  it("byCategory method should return products of the given category", async () => {
    const result = await store.byCategory("Testing Category");
    expect(result.length).toBeGreaterThan(0);
    result.forEach((p) => expect(p.category).toEqual("Testing Category"));
  });

  it("byCategory method should return empty array for unknown category", async () => {
    const result = await store.byCategory("NonExistentCategory");
    expect(result).toEqual([]);
  });

  it("topFivePopular method should return an array", async () => {
    const result = await store.topFivePopular();
    expect(Array.isArray(result)).toBeTrue();
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it("update method should update a product", async () => {
    const result = await store.update(createdProductId, {
      name: "Updated Testing Product",
      price: 15.99,
      category: "Updated Category",
    });
    expect(result.name).toEqual("Updated Testing Product");
    expect(parseFloat(result.price as unknown as string)).toEqual(15.99);
    expect(result.category).toEqual("Updated Category");
  });

  it("update method should persist the changes in the database", async () => {
    const result = await store.show(createdProductId);
    expect(result).not.toBeNull();
    expect(result!.name).toEqual("Updated Testing Product");
    expect(parseFloat(result!.price as unknown as string)).toEqual(15.99);
    expect(result!.category).toEqual("Updated Category");
  });

  it("delete method should remove a product", async () => {
    const productToDelete = await store.create({
      name: "Product to Delete",
      price: 5.99,
      category: "Delete Category",
    });
    secondProductId = productToDelete.id as number;

    await store.delete(secondProductId);
    const result = await store.show(secondProductId);
    expect(result).toBeNull();
  });

  it("delete method should persist the deletion in the database", async () => {
    const result = await store.index();
    const deleted = result.find((p) => p.id === secondProductId);
    expect(deleted).toBeUndefined();
  });
});
