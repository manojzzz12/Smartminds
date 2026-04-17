import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnvPath = path.resolve(__dirname, "../../../.env");

dotenv.config({ path: rootEnvPath });

const required = ["MONGODB_URI", "JWT_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  aiProvider: process.env.AI_PROVIDER || "gemini",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  geminiFallbackModels: (process.env.GEMINI_FALLBACK_MODELS || "gemini-2.5-flash-lite")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean),
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiModel: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  openAiEmbeddingModel:
    process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
  openAiTranscriptionModel:
    process.env.OPENAI_TRANSCRIPTION_MODEL || "gpt-4o-mini-transcribe",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  anthropicModel:
    process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
  uploadDir: process.env.UPLOAD_DIR || "server/uploads",
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 50)
};
