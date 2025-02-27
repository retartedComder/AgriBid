import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProductSchema, insertContractSchema, insertMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Users
  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const users = await storage.getAllUsers();
    res.json(users);
  });

  // Products
  app.get("/api/products", async (req, res) => {
    const products = await storage.getAllProducts();
    res.json(products);
  });

  app.post("/api/products", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Please login first");
      }

      if (req.user.role !== "farmer") {
        return res.status(403).send("Only farmers can create products");
      }

      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct({
        ...data,
        farmerId: req.user.id,
        status: "available",
      });
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  });

  // Contracts
  app.post("/api/contracts", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Please login first");
      }

      if (req.user.role !== "buyer") {
        return res.status(403).send("Only buyers can create contracts");
      }

      const data = insertContractSchema.parse(req.body);
      const product = await storage.getProduct(data.productId);

      if (!product) {
        return res.status(404).send("Product not found");
      }

      if (product.status !== "available") {
        return res.status(400).send("This product is not available for contracts");
      }

      const contract = await storage.createContract({
        ...data,
        buyerId: req.user.id,
        farmerId: product.farmerId,
        status: "pending",
      });

      // Update product status
      await storage.updateProduct(product.id, { status: "pending" });

      res.status(201).json(contract);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/contracts", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const contracts = await storage.getContractsByUser(req.user.id);
    res.json(contracts);
  });

  app.patch("/api/contracts/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "farmer") {
      return res.status(403).send("Only farmers can update contracts");
    }

    const contractId = parseInt(req.params.id);
    const contract = await storage.getContract(contractId);

    if (!contract) {
      return res.status(404).send("Contract not found");
    }

    if (contract.farmerId !== req.user.id) {
      return res.status(403).send("You can only update your own contracts");
    }

    if (contract.status !== "pending") {
      return res.status(400).send("Only pending contracts can be updated");
    }

    const { status } = req.body;
    if (status !== "accepted" && status !== "rejected") {
      return res.status(400).send("Invalid status");
    }

    const updatedContract = await storage.updateContract(contractId, status);
    res.json(updatedContract);
  });

  // Messages
  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const data = insertMessageSchema.parse(req.body);
    const message = await storage.createMessage({
      ...data,
      senderId: req.user.id,
    });
    res.status(201).json(message);
  });

  app.get("/api/messages/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const messages = await storage.getMessagesBetweenUsers(
      req.user.id,
      parseInt(req.params.userId),
    );
    res.json(messages);
  });

  const httpServer = createServer(app);
  return httpServer;
}