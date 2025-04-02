import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { userFilterSchema } from "@shared/schema";
import { z } from "zod";
import sgMail from "@sendgrid/mail";

// Initialize SendGrid with API key from environment variables
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.error("SendGrid API key is not set in environment.");
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Listings routes
  app.get("/api/listings", async (req, res) => {
    const query = req.query;

    // Convert numeric filters from strings to numbers
    const filters = {
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
      minSize: query.minSize ? Number(query.minSize) : undefined,
      maxSize: query.maxSize ? Number(query.maxSize) : undefined,
      minRooms: query.minRooms ? Number(query.minRooms) : undefined,
      maxRooms: query.maxRooms ? Number(query.maxRooms) : undefined,
      neighborhoods: query.neighborhoods
        ? Array.isArray(query.neighborhoods)
          ? query.neighborhoods
          : [query.neighborhoods]
        : undefined,
      balcony: query.balcony,
      agent: query.agent,
      parking: query.parking,
      furnished: query.furnished,
      includeZeroPrice: query.includeZeroPrice === "false" ? false : true,
      includeZeroSize: query.includeZeroSize === "false" ? false : true,
      includeZeroRooms: query.includeZeroRooms === "false" ? false : true,
    };

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
    const user = await storage.updateUserTelegramChat(
      req.user.id,
      result.data.chatId,
    );
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
    const filter = await storage.updateUserFilter(
      parseInt(req.params.id),
      result.data,
    );
    res.json(filter);
  });

  app.delete("/api/user/filters/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteUserFilter(parseInt(req.params.id));
    res.sendStatus(200);
  });

  // New Contact Form Route using SendGrid
  app.post("/api/contact", async (req: Request, res: Response) => {
    // Extract data from request body; adjust the fields as needed.
    const { email, message, name, phone } = req.body;
    if (!email || !message) {
      return res.status(400).json({ error: "Missing email or message." });
    }

    const msg = {
      to: "amit@magicportraits.io", // Default admin email
      from: "amit@magicportraits.io", // Default sender email
      subject: "New Contact Form Submission",
      text: `
        Name: ${name || "N/A"}
        Email: ${email}
        Phone: ${phone || "N/A"}
        Message: ${message}
      `,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name || "N/A"}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log("Email sent successfully via SendGrid");
      res.status(200).json({ message: "Email sent successfully." });
    } catch (error) {
      console.error("Error sending email via SendGrid:", error);
      res.status(500).json({ error: "Failed to send email." });
    }
  });

  // Telegram webhook and private subscription routes remain unchanged
  app.post("/api/telegram/webhook", async (req: Request, res: Response) => {
    try {
      const update = req.body;
      if (update.message && update.message.text) {
        const text: string = update.message.text;
        const chatId: number = update.message.chat.id;
        const chatType: string = update.message.chat.type;
        if (text === "/start" && chatType === "private") {
          const token = generateRandomToken();
          const url = process.env.APP_URL;
          console.log(url);
          const link = `${url}/dashboard/private-subscription?chat_id=${chatId}&token=${token}`;
          await sendTelegramMessage(
            chatId,
            `ברוכים הבאים! לחצו על הקישור והגדירו את הפילטרים הייחודים עבורכם לקבלת מודעות ספציפיות ישירות לצ'אט האישי!\n${link}`,
          );
        }
      }
      res.sendStatus(200);
    } catch (err) {
      console.error("Error in Telegram webhook:", err);
      res.sendStatus(200);
    }
  });

  // New GET endpoint for fetching Telegram private subscription preferences
  app.get("/api/telegram/private-subscription", async (req, res) => {
    const { chat_id, token } = req.query;
    if (!chat_id || !token) {
      return res.status(400).json({ error: "Missing chat_id or token" });
    }
    try {
      // Retrieve the subscription by chat_id (token verification logic can be added here if needed)
      const subscription = await storage.getTelegramSubscriptionByChatId(
        chat_id as string,
      );
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      res.json(subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post(
    "/api/telegram/private-subscription",
    async (req: Request, res: Response) => {
      try {
        const {
          chatId,
          token,
          targetType,
          minPrice,
          maxPrice,
          minSize,
          maxSize,
          neighborhoods,
          minRooms,
          maxRooms,
          balcony,
          agent,
          parking,
          furnished,
          includeZeroPrice,
          includeZeroSize,
          includeZeroRooms,
        } = req.body;

        const subscription = await storage.upsertTelegramSubscription({
          chat_id: chatId,
          target_type: targetType,
          min_price: minPrice,
          max_price: maxPrice,
          min_size: minSize,
          max_size: maxSize,
          neighborhoods,
          min_rooms: minRooms,
          max_rooms: maxRooms,
          balcony,
          agent,
          parking,
          furnished,
          include_zero_price: includeZeroPrice,
          include_zero_size: includeZeroSize,
          include_zero_rooms: includeZeroRooms,
        });

        res.json(subscription);
        await sendTelegramMessage(
          chatId,
          `מעכשיו תתחילו לקבל התראות לפי הפילטרים שהגדרתם, לשינוי הפילטרים או להפסקת קבלת ההתראות בחרו שוב באפשרות פה בצ'אט`,
        );
      } catch (error) {
        console.error("Error saving private subscription:", error);
        res.status(500).json({ error: "Failed to save subscription" });
      }
    },
  );

  const httpServer = createServer(app);
  return httpServer;
}

/**
 * Helper: Sends a Telegram message to a specified chat.
 */
async function sendTelegramMessage(chatId: number, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN not set in environment");
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!response.ok) {
    console.error("Failed to send Telegram message", await response.text());
  }
}

/**
 * Helper: Generate a random token (for demonstration).
 */
function generateRandomToken(): string {
  return Math.random().toString(36).substring(2, 15);
}
