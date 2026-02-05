import fs from "fs/promises";
import path from "path";
import { type PairingCodeRequest, type SessionRequest } from "@shared/schema";

// Ensure sessions directory exists
const SESSIONS_DIR = path.join(process.cwd(), "sessions");

async function ensureSessionsDir() {
  try {
    await fs.access(SESSIONS_DIR);
  } catch {
    await fs.mkdir(SESSIONS_DIR, { recursive: true });
  }
}

// Initialize directory on module load
ensureSessionsDir();

interface StoredPairingCode {
  code: string;
  expiresAt: number;
}

export interface IStorage {
  // Pairing Codes (In-Memory)
  storePairingCode(data: PairingCodeRequest): Promise<void>;
  getPairingCode(botId: string): Promise<StoredPairingCode | undefined>;
  
  // Sessions (File-Based)
  saveSession(data: SessionRequest): Promise<void>;
  getSession(botId: string): Promise<any | undefined>;
  deleteSession(botId: string): Promise<void>;
  listSessions(): Promise<string[]>;
}

export class FileStorage implements IStorage {
  private pairingCodes: Map<string, StoredPairingCode>;

  constructor() {
    this.pairingCodes = new Map();
    
    // Cleanup expired codes every minute
    setInterval(() => {
      const now = Date.now();
      for (const [botId, data] of this.pairingCodes.entries()) {
        if (data.expiresAt < now) {
          this.pairingCodes.delete(botId);
        }
      }
    }, 60 * 1000);
  }

  // --- Pairing Codes ---

  async storePairingCode(data: PairingCodeRequest): Promise<void> {
    const expiresAt = Date.now() + (data.expiresIn * 1000);
    this.pairingCodes.set(data.botId, {
      code: data.pairingCode,
      expiresAt,
    });
  }

  async getPairingCode(botId: string): Promise<StoredPairingCode | undefined> {
    const data = this.pairingCodes.get(botId);
    if (!data) return undefined;

    if (Date.now() > data.expiresAt) {
      this.pairingCodes.delete(botId);
      return undefined;
    }

    return data;
  }

  // --- Sessions ---

  private getSessionPath(botId: string): string {
    // Sanitize botId to prevent directory traversal
    const safeBotId = botId.replace(/[^a-zA-Z0-9_-]/g, "");
    return path.join(SESSIONS_DIR, `${safeBotId}.json`);
  }

  async saveSession(data: SessionRequest): Promise<void> {
    const filePath = this.getSessionPath(data.botId);
    await fs.writeFile(filePath, JSON.stringify(data.auth, null, 2));
  }

  async getSession(botId: string): Promise<any | undefined> {
    const filePath = this.getSessionPath(botId);
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return JSON.parse(content);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        return undefined;
      }
      throw err;
    }
  }

  async deleteSession(botId: string): Promise<void> {
    const filePath = this.getSessionPath(botId);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
        throw err;
      }
    }
  }

  async listSessions(): Promise<string[]> {
    try {
      const files = await fs.readdir(SESSIONS_DIR);
      return files
        .filter(f => f.endsWith(".json"))
        .map(f => f.replace(".json", ""));
    } catch (err) {
      return [];
    }
  }
}

export const storage = new FileStorage();
