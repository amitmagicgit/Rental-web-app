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
import dotenv from 'dotenv';

dotenv.config();

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSubscription(userId: number, isSubscribed: boolean): Promise<User>;
  updateUserTelegramChat(userId: number, chatId: string): Promise<User>;

  getListings(filters?: Partial<UserFilter>): Promise<Listing[]>;
  getListingByPostId(postId: string): Promise<Listing | undefined>;
  saveUserListingView(telegramChatId: string, postId: string): Promise<void>;
  getListingViewsStats(): Promise<Array<{ date_created: string; telegram_chat_id: string; entry_count: number }>>;
  getSubscriptionStats(): Promise<Array<{ date_created: string; subscription_count: number }>>;
  getTotalUsersCount(): Promise<number>;
  getDailyUserStats(): Promise<Array<{ date_created: string; daily_active_users: number; daily_views_per_user: number }>>;
  getDailySentMessagesStats(): Promise<Array<{ date_sent: string; daily_sent: number }>>;

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

  getSourcePlatformStats(): Promise<Array<{ date_in: string; source_platform: string; count: number }>>;
}

export class DbStorage implements IStorage {
  private pool: Pool;
  sessionStore: session.Store;

  constructor() {
    // Use the DATABASE_URL environment variable for your connection string.

    // If you're using Docker, you can use the DATABASE_URL environment variable
    const caCert = fs.readFileSync("server/eu-central-1-bundle.pem").toString();
    console.log(process.env.DATABASE_URL);
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
      // --- Price Filtering ---
      {
        // Use defaults if not provided.
        const minPrice = filters.minPrice !== undefined ? filters.minPrice : 0;
        const maxPrice =
          filters.maxPrice !== undefined ? filters.maxPrice : 10000;
        // Push min, max and the include flag.
        params.push(minPrice);
        const minPriceIndex = params.length;
        params.push(maxPrice);
        const maxPriceIndex = params.length;
        // If includeZeroPrice is false, we want to exclude price=0.
        // Otherwise, we include listings with price=0 regardless of the numeric range.
        params.push(filters.includeZeroPrice === false ? false : true);
        const includeZeroPriceIndex = params.length;
        conditions.push(
          `((price BETWEEN $${minPriceIndex} AND $${maxPriceIndex} AND price <> 0) OR (price = 0 AND $${includeZeroPriceIndex}::boolean = true))`,
        );
      }

      // --- Size Filtering ---
      {
        const minSize = filters.minSize !== undefined ? filters.minSize : 0;
        const maxSize = filters.maxSize !== undefined ? filters.maxSize : 500;
        params.push(minSize);
        const minSizeIndex = params.length;
        params.push(maxSize);
        const maxSizeIndex = params.length;
        params.push(filters.includeZeroSize === false ? false : true);
        const includeZeroSizeIndex = params.length;
        conditions.push(
          `((size BETWEEN $${minSizeIndex} AND $${maxSizeIndex} AND size <> 0) OR (size = 0 AND $${includeZeroSizeIndex}::boolean = true))`,
        );
      }

      // --- Number of Rooms Filtering ---
      {
        const minRooms = filters.minRooms !== undefined ? filters.minRooms : 0;
        const maxRooms = filters.maxRooms !== undefined ? filters.maxRooms : 10;
        params.push(minRooms);
        const minRoomsIndex = params.length;
        params.push(maxRooms);
        const maxRoomsIndex = params.length;
        params.push(filters.includeZeroRooms === false ? false : true);
        const includeZeroRoomsIndex = params.length;
        conditions.push(
          `((num_rooms BETWEEN $${minRoomsIndex} AND $${maxRoomsIndex} AND num_rooms <> 0) OR (num_rooms = 0 AND $${includeZeroRoomsIndex}::boolean = true))`,
        );
      }

      // --- Neighborhoods ---
      if (filters.neighborhoods !== undefined) {
        params.push(filters.neighborhoods);
        conditions.push(`neighborhood = ANY($${params.length})`);
      }

      // --- Multi-choice Fields (balcony, parking, furnished, agent) ---
      const MULTI_OPTIONS = ["yes", "no", "not mentioned"];

      const addMultiChoiceFilter = (fieldName: string, filterValue: any) => {
        if (Array.isArray(filterValue)) {
          if (
            filterValue.length > 0 &&
            filterValue.length < MULTI_OPTIONS.length
          ) {
            params.push(filterValue);
            conditions.push(`${fieldName} = ANY($${params.length})`);
          }
        } else if (filterValue !== undefined && filterValue !== "any") {
          params.push(filterValue);
          conditions.push(`${fieldName} = $${params.length}`);
        }
      };

      addMultiChoiceFilter("balcony", filters.balcony);
      addMultiChoiceFilter("parking", filters.parking);
      addMultiChoiceFilter("furnished", filters.furnished);
      addMultiChoiceFilter("agent", filters.agent);
    }

