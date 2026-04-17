import mongoose from "mongoose";

const notebookTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    starterPrompts: [{ type: String }]
  },
  { _id: false }
);

const adminConfigSchema = new mongoose.Schema(
  {
    singletonKey: { type: String, default: "global", unique: true },
    appBranding: {
      heroTitle: { type: String, default: "Build knowledge, not chaos." },
      heroSubtitle: {
        type: String,
        default:
          "Upload rich sources, chat with context, and turn raw files into summaries, quizzes, and mind maps."
      },
      accent: { type: String, default: "#e88437" }
    },
    aiProviders: [
      {
        key: String,
        label: String,
        enabled: Boolean,
        isDefault: Boolean
      }
    ],
    notebookTemplates: [notebookTemplateSchema]
  },
  { timestamps: true }
);

export const AdminConfig = mongoose.model("AdminConfig", adminConfigSchema);
