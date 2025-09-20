import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const disasterAlerts = pgTable("disaster_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // low, medium, high, critical
  category: text("category").notNull(), // earthquake, flood, cyclone, fire, etc.
  location: text("location").notNull(),
  coordinates: text("coordinates"), // JSON string of lat,lng
  source: text("source").notNull(),
  url: text("url"),
  publishedAt: timestamp("published_at").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const places = pgTable("places", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  placeId: text("place_id").notNull().unique(), // Google Places ID
  name: text("name").notNull(),
  address: text("address").notNull(),
  category: text("category").notNull(), // hospital, pharmacy, lodging, restaurant
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  rating: real("rating"),
  priceLevel: integer("price_level"),
  phoneNumber: text("phone_number"),
  website: text("website"),
  openingHours: text("opening_hours"), // JSON string
  isOpen: boolean("is_open"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const searches = pgTable("searches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  address: text("address"),
  radius: integer("radius").notNull().default(5000), // in meters
  category: text("category").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const insertDisasterAlertSchema = createInsertSchema(disasterAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertPlaceSchema = createInsertSchema(places).omit({
  id: true,
  createdAt: true,
});

export const insertSearchSchema = createInsertSchema(searches).omit({
  id: true,
  createdAt: true,
});

export type InsertDisasterAlert = z.infer<typeof insertDisasterAlertSchema>;
export type DisasterAlert = typeof disasterAlerts.$inferSelect;

export type InsertPlace = z.infer<typeof insertPlaceSchema>;
export type Place = typeof places.$inferSelect;

export type InsertSearch = z.infer<typeof insertSearchSchema>;
export type Search = typeof searches.$inferSelect;