    // Always filter by the recent two weeks.
    conditions.push("created_at >= (NOW() - INTERVAL '2 weeks')");

    //Filter for listings that are for rent.
    conditions.push("for_rent = true");

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY created_at DESC LIMIT 100";

    console.log(query, params);
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

  async saveUserListingView(telegramChatId: string, postId: string): Promise<void> {
    await this.pool.query(
      "INSERT INTO user_listing_entries (telegram_chat_id, post_id) VALUES ($1, $2)",
      [telegramChatId, postId]
    );
  }

  async getListingViewsStats(): Promise<Array<{ date_created: string; telegram_chat_id: string; entry_count: number }>> {
    const result = await this.pool.query(`
      SELECT 
        created_at::date AS date_created, 
        telegram_chat_id, 
        COUNT(*) AS entry_count
      FROM 
        user_listing_entries
      WHERE 
        created_at::date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY 
        created_at::date, 
        telegram_chat_id
      ORDER BY 
        date_created DESC
    `);
    return result.rows;
  }

  async getSubscriptionStats(): Promise<Array<{ date_created: string; subscription_count: number }>> {
    const result = await this.pool.query(`
      SELECT 
        created_at::date AS date_created, 
        COUNT(*) AS subscription_count
      FROM 
        telegram_subscriptions
      GROUP BY 
        created_at::date
      ORDER BY 
        date_created DESC
    `);
    return result.rows;
  }

  async getTotalUsersCount(): Promise<number> {
    const result = await this.pool.query(`
      SELECT COUNT(*) FROM telegram_subscriptions
      WHERE target_type = 'user'
    `);
    return parseInt(result.rows[0].count);
  }

  async getDailyUserStats(): Promise<Array<{ date_created: string; daily_active_users: number; daily_views_per_user: number }>> {
    const result = await this.pool.query(`
      SELECT 
        created_at::date AS date_created,
        COUNT(DISTINCT telegram_chat_id) AS daily_active_users,
        COUNT(*)::float / NULLIF(COUNT(DISTINCT telegram_chat_id), 0) AS daily_views_per_user
      FROM 
        user_listing_entries
      WHERE 
        created_at::date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY 
        created_at::date
      ORDER BY 
        date_created DESC
    `);
    return result.rows;
  }

  async getDailySentMessagesStats(): Promise<Array<{ date_sent: string; daily_sent: number }>> {
    const result = await this.pool.query(`
      SELECT  
        sent_at::date AS date_sent, 
        COUNT(*) AS daily_sent
      FROM 
        telegram_message_log
      GROUP BY 
        sent_at::date
      ORDER BY 
        date_sent DESC
    `);
    return result.rows;
  }

  async getUserFilters(userId: number): Promise<UserFilter[]> {
    const result = await this.pool.query(
      "SELECT * FROM telegram_subscriptions WHERE user_id = $1",
      [userId],
    );
    return result.rows;
  }

  async getTelegramSubscriptionByChatId(chatId: string): Promise<any> {
    const result = await this.pool.query(
      "SELECT * FROM telegram_subscriptions WHERE chat_id = $1",
      [chatId],
    );
    return result.rows[0];
  }

