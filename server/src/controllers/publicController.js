import { AdminConfig } from "../models/AdminConfig.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getPublicConfig = asyncHandler(async (_req, res) => {
  const config = await AdminConfig.findOne({ singletonKey: "global" });
  res.json({
    branding: config?.appBranding || {
      heroTitle: "Build knowledge, not chaos.",
      heroSubtitle:
        "SourceMind turns raw files into a living research workspace with grounded chat, summaries, quizzes, and mind maps.",
      accent: "#e88437"
    }
  });
});
