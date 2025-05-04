import { mysqlTable, varchar, int, json, text } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model (adapting for MySQL)
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Form response schemas
export const formStepSchema = z.object({
  step: z.number().min(1).max(4),
  responses: z.record(z.union([z.string(), z.array(z.string())])),
});

export const careerMatchSchema = z.object({
  formResponses: z.record(z.union([z.string(), z.array(z.string())])),
});

export const careerRecommendationSchema = z.object({
  careerTitle: z.string(),
  explanation: z.string(),
  matchPercentage: z.number().optional(),
  alternativeCareers: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ).optional(),
  nextSteps: z.array(z.string()).optional(),
});

export type FormStep = z.infer<typeof formStepSchema>;
export type CareerMatch = z.infer<typeof careerMatchSchema>;
export type CareerRecommendation = z.infer<typeof careerRecommendationSchema>;
