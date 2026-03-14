import pool from "../database";

export type OrderProduct = {
  id?: number;
  quantity: number;
  order_id: number;
  product_id: number;
};

export class OrderProductStore {
  async index(): Promise<OrderProduct[]> {
    const conn = await pool.connect();
    try {
      const sql = "SELECT * FROM order_products";
      const result = await conn.query(sql);
      return result.rows;
    } catch (err) {
      throw new Error(`Could not get order products. Error: ${err}`);
    } finally {
      conn.release();
    }
  }

  async show(id: number): Promise<OrderProduct | null> {
    const conn = await pool.connect();
    try {
      const sql = "SELECT * FROM order_products WHERE id=($1)";
      const result = await conn.query(sql, [id]);
      return result.rows[0] || null;
    } catch (err) {
      throw new Error(
        `Could not get order product with id ${id}. Error: ${err}`,
      );
    } finally {
      conn.release();
    }
  }

  async create(op: OrderProduct): Promise<OrderProduct> {
    const conn = await pool.connect();
    try {
      const sql =
        "INSERT INTO order_products (quantity, order_id, product_id) VALUES ($1, $2, $3) RETURNING *";
      const result = await conn.query(sql, [
        op.quantity,
        op.order_id,
        op.product_id,
      ]);
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not create order product. Error: ${err}`);
    } finally {
      conn.release();
    }
  }

  async update(id: number, op: Partial<OrderProduct>): Promise<OrderProduct> {
    const conn = await pool.connect();
    try {
      if (op.quantity === undefined) {
        throw new Error("quantity is required for update.");
      }
      const sql =
        "UPDATE order_products SET quantity=$1 WHERE id=$2 RETURNING *";
      const result = await conn.query(sql, [op.quantity, id]);
      return result.rows[0];
    } catch (err) {
      throw new Error(
        `Could not update order product with id ${id}. Error: ${err}`,
      );
    } finally {
      conn.release();
    }
  }

  async delete(id: number): Promise<OrderProduct> {
    const conn = await pool.connect();
    try {
      const sql = "DELETE FROM order_products WHERE id=($1) RETURNING *";
      const result = await conn.query(sql, [id]);
      return result.rows[0];
    } catch (err) {
      throw new Error(
        `Could not delete order product with id ${id}. Error: ${err}`,
      );
    } finally {
      conn.release();
    }
  }

  // [OPTIONAL] Get all products in a specific order
  async productsByOrder(orderId: number): Promise<OrderProduct[]> {
    const conn = await pool.connect();
    try {
      const sql = "SELECT * FROM order_products WHERE order_id=($1)";
      const result = await conn.query(sql, [orderId]);
      return result.rows;
    } catch (err) {
      throw new Error(
        `Could not get products for order ${orderId}. Error: ${err}`,
      );
    } finally {
      conn.release();
    }
  }

  // [OPTIONAL] Get total quantity of a specific product ordered across all orders
  async totalQuantityByProduct(productId: number): Promise<number> {
    const conn = await pool.connect();
    try {
      const sql =
        "SELECT SUM(quantity) AS total FROM order_products WHERE product_id=($1)";
      const result = await conn.query(sql, [productId]);
      return parseInt(result.rows[0].total) || 0;
    } catch (err) {
      throw new Error(
        `Could not get total quantity for product ${productId}. Error: ${err}`,
      );
    } finally {
      conn.release();
    }
  }
}
