import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["farmer", "buyer"] }).notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number"),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  farmerId: integer("farmer_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  quantity: text("quantity").notNull(),
  unit: text("unit").notNull(),
  price: text("price").notNull(),
  status: text("status", { enum: ["available", "sold", "pending"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyer_id").notNull(),
  farmerId: integer("farmer_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: text("quantity").notNull(),
  price: text("price").notNull(),
  status: text("status", { enum: ["pending", "accepted", "rejected", "completed"] }).notNull(),
  deliveryDate: timestamp("delivery_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Custom schema transformations
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  fullName: true,
  email: true,
  phoneNumber: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  quantity: true,
  unit: true,
  price: true,
});

export const insertContractSchema = createInsertSchema(contracts).pick({
  productId: true,
  quantity: true,
  price: true,
  deliveryDate: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  receiverId: true,
  content: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Contract = typeof contracts.$inferSelect;
export type Message = typeof messages.$inferSelect;