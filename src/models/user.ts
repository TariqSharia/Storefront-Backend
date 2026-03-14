import bcrypt from "bcrypt";
import pool from "../database";
import dotenv from "dotenv";

dotenv.config();

const { BCRYPT_PASSWORD, BCRYPT_SALT_ROUNDS } = process.env;

export type User = {
  id?: number;
  username: string;
  firstname: string;
  lastname: string;
  password: string;
};

export class UserStore {
  async index(): Promise<User[]> {
    const conn = await pool.connect();
    try {
      const sql = "SELECT id, username, firstname, lastname FROM users";
      const result = await conn.query(sql);
      return result.rows;
    } catch (err) {
      throw new Error(`Could not get users. Error: ${err}`);
    } finally {
      conn.release();
    }
  }

  async show(id: number): Promise<User | null> {
    const conn = await pool.connect();
    try {
      const sql = "SELECT id, username, firstname, lastname FROM users WHERE id=($1)";
      const result = await conn.query(sql, [id]);
      return result.rows[0] || null;
    } catch (err) {
      throw new Error(`Could not get user with id ${id}. Error: ${err}`);
    } finally {
      conn.release();
    }
  }

  async create(u: User): Promise<User> {
    const conn = await pool.connect();
    try {
      const sql =
        "INSERT INTO users (username, firstname, lastname, password) VALUES($1, $2, $3, $4) RETURNING id, username, firstname, lastname";
      const hash = bcrypt.hashSync(
        u.password + BCRYPT_PASSWORD,
        parseInt(BCRYPT_SALT_ROUNDS as string)
      );
      const result = await conn.query(sql, [
        u.username,
        u.firstname,
        u.lastname,
        hash,
      ]);
      return result.rows[0];
    } catch (err: any) {
      if (err.code === "23505") {
        throw { status: 409, message: `Username '${u.username}' is already taken.` };
      }
      throw new Error(`Could not create user ${u.username}. Error: ${err}`);
    } finally {
      conn.release();
    }
  }

  async update(id: number, u: Partial<User>): Promise<User> {
    const conn = await pool.connect();
    try {
      if (u.password === undefined || u.username !== undefined || u.firstname !== undefined || u.lastname !== undefined) {
        throw new Error("at least one field is required for update.");
      }
      const hash = bcrypt.hashSync(
        u.password + BCRYPT_PASSWORD,
        parseInt(BCRYPT_SALT_ROUNDS as string)
      );
      const sql ="UPDATE users SET password=$1 WHERE id=$2 RETURNING id, username, firstname, lastname";
      const result = await conn.query(sql, [hash, id]);
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not update user with id ${id}. Error: ${err}`);
    } finally {
      conn.release();
    }
  }
  
  async delete(id: number): Promise<User> {
    const conn = await pool.connect();
    try {
      const sql = "DELETE FROM users WHERE id=($1) RETURNING *";
      const result = await conn.query(sql, [id]);
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not delete user with id ${id}. Error: ${err}`);
    } finally {
      conn.release();
    }
  }

  async authenticate(username: string, password: string): Promise<User | null> {
    const conn = await pool.connect();
    try {
      const sql = "SELECT * FROM users WHERE username=($1)";
      const result = await conn.query(sql, [username]);
      if (result.rows.length) {
        const user = result.rows[0];
        if (bcrypt.compareSync(password + BCRYPT_PASSWORD, user.password)) {
          const { password: _pw, ...userWithoutPassword } = user;
          return userWithoutPassword as User;
        }
      }
      return null;
    } catch (err) {
      throw new Error(`Could not authenticate user ${username}. Error: ${err}`);
    } finally {
      conn.release();
    }
  }
}
