import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { userFilterSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Listings routes
  app.get("/api/listings", async (req, res) => {
    const filters = req.query;
    const listings = await storage.getListings(filters);
    res.json(listings);
  });

  app.get("/api/listings/:postId", async (req, res) => {
    const listing = await storage.getListingByPostId(req.params.postId);
    if (!listing) {
      return res.status(404).send("Listing not found");
    }
    res.json(listing);
  });

  // User subscription routes
  app.post("/api/user/subscribe", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = await storage.updateUserSubscription(req.user.id, true);
    res.json(user);
  });

  app.post("/api/user/telegram", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const schema = z.object({ chatId: z.string() });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }
    const user = await storage.updateUserTelegramChat(req.user.id, result.data.chatId);
    res.json(user);
  });

  // User filters routes
  app.get("/api/user/filters", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const filters = await storage.getUserFilters(req.user.id);
    res.json(filters);
  });

  app.post("/api/user/filters", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const result = userFilterSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }
    const filter = await storage.createUserFilter(req.user.id, result.data);
    res.json(filter);
  });

  app.put("/api/user/filters/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const result = userFilterSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }
    const filter = await storage.updateUserFilter(parseInt(req.params.id), result.data);
    res.json(filter);
  });

  app.delete("/api/user/filters/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteUserFilter(parseInt(req.params.id));
    res.sendStatus(200);
  });

  const httpServer = createServer(app);
  return httpServer;
}
