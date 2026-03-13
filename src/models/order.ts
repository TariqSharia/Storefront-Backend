import pool from "../database";

export type Order = {
  id?: number;
  user_id: number;
  status: string;
};

export type OrderProduct = {
  id?: number;
  order_id: number;
  product_id: number;
  quantity: number;
};

export class OrderStore {
  async index(): Promise<Order[]> {
    const conn = await pool.connect();
    try {
      const sql = "SELECT * FROM orders ORDER BY id";
      const result = await conn.query(sql);
      return result.rows;
    } catch (err) {
      throw new Error(`Could not get orders. Error: ${err}`);
    } finally {
      conn.release();
    }
  }

  async show(id: number): Promise<Order | null> {
    const conn = await pool.connect();
    try {
      const sql = "SELECT * FROM orders WHERE id=($1)";
      const result = await conn.query(sql, [id]);
      return result.rows[0] || null;
    } catch (err) {
      throw new Error(`Could not get order with id ${id}. Error: ${err}`);
    } finally {
      conn.release();
    }
  }

  async create(o: Order): Promise<Order> {
    const conn = await pool.connect();
    try {
      const sql =
        "INSERT INTO orders (user_id, status) VALUES ($1, $2) RETURNING *";
      const result = await conn.query(sql, [o.user_id, o.status]);
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not create order. Error: ${err}`);
    } finally {
      conn.release();
    }
  }

  async addProduct(
    quantity: number,
    order_id: number,
    product_id: number
  ): Promise<OrderProduct> {
    const conn = await pool.connect();
    try {
      const sql =
        "INSERT INTO order_products (quantity, order_id, product_id) VALUES ($1, $2, $3) RETURNING *";
      const result = await conn.query(sql, [quantity, order_id, product_id]);
      return result.rows[0];
    } catch (err) {
      throw new Error(
        `Could not add product ${product_id} to order ${order_id}. Error: ${err}`
      );
    } finally {
      conn.release();
    }
  }

  async currentOrder(user_id: number): Promise<Order | null> {
    const conn = await pool.connect();
    try {
      const sql =
        "SELECT * FROM orders WHERE user_id=($1) AND status='active' ORDER BY id DESC LIMIT 1";
      const result = await conn.query(sql, [user_id]);
      return result.rows[0] || null;
    } catch (err) {
      throw new Error(
        `Could not get current order for user ${user_id}. Error: ${err}`
      );
    } finally {
      conn.release();
    }
  }

  // [OPTIONAL] Completed orders by user
  async completedOrders(user_id: number): Promise<Order[]> {
    const conn = await pool.connect();
    try {
      const sql =
        "SELECT * FROM orders WHERE user_id=($1) AND status='complete' ORDER BY id DESC";
      const result = await conn.query(sql, [user_id]);
      return result.rows;
    } catch (err) {
      throw new Error(
        `Could not get completed orders for user ${user_id}. Error: ${err}`
      );
    } finally {
      conn.release();
    }
  }
}
