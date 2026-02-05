import { z } from "zod";

// === PAIRING CODE SCHEMA ===
export const pairingCodeSchema = z.object({
  botId: z.string().min(1),
  pairingCode: z.string().min(1),
  expiresIn: z.number().positive(), // Duration in seconds
});

// === SESSION SCHEMA ===
export const sessionSchema = z.object({
  botId: z.string().min(1),
  auth: z.record(z.any()), // Baileys auth state (complex object)
});

// === TYPES ===
export type PairingCodeRequest = z.infer<typeof pairingCodeSchema>;
export type SessionRequest = z.infer<typeof sessionSchema>;

// Internal type for stored pairing codes
export interface StoredPairingCode {
  code: string;
  expiresAt: number;
}
