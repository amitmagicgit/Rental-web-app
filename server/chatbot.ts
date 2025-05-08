import { storage } from "./storage";
import type { Express, Request, Response } from "express";
import { Listing } from "@shared/schema";

// Helper function to standardize listing fields
function standardizeListing(listing: Listing) {
  return {
    post_id: listing.post_id,
    price: listing.price,
    address: listing.address,
    neighborhood: listing.neighborhood,
    num_rooms: listing.num_rooms,
    size: listing.size,
    agent: listing.agent,
    balcony: listing.balcony,
    parking: listing.parking,
    furnished: listing.furnished,
    detailed_description: listing.detailed_description,
    description: listing.description,
    created_at: listing.created_at,
    source_platform: listing.source_platform,
    city: listing.city,
    url: `https://thefinder.co.il/listing/${listing.post_id}`
  };
}

// Routes for chatbot to access listings
export function setupChatbotRoutes(app: Express) {
  // Get recent listings with filters from body
  app.post("/api/chat/listing/recent", async (req: Request, res: Response) => {
    try {
      const filters = {
        ...req.body,
        limit: 5 // Always limit to 5 for recent listings
      };

      const listings = await storage.getListings(filters);
      // Standardize each listing in the response
      const standardizedListings = listings.map(standardizeListing);
      res.json(standardizedListings);
    } catch (error) {
      console.error("Error fetching recent listings:", error);
      res.status(500).json({ error: "Failed to fetch recent listings" });
    }
  });

  // Get listing by post ID with filtered fields
  app.post("/api/chat/listing/by-id", async (req: Request, res: Response) => {
    try {
      const { postId } = req.body;
      
      if (!postId) {
        return res.status(400).json({ error: "Missing postId in request body" });
      }

      const listing = await storage.getListingByPostId(postId);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }

      // Use the helper function to standardize the listing
      const standardizedListing = standardizeListing(listing);
      res.json(standardizedListing);
    } catch (error) {
      console.error("Error fetching listing:", error);
      res.status(500).json({ error: "Failed to fetch listing" });
    }
  });
} 