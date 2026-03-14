import pool from "../database";

export type Order = {
  id?: number;
  user_id: number;
  status: string;
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

  async update(id: number, o: Partial<Order>): Promise<Order> {
    const conn = await pool.connect();
    try {
      if ( o.status === undefined) {
        throw new Error("status is required for update.");
      }
      const sql =
        "UPDATE orders SET status=$1 WHERE id=$2 RETURNING *";
      const result = await conn.query(sql, [o.status, id]);
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not update order with id ${id}. Error: ${err}`);
    } finally {
      conn.release();
    }
  }

  async delete(id: number): Promise<Order> {
    const conn = await pool.connect();
    try {
      const sql = "DELETE FROM orders WHERE id=($1) RETURNING *";
      const result = await conn.query(sql, [id]);
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not delete order with id ${id}. Error: ${err}`);
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
