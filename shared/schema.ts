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
    "מונטיפיורי",
    "לב תל אביב",
    "שרונה",
    "כרם התימנים",
    "נווה צדק",
    "פלורנטיין",
    "נווה שאנן",
    "התקווה",
    "הצפון הישן",
    "הצפון החדש",
    "בבלי",
    "נמל תל אביב",
    "נווה אביבים",
    "רמת אביב",
    "רמת אביב ג",
    "למד",
    "הגוש הגדול",
    "שדה דב",
    "כוכב הצפון",
  ],
  "רמת גן": [
    "תל בנימין",
    "חרוזים",
    "שכונת הותיקים",
    "הגפן",
    "הבורסה",
    "הראשונים",
    "יהלום",
    "חשמונאים",
    "בן גוריון",
    "נחלת גנים",
    "הלל",
    "יד לבנים",
    "תל יהודה",
    "קרית בורוכוב",
    "תל גנים",
    "רמת חן",
  ],
  גבעתיים: [
    "סיטי",
    "בורוכוב",
    "קריית יוסף",
    "ארלוזורוב",
    "גבעת הרמבם",
    "שכונת הפועלים",
    "שטח 9",
    "חברת חשמל",
    "תל גנים",
    "פועלי הרכבת",
    "גבעת קוזלובסקי",
  ],
} as const;

// Flat array of all neighborhoods for backward compatibility
export const NEIGHBORHOODS = Object.values(
  CITIES_AND_NEIGHBORHOODS,
).flat() as readonly string[];

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
  post_id: text("post_id").notNull().unique(),
  url: text("url").notNull(),
  source: text("source"),
  attachments: jsonb("attachments").$type<string[]>(),
  for_rent: boolean("for_rent"),
  price: real("price"),
  address: text("address"),
  street: text("street"),
  house: text("house"),
  neighborhoods: text("neighborhood"),
  city: text("city"),
  num_rooms: real("num_rooms"),
  size: real("size"),
  agent: text("agent"),
  balcony: text("balcony"),
  parking: text("parking"),
  furnished: text("furnished"),
  detailed_description: text("detailed_description"),
  description: text("description"),
  source_platform: text("source_platform"),
  dedup_hash: text("dedup_hash"),
  created_at: timestamp("created_at").defaultNow(),
  update_at: timestamp("update_at").defaultNow(),
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
