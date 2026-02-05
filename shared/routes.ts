import { z } from "zod";
import { pairingCodeSchema, sessionSchema } from "./schema";

export const errorSchemas = {
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  pairing: {
    relay: {
      method: 'POST' as const,
      path: '/api/pair',
      input: pairingCodeSchema,
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/pair/:botId',
      responses: {
        200: z.object({ 
          code: z.string(), 
          expiresAt: z.number(),
          expiresInSeconds: z.number()
        }),
        404: errorSchemas.notFound,
      },
    },
  },
  sessions: {
    upload: {
      method: 'POST' as const,
      path: '/api/session',
      input: sessionSchema,
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/session/:botId',
      responses: {
        200: z.record(z.any()), // Returns the auth object directly
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/session/:botId',
      responses: {
        200: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/sessions',
      responses: {
        200: z.array(z.string()), // List of botIds
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
