import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupWebSocket, notifyBot } from "./ws";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup WebSocket Server
  setupWebSocket(httpServer);

  // === PAIRING ROUTES ===

  // Bot posts pairing code
  app.post(api.pairing.relay.path, async (req, res) => {
    try {
      const input = api.pairing.relay.input.parse(req.body);
      await storage.storePairingCode(input);
      
      // Notify any connected clients via WS if needed, or just log
      console.log(`Received pairing code for ${input.botId}`);
      
      res.json({ message: "Pairing code stored" });
    } catch (err) {
       if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input" });
        return;
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User gets pairing code
  app.get(api.pairing.get.path, async (req, res) => {
    const botId = req.params.botId;
    const data = await storage.getPairingCode(botId);

    if (!data) {
      res.status(404).json({ message: "No active pairing code found for this Bot ID" });
      return;
    }

    const now = Date.now();
    const expiresInSeconds = Math.max(0, Math.floor((data.expiresAt - now) / 1000));

    res.json({
      code: data.code,
      expiresAt: data.expiresAt,
      expiresInSeconds
    });
  });

  // === SESSION ROUTES ===

  // Bot uploads session
  app.post(api.sessions.upload.path, async (req, res) => {
    try {
      const input = api.sessions.upload.input.parse(req.body);
      
      // Safety check: Don't overwrite unless explicitly allowed? 
      // Requirements say "Never overwrite a valid session unless explicitly deleted"
      // BUT bots might re-upload on reconnect or refresh. 
      // Checking if session exists first.
      const existing = await storage.getSession(input.botId);
      if (existing) {
        res.status(409).json({ message: "Session already exists. Delete it first." });
        return; 
      }

      await storage.saveSession(input);
      
      // Notify bot of success via WS
      notifyBot(input.botId, "session_saved", { success: true });
      
      res.json({ message: "Session stored successfully" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input" });
        return;
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Bot restores session
  app.get(api.sessions.get.path, async (req, res) => {
    const botId = req.params.botId;
    const session = await storage.getSession(botId);

    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    res.json(session);
  });

  // Admin deletes session
  app.delete(api.sessions.delete.path, async (req, res) => {
    const botId = req.params.botId;
    const session = await storage.getSession(botId);

    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    await storage.deleteSession(botId);
    
    // Notify bot to disconnect/reset
    notifyBot(botId, "session_deleted", { action: "reset" });

    res.json({ message: "Session deleted" });
  });

  // List sessions
  app.get(api.sessions.list.path, async (req, res) => {
    const sessions = await storage.listSessions();
    res.json(sessions);
  });

  return httpServer;
}
