import cors from "cors";
import express from "express";
import morgan from "morgan";
import routes from "./routes/index.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true
    })
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(morgan("dev"));

  app.get("/", (_req, res) => {
    res.json({
      name: "SourceMind API",
      status: "ok",
      docs: "/api/health"
    });
  });

  app.use("/api", routes);
  app.use(errorHandler);

  return app;
}
