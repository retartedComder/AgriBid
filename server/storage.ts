import { IStorage } from "./types";
import createMemoryStore from "memorystore";
import session from "express-session";
import type {
  User,
  InsertUser,
  Product,
  InsertProduct,
  Contract,
  InsertContract,
  Message,
  InsertMessage,
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private contracts: Map<number, Contract>;
  private messages: Map<number, Message>;
  private currentId: Record<string, number>;
  readonly sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.contracts = new Map();
    this.messages = new Map();
    this.currentId = { users: 1, products: 1, contracts: 1, messages: 1 };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct & { farmerId: number; status: string }): Promise<Product> {
    const id = this.currentId.products++;
    const newProduct = {
      ...product,
      id,
      createdAt: new Date(),
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, updates: { status: string }): Promise<Product> {
    const product = this.products.get(id);
    if (!product) {
      throw new Error("Product not found");
    }
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async getContract(id: number): Promise<Contract | undefined> {
    return this.contracts.get(id);
  }

  async createContract(contract: InsertContract & { buyerId: number; farmerId: number; status: string }): Promise<Contract> {
    const id = this.currentId.contracts++;
    const newContract = {
      ...contract,
      id,
      createdAt: new Date(),
    };
    this.contracts.set(id, newContract);
    return newContract;
  }

  async updateContract(id: number, status: string): Promise<Contract> {
    const contract = this.contracts.get(id);
    if (!contract) {
      throw new Error("Contract not found");
    }
    const updatedContract = { ...contract, status };
    this.contracts.set(id, updatedContract);
    return updatedContract;
  }

  async getContractsByUser(userId: number): Promise<Contract[]> {
    return Array.from(this.contracts.values()).filter(
      (contract) => contract.buyerId === userId || contract.farmerId === userId,
    );
  }

  async createMessage(message: InsertMessage & { senderId: number }): Promise<Message> {
    const id = this.currentId.messages++;
    const newMessage = { ...message, id, createdAt: new Date() };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) =>
        (message.senderId === user1Id && message.receiverId === user2Id) ||
        (message.senderId === user2Id && message.receiverId === user1Id),
    );
  }
}

export const storage = new MemStorage();