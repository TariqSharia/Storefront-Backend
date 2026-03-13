import pool from "../database";

export type Product = {
  id?: number;
  name: string;
  price: number;
  category?: string;
};

export class ProductStore {
  async index(): Promise<Product[]> {
    const conn = await pool.connect();
    try {
      const sql = "SELECT * FROM products ORDER BY id";
      const result = await conn.query(sql);
      return result.rows;
    } catch (err) {
      throw new Error(`Could not get products. Error: ${err}`);
    } finally {
      conn.release();
    }
  }

  async show(id: number): Promise<Product | null> {
    const conn = await pool.connect();
    try {
      const sql = "SELECT * FROM products WHERE id=($1)";
      const result = await conn.query(sql, [id]);
      return result.rows[0] || null;
    } catch (err) {
      throw new Error(`Could not get product with id ${id}. Error: ${err}`);
    } finally {
      conn.release();
    }
  }

  async create(p: Product): Promise<Product> {
    const conn = await pool.connect();
    try {
      const sql =
        "INSERT INTO products (name, price, category) VALUES ($1, $2, $3) RETURNING *";
      const result = await conn.query(sql, [p.name, p.price, p.category || null]);
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not create product. Error: ${err}`);
    } finally {
      conn.release();
    }
  }

  // [OPTIONAL] Top 5 most popular products by total quantity ordered
  async topFivePopular(): Promise<Product[]> {
    const conn = await pool.connect();
    try {
      const sql = `
        SELECT p.id, p.name, p.price, p.category, SUM(op.quantity) AS total_ordered
        FROM products p
        JOIN order_products op ON p.id = op.product_id
        GROUP BY p.id
        ORDER BY total_ordered DESC
        LIMIT 5
      `;
      const result = await conn.query(sql);
      return result.rows;
    } catch (err) {
      throw new Error(`Could not get top 5 popular products. Error: ${err}`);
    } finally {
      conn.release();
    }
  }

  // [OPTIONAL] Products by category
  async byCategory(category: string): Promise<Product[]> {
    const conn = await pool.connect();
    try {
      const sql = "SELECT * FROM products WHERE category=($1) ORDER BY id";
      const result = await conn.query(sql, [category]);
      return result.rows;
    } catch (err) {
      throw new Error(`Could not get products by category ${category}. Error: ${err}`);
    } finally {
      conn.release();
    }
  }
}
