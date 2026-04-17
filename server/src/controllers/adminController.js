import { AdminConfig } from "../models/AdminConfig.js";
import { User } from "../models/User.js";
import { Notebook } from "../models/Notebook.js";
import { Upload } from "../models/Upload.js";
import { asyncHandler } from "../utils/asyncHandler.js";

async function getSingletonConfig() {
  const config = await AdminConfig.findOneAndUpdate(
    { singletonKey: "global" },
    {
      $setOnInsert: {
        singletonKey: "global",
        aiProviders: [
          { key: "openai", label: "OpenAI", enabled: true, isDefault: true },
          { key: "anthropic", label: "Claude", enabled: true, isDefault: false }
        ],
        notebookTemplates: []
      }
    },
    { upsert: true, new: true }
  );

  return config;
}

export const getAdminOverview = asyncHandler(async (_req, res) => {
  const [config, users, notebooks, uploads] = await Promise.all([
    getSingletonConfig(),
    User.countDocuments(),
    Notebook.countDocuments(),
    Upload.countDocuments()
  ]);

  res.json({
    config,
    metrics: {
      users,
      notebooks,
      uploads
    }
  });
});

export const updateAdminConfig = asyncHandler(async (req, res) => {
  const config = await getSingletonConfig();
  config.appBranding = req.body.appBranding ?? config.appBranding;
  config.aiProviders = req.body.aiProviders ?? config.aiProviders;
  config.notebookTemplates = req.body.notebookTemplates ?? config.notebookTemplates;
  await config.save();
  res.json({ config });
});
