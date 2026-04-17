import path from "path";
import { Notebook } from "../models/Notebook.js";
import { SourceChunk } from "../models/SourceChunk.js";
import { Upload } from "../models/Upload.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ingestUploadedFile } from "../services/ingestionService.js";
import { chunkText } from "../services/retrievalService.js";

export const uploadSource = asyncHandler(async (req, res) => {
  const notebook = await Notebook.findOne({
    _id: req.body.notebookId,
    userId: req.user._id
  });

  if (!notebook) {
    throw new ApiError(404, "Notebook not found");
  }

  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  const ingested = await ingestUploadedFile(req.file);

  const uploadRecord = await Upload.create({
    userId: req.user._id,
    notebookId: notebook._id,
    originalName: req.file.originalname,
    storedName: req.file.filename,
    mimeType: req.file.mimetype,
    extension: path.extname(req.file.originalname).toLowerCase(),
    size: req.file.size,
    storagePath: req.file.path,
    extractedText: ingested.extractedText,
    chunkCount: 0,
    aiSummary: ingested.summary,
    analysis: ingested.analysis
  });

  const chunks = chunkText(ingested.extractedText);
  if (chunks.length) {
    await SourceChunk.insertMany(
      chunks.map((chunk) => ({
        userId: req.user._id,
        notebookId: notebook._id,
        uploadId: uploadRecord._id,
        ...chunk
      }))
    );
    uploadRecord.chunkCount = chunks.length;
    await uploadRecord.save();
  }

  notebook.memory.insights = [
    ...(notebook.memory?.insights || []),
    ...(ingested.memory.insights || [])
  ].slice(-12);
  notebook.memory.recommendations = [
    ...(notebook.memory?.recommendations || []),
    ...(ingested.memory.recommendations || [])
  ].slice(-12);
  await notebook.save();

  res.status(201).json({ upload: uploadRecord, notebook });
});
