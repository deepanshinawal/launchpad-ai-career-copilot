import "dotenv/config";
import express from "express";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import path from "path";
import { fileURLToPath } from "url";
import healthHandler from "./api/health.ts";
import careerPlanHandler from "./api/career-plan.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === "production";

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  // Ensure malformed JSON request bodies return valid JSON instead of Express HTML error pages
  app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && "body" in err && req.path.startsWith("/api/")) {
      res.status(400).json({ error: "Invalid JSON request body." });
      return;
    }
    next(err);
  });

  app.all("/api/health", (req: Request, res: Response) => {
    healthHandler(req, res);
  });

  app.all("/api/career-plan", (req: Request, res: Response, next: NextFunction) => {
    careerPlanHandler(req, res).catch(next);
  });

  // Never let unmatched /api/* routes fall through to SPA HTML
  app.use("/api", (_req: Request, res: Response) => {
    res.status(404).json({ error: "API route not found." });
  });

  app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api/") && !res.headersSent) {
      const message = err instanceof Error ? err.message : "Internal server error.";
      res.status(500).json({ error: message });
      return;
    }
    next(err);
  });

  if (!isProduction) {
    let viteMiddleware: RequestHandler | null = null;
    const viteReady = import("vite")
      .then(({ createServer: createViteServer }) =>
        createViteServer({
          server: { middlewareMode: true },
          appType: "spa",
        })
      )
      .then((vite) => {
        viteMiddleware = vite.middlewares;
        return vite;
      })
      .catch((err) => {
        console.error("Failed to initialize Vite dev middleware:", err);
        throw err;
      });

    app.use((req: Request, res: Response, next: NextFunction) => {
      if (viteMiddleware) {
        viteMiddleware(req, res, next);
        return;
      }
      viteReady
        .then(() => {
          if (viteMiddleware) {
            viteMiddleware(req, res, next);
          } else {
            next(new Error("Vite middleware unavailable"));
          }
        })
        .catch(next);
    });
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LaunchPad AI server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