  async createUserFilter(
    userId: number,
    filter: InsertUserFilter,
  ): Promise<UserFilter> {
    // For columns defined as text[] in the DB, pass raw arrays:
    const result = await this.pool.query(
      `INSERT INTO telegram_subscriptions 
         (user_id, min_price, max_price, min_size, max_size,
          neighborhoods, min_rooms, max_rooms,
          balcony, agent, parking, furnished)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        userId,
        filter.minPrice,
        filter.maxPrice,
        filter.minSize,
        filter.maxSize,
        // Pass the raw array for neighborhoods
        filter.neighborhoods,
        filter.minRooms,
        filter.maxRooms,
        // Pass raw arrays for these fields
        filter.balcony,
        filter.agent,
        filter.parking,
        filter.furnished,
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
      // If these columns are text[] in the DB, just pass the raw array
      // instead of JSON.stringify
      if (
        ["neighborhoods", "balcony", "agent", "parking", "furnished"].includes(
          key,
        )
      ) {
        return filter[key as keyof InsertUserFilter];
      }
      return filter[key as keyof InsertUserFilter];
    });

    const query = `
      UPDATE telegram_subscriptions
      SET ${setClauses.join(", ")}
      WHERE id = $${keys.length + 1}
      RETURNING *;
    `;
    values.push(filterId);

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async upsertTelegramSubscription(data: {
    chat_id: string;
    target_type: string;
    min_price: number;
    max_price: number;
    min_size: number;
    max_size: number;
    neighborhoods: string[];
    min_rooms: number;
    max_rooms: number;
    balcony: string;
    agent: string;
    parking: string;
    furnished: string;
    include_zero_price: boolean;
    include_zero_size: boolean;
    include_zero_rooms: boolean;
  }) {
    const result = await this.pool.query(
      `
      INSERT INTO telegram_subscriptions (
        chat_id, target_type, min_price, max_price, min_size, max_size,
        neighborhoods, min_rooms, max_rooms, balcony, agent, parking, furnished, include_zero_price, include_zero_size, include_zero_rooms
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (chat_id, target_type)
      DO UPDATE SET
        min_price = EXCLUDED.min_price,
        max_price = EXCLUDED.max_price,
        min_size = EXCLUDED.min_size,
        max_size = EXCLUDED.max_size,
        neighborhoods = EXCLUDED.neighborhoods,
        min_rooms = EXCLUDED.min_rooms,
        max_rooms = EXCLUDED.max_rooms,
        balcony = EXCLUDED.balcony,
        agent = EXCLUDED.agent,
        parking = EXCLUDED.parking,
        furnished = EXCLUDED.furnished,
        include_zero_price = EXCLUDED.include_zero_price,
        include_zero_size  = EXCLUDED.include_zero_size,
        include_zero_rooms = EXCLUDED.include_zero_rooms,
        updated_at = NOW()
      RETURNING *;
      `,
      [
        data.chat_id,
        data.target_type,
        data.min_price,
        data.max_price,
        data.min_size,
        data.max_size,
        data.neighborhoods || [],
        data.min_rooms,
        data.max_rooms,
        Array.isArray(data.balcony) ? data.balcony : [data.balcony],
        Array.isArray(data.agent) ? data.agent : [data.agent],
        Array.isArray(data.parking) ? data.parking : [data.parking],
        Array.isArray(data.furnished) ? data.furnished : [data.furnished],
        data.include_zero_price,
        data.include_zero_size,
        data.include_zero_rooms,
      ],
    );
    return result.rows[0];
  }

  async deleteUserFilter(filterId: number): Promise<void> {
    await this.pool.query("DELETE FROM telegram_subscriptions WHERE id = $1", [
      filterId,
    ]);
  }

  async getSourcePlatformStats(): Promise<Array<{ date_in: string; source_platform: string; count: number }>> {
    const result = await this.pool.query(`
      SELECT 
        created_at::date AS date_in, 
        source_platform, 
        COUNT(*) as count 
      FROM 
        processed_posts
      GROUP BY 
        created_at::date, 
        source_platform
      ORDER BY 
        date_in DESC
    `);
    return result.rows;
  }
}

export const storage = new DbStorage();
