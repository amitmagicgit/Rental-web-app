import { User, InsertUser, Listing, UserFilter, InsertUserFilter } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSubscription(userId: number, isSubscribed: boolean): Promise<User>;
  updateUserTelegramChat(userId: number, chatId: string): Promise<User>;
  
  getListings(filters?: Partial<UserFilter>): Promise<Listing[]>;
  getListingByPostId(postId: string): Promise<Listing | undefined>;
  
  getUserFilters(userId: number): Promise<UserFilter[]>;
  createUserFilter(userId: number, filter: InsertUserFilter): Promise<UserFilter>;
  updateUserFilter(filterId: number, filter: Partial<InsertUserFilter>): Promise<UserFilter>;
  deleteUserFilter(filterId: number): Promise<void>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private listings: Map<string, Listing>;
  private userFilters: Map<number, UserFilter>;
  currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.listings = new Map();
    this.userFilters = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Add some sample listings
    this.addSampleListings();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id, 
      isSubscribed: false,
      telegramChatId: null 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserSubscription(userId: number, isSubscribed: boolean): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, isSubscribed };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserTelegramChat(userId: number, chatId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, telegramChatId: chatId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getListings(filters?: Partial<UserFilter>): Promise<Listing[]> {
    let listings = Array.from(this.listings.values());
    
    if (filters) {
      listings = listings.filter(listing => {
        if (filters.minPrice && listing.price && listing.price < filters.minPrice) return false;
        if (filters.maxPrice && listing.price && listing.price > filters.maxPrice) return false;
        if (filters.minSize && listing.size && listing.size < filters.minSize) return false;
        if (filters.maxSize && listing.size && listing.size > filters.maxSize) return false;
        if (filters.minRooms && listing.numRooms && listing.numRooms < filters.minRooms) return false;
        if (filters.maxRooms && listing.numRooms && listing.numRooms > filters.maxRooms) return false;
        if (filters.neighborhoods && !filters.neighborhoods.includes(listing.neighborhood || '')) return false;
        if (filters.balcony && listing.balcony !== filters.balcony) return false;
        if (filters.agent && listing.agent !== filters.agent) return false;
        if (filters.parking && listing.parking !== filters.parking) return false;
        if (filters.furnished && listing.furnished !== filters.furnished) return false;
        return true;
      });
    }

    return listings;
  }

  async getListingByPostId(postId: string): Promise<Listing | undefined> {
    return this.listings.get(postId);
  }

  async getUserFilters(userId: number): Promise<UserFilter[]> {
    return Array.from(this.userFilters.values()).filter(filter => filter.userId === userId);
  }

  async createUserFilter(userId: number, filter: InsertUserFilter): Promise<UserFilter> {
    const id = this.currentId++;
    const userFilter: UserFilter = {
      ...filter,
      id,
      userId,
      createdAt: new Date(),
    };
    this.userFilters.set(id, userFilter);
    return userFilter;
  }

  async updateUserFilter(filterId: number, filter: Partial<InsertUserFilter>): Promise<UserFilter> {
    const existingFilter = this.userFilters.get(filterId);
    if (!existingFilter) throw new Error("Filter not found");

    const updatedFilter = { ...existingFilter, ...filter };
    this.userFilters.set(filterId, updatedFilter);
    return updatedFilter;
  }

  async deleteUserFilter(filterId: number): Promise<void> {
    this.userFilters.delete(filterId);
  }

  private addSampleListings() {
    const sampleListings: Omit<Listing, 'id'>[] = [
      {
        postId: "1",
        description: "Modern 2-bedroom apartment in city center",
        price: 1500,
        address: "123 Main St",
        neighborhood: "Downtown",
        numRooms: 2,
        size: 75,
        agent: "yes",
        balcony: "yes",
        parking: "yes",
        furnished: "yes",
        detailedDescription: "Beautiful modern apartment with great views...",
        url: "https://example.com/listing1",
        createdAt: new Date(),
      },
      // Add more sample listings as needed
    ];

    sampleListings.forEach((listing, index) => {
      this.listings.set(listing.postId, { ...listing, id: index + 1 });
    });
  }
}

export const storage = new MemStorage();
