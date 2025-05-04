import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { careerMatchSchema, careerRecommendationSchema } from "@shared/schema";
import { generateCareerRecommendation } from "./lib/openai";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "https://api.openai.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://replit.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // Apply rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." }
  });

  // Apply rate limiting to API routes
  app.use("/api", apiLimiter);

  // API endpoints
  app.post("/api/career-recommendation", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedBody = careerMatchSchema.safeParse(req.body);
      
      if (!validatedBody.success) {
        return res.status(400).json({ 
          error: "Invalid request data",
          details: validatedBody.error.format()
        });
      }

      const { formResponses } = validatedBody.data;
      
      // Generate career recommendation using OpenAI
      const recommendation = await generateCareerRecommendation(formResponses);
      
      // Validate the response from OpenAI
      const validatedRecommendation = careerRecommendationSchema.safeParse(recommendation);
      
      if (!validatedRecommendation.success) {
        console.error("Invalid recommendation format:", validatedRecommendation.error);
        return res.status(500).json({ 
          error: "Failed to generate valid recommendation",
          details: validatedRecommendation.error.format()
        });
      }
      
      return res.status(200).json(validatedRecommendation.data);
    } catch (error) {
      console.error("Error generating career recommendation:", error);
      return res.status(500).json({ 
        error: "Failed to process request",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
