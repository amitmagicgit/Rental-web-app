import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  jsonb,
  timestamp,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export type CityNeighborhoodMap = {
  [city: string]: readonly string[];
};

export const CITIES_AND_NEIGHBORHOODS: CityNeighborhoodMap = {
  "תל אביב": [
    "כרם התימנים",
    "נווה צדק",
    "פלורנטיין",
    "הצפון הישן",
    "הצפון החדש",
    "בבלי",
    "מונטיפיורי",
    "לב תל אביב",
    "נמל תל אביב",
    "התקווה",
    "רמת אביב",
    "נווה אביבים",
  ],
  "רמת גן": [
    "תל בנימין", 
    "שיכון ותיקים", 
    "הגפן", 
    "הבורסה", 
    "יהלום", 
    "חשמונאים", 
    "חרוזים", 
    "בן גוריון", 
    "הראשונים",
    "רמת עמידר", 
    "רמת חן", 
    "קריית קריניצי", 

  ],
  "גבעתיים": [
    "בורוכוב", 
    "רמב\"ם", 
    "קריית יוסף", 
    "שכונת הפועלים", 
    "כצנלסון",
    "שינקין", 
    "גבעת רמב\"ם", 
    "ארלוזורוב",
  ],
} as const;

// Flat array of all neighborhoods for backward compatibility
export const NEIGHBORHOODS = Object.values(CITIES_AND_NEIGHBORHOODS).flat() as readonly string[];

export const FILTER_OPTIONS = {
  ANY: "any",
  YES: "yes",
  NO: "no",
  NOT_MENTIONED: "not_mentioned",
} as const;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isSubscribed: boolean("is_subscribed").default(false).notNull(),
  telegramChatId: text("telegram_chat_id"),
});

export const listings = pgTable("processed_posts", {
  id: serial("id").primaryKey(),
  postId: text("post_id").notNull().unique(),
  description: text("description").notNull(),
  price: real("price"),
  address: text("address"),
  neighborhood: text("neighborhood"),
  numRooms: real("num_rooms"),
  size: real("size"),
  agent: text("agent"),
  balcony: text("balcony"),
  parking: text("parking"),
  furnished: text("furnished"),
  detailedDescription: text("detailed_description"),
  url: text("url").notNull(),
  attachments: jsonb("attachments").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userFilters = pgTable("user_filters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  minPrice: real("min_price"),
  maxPrice: real("max_price"),
  minSize: real("min_size"),
  maxSize: real("max_size"),
  neighborhoods: jsonb("neighborhoods").$type<string[]>(),
  minRooms: real("min_rooms"),
  maxRooms: real("max_rooms"),
  balcony: text("balcony"),
  agent: text("agent"),
  parking: text("parking"),
  furnished: text("furnished"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const userFilterSchema = createInsertSchema(userFilters).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type UserFilter = typeof userFilters.$inferSelect;
export type InsertUserFilter = z.infer<typeof userFilterSchema>;
