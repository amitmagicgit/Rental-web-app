import pkg from "pg";
const { Pool } = pkg;
import fs from "fs";
import session from "express-session";
import createMemoryStore from "memorystore";
import {
  User,
  InsertUser,
  Listing,
  UserFilter,
  InsertUserFilter,
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSubscription(userId: number, isSubscribed: boolean): Promise<User>;
  updateUserTelegramChat(userId: number, chatId: string): Promise<User>;

  getListings(filters?: Partial<UserFilter>): Promise<Listing[]>;
  getListingByPostId(postId: string): Promise<Listing | undefined>;

  getUserFilters(userId: number): Promise<UserFilter[]>;
  createUserFilter(
    userId: number,
    filter: InsertUserFilter,
  ): Promise<UserFilter>;
  updateUserFilter(
    filterId: number,
    filter: Partial<InsertUserFilter>,
  ): Promise<UserFilter>;
  deleteUserFilter(filterId: number): Promise<void>;

  sessionStore: session.Store;
}


export class DbStorage implements IStorage {
  private pool: Pool;
  sessionStore: session.Store;

  constructor() {
    // Use the DATABASE_URL environment variable for your connection string.

    // If you're using Docker, you can use the DATABASE_URL environment variable
    console.log(process.env.DATABASE_URL);
    const caCert = fs.readFileSync("server/eu-central-1-bundle.pem").toString();
    console.log("Certificate file loaded successfully.");
    console.log("Certificate length:", caCert.length);
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        ca: caCert,
      },
    });

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username],
    );
    return result.rows[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.pool.query(
      `INSERT INTO users (username, password, is_subscribed, telegram_chat_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [insertUser.username, insertUser.password, false, null],
    );
    return result.rows[0];
  }

  async updateUserSubscription(
    userId: number,
    isSubscribed: boolean,
  ): Promise<User> {
    const result = await this.pool.query(
      `UPDATE users SET is_subscribed = $1 WHERE id = $2 RETURNING *`,
      [isSubscribed, userId],
    );
    return result.rows[0];
  }

  async updateUserTelegramChat(userId: number, chatId: string): Promise<User> {
    const result = await this.pool.query(
      `UPDATE users SET telegram_chat_id = $1 WHERE id = $2 RETURNING *`,
      [chatId, userId],
    );
    return result.rows[0];
  }

  async getListings(filters?: Partial<UserFilter>): Promise<Listing[]> {
    let query = "SELECT * FROM processed_posts";
    const params: any[] = [];
    const conditions: string[] = [];

    if (filters) {
      if (filters.minPrice !== undefined) {
        params.push(filters.minPrice);
        conditions.push(`price >= $${params.length}`);
      }
      if (filters.maxPrice !== undefined) {
        params.push(filters.maxPrice);
        conditions.push(`price <= $${params.length}`);
      }
      if (filters.minSize !== undefined) {
        params.push(filters.minSize);
        conditions.push(`size >= $${params.length}`);
      }
      if (filters.maxSize !== undefined) {
        params.push(filters.maxSize);
        conditions.push(`size <= $${params.length}`);
      }
      if (filters.minRooms !== undefined) {
        params.push(filters.minRooms);
        conditions.push(`num_rooms >= $${params.length}`);
      }
      if (filters.maxRooms !== undefined) {
        params.push(filters.maxRooms);
        conditions.push(`num_rooms <= $${params.length}`);
      }
      if (filters.neighborhoods !== undefined) {
        // Assuming neighborhoods is an array, we use the ANY operator.
        params.push(filters.neighborhoods);
        conditions.push(`neighborhood = ANY($${params.length})`);
      }
      if (filters.balcony !== undefined) {
        params.push(filters.balcony);
        conditions.push(`balcony = $${params.length}`);
      }
      if (filters.agent !== undefined) {
        params.push(filters.agent);
        conditions.push(`agent = $${params.length}`);
      }
      if (filters.parking !== undefined) {
        params.push(filters.parking);
        conditions.push(`parking = $${params.length}`);
      }
      if (filters.furnished !== undefined) {
        params.push(filters.furnished);
        conditions.push(`furnished = $${params.length}`);
      }
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getListingByPostId(postId: string): Promise<Listing | undefined> {
    const result = await this.pool.query(
      "SELECT * FROM processed_posts WHERE post_id = $1",
      [postId],
    );
    return result.rows[0];
  }

  async getUserFilters(userId: number): Promise<UserFilter[]> {
    const result = await this.pool.query(
      "SELECT * FROM telegram_subscriptions WHERE user_id = $1",
      [userId],
    );
    return result.rows;
  }

  async createUserFilter(
    userId: number,
    filter: InsertUserFilter,
  ): Promise<UserFilter> {
    const result = await this.pool.query(
      `INSERT INTO telegram_subscriptions 
       (user_id, min_price, max_price, min_size, max_size, neighborhoods, min_rooms, max_rooms, balcony, agent, parking, furnished)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        userId,
        filter.minPrice,
        filter.maxPrice,
        filter.minSize,
        filter.maxSize,
        JSON.stringify(filter.neighborhoods),
        filter.minRooms,
        filter.maxRooms,
        JSON.stringify(filter.balcony),
        JSON.stringify(filter.agent),
        JSON.stringify(filter.parking),
        JSON.stringify(filter.furnished),
      ],
    );
    return result.rows[0];
  }

  async updateUserFilter(
    filterId: number,
    filter: Partial<InsertUserFilter>,
  ): Promise<UserFilter> {
    const keys = Object.keys(filter);
    if (keys.length === 0) {
      throw new Error("No filter fields provided");
    }
    const setClauses = keys.map((key, idx) => `${key} = $${idx + 1}`);
    const values = keys.map((key) => {
      if (
        ["neighborhoods", "balcony", "agent", "parking", "furnished"].includes(
          key,
        )
      ) {
        return JSON.stringify(filter[key as keyof InsertUserFilter]);
      }
      return filter[key as keyof InsertUserFilter];
    });
    const query = `UPDATE telegram_subscriptions SET ${setClauses.join(
      ", ",
    )} WHERE id = $${keys.length + 1} RETURNING *`;
    values.push(filterId);
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async deleteUserFilter(filterId: number): Promise<void> {
    await this.pool.query("DELETE FROM telegram_subscriptions WHERE id = $1", [
      filterId,
    ]);
  }
}

export const storage = new DbStorage();
