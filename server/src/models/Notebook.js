import mongoose from "mongoose";

const notebookSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    templateKey: { type: String, default: "" },
    color: { type: String, default: "#e88437" },
    memory: {
      insights: { type: [{ type: String }], default: [] },
      recommendations: { type: [{ type: String }], default: [] }
    }
  },
  { timestamps: true }
);

export const Notebook = mongoose.model("Notebook", notebookSchema);
