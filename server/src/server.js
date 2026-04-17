import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { createApp } from "./app.js";

const app = createApp();

connectDb(env.mongoUri)
  .then(() => {
    app.listen(env.port, () => {
      console.log(`API server running on http://localhost:${env.port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed", error);
    process.exit(1);
  });
