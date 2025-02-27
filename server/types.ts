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

export interface IStorage {
  readonly sessionStore: session.Store;

  // User operations
  getAllUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Product operations
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct & { farmerId: number; status: string }): Promise<Product>;
  updateProduct(id: number, updates: { status: string }): Promise<Product>;

  // Contract operations
  getContract(id: number): Promise<Contract | undefined>;
  getContractsByUser(userId: number): Promise<Contract[]>;
  createContract(contract: InsertContract & { buyerId: number; farmerId: number; status: string }): Promise<Contract>;
  updateContract(id: number, status: string): Promise<Contract>;

  // Message operations
  getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]>;
  createMessage(message: InsertMessage & { senderId: number }): Promise<Message>;
}