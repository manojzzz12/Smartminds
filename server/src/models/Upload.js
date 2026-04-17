import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    notebookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notebook",
      required: true,
      index: true
    },
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    mimeType: { type: String, required: true },
    extension: { type: String, required: true },
    size: { type: Number, required: true },
    storagePath: { type: String, required: true },
    extractedText: { type: String, default: "" },
    chunkCount: { type: Number, default: 0 },
    aiSummary: { type: String, default: "" },
    analysis: {
      contentType: { type: String, default: "unknown" },
      keywords: [{ type: String }],
      quiz: [{ question: String, options: [String], answer: String }],
      mindMap: { type: Object, default: null }
    }
  },
  { timestamps: true }
);

export const Upload = mongoose.model("Upload", uploadSchema);
