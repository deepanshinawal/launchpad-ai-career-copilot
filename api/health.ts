import type { IncomingMessage, ServerResponse } from "node:http";

function sendJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    sendJson(res, 405, { error: "Method not allowed. Use GET /api/health." });
    return;
  }

  sendJson(res, 200, {
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
