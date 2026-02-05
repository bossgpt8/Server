import { WebSocket, WebSocketServer } from "ws";
import type { Server } from "http";

// Map botId -> WebSocket connection
const botConnections = new Map<string, WebSocket>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws, req) => {
    // Basic identification via query param ?botId=...
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const botId = url.searchParams.get("botId");

    if (botId) {
      botConnections.set(botId, ws);
      console.log(`Bot connected: ${botId}`);

      ws.on("close", () => {
        botConnections.delete(botId);
        console.log(`Bot disconnected: ${botId}`);
      });
    }

    ws.on("message", (message) => {
      // Handle incoming messages from bots if needed
      // For now, we mainly use this channel to send updates TO bots
    });
    
    // Ping/Pong to keep connection alive
    ws.on("pong", () => {
        // connection is alive
    });
  });
  
  return wss;
}

export function notifyBot(botId: string, type: string, payload: any) {
  const ws = botConnections.get(botId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, payload }));
    return true;
  }
  return false;
}
