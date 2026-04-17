import mongoose from "mongoose";

const sourceChunkSchema = new mongoose.Schema(
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
    uploadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Upload",
      required: true,
      index: true
    },
    chunkIndex: { type: Number, required: true },
    text: { type: String, required: true },
    charCount: { type: Number, required: true },
    tokenHints: [{ type: String }]
  },
  { timestamps: true }
);

sourceChunkSchema.index({ notebookId: 1, uploadId: 1, chunkIndex: 1 }, { unique: true });

export const SourceChunk = mongoose.model("SourceChunk", sourceChunkSchema);
