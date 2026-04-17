import { Notebook } from "../models/Notebook.js";
import { Upload } from "../models/Upload.js";
import { SourceChunk } from "../models/SourceChunk.js";
import { ChatMessage } from "../models/ChatMessage.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

async function assertNotebookAccess(notebookId, userId) {
  const notebook = await Notebook.findOne({ _id: notebookId, userId });
  if (!notebook) {
    throw new ApiError(404, "Notebook not found");
  }
  return notebook;
}

export const listNotebooks = asyncHandler(async (req, res) => {
  const notebooks = await Notebook.find({ userId: req.user._id }).sort({ updatedAt: -1 });
  res.json({ notebooks });
});

export const createNotebook = asyncHandler(async (req, res) => {
  const notebook = await Notebook.create({
    userId: req.user._id,
    title: req.body.title || "Untitled Notebook",
    description: req.body.description || "",
    templateKey: req.body.templateKey || "",
    color: req.body.color || "#e88437"
  });
  res.status(201).json({ notebook });
});

export const updateNotebook = asyncHandler(async (req, res) => {
  const notebook = await assertNotebookAccess(req.params.id, req.user._id);
  notebook.title = req.body.title ?? notebook.title;
  notebook.description = req.body.description ?? notebook.description;
  notebook.color = req.body.color ?? notebook.color;
  await notebook.save();
  res.json({ notebook });
});

export const deleteNotebook = asyncHandler(async (req, res) => {
  await assertNotebookAccess(req.params.id, req.user._id);
  await Promise.all([
    Notebook.deleteOne({ _id: req.params.id }),
    Upload.deleteMany({ notebookId: req.params.id }),
    SourceChunk.deleteMany({ notebookId: req.params.id }),
    ChatMessage.deleteMany({ notebookId: req.params.id })
  ]);
  res.status(204).send();
});

export const getNotebookDetails = asyncHandler(async (req, res) => {
  const notebook = await assertNotebookAccess(req.params.id, req.user._id);
  const [uploads, messages] = await Promise.all([
    Upload.find({ notebookId: notebook._id }).sort({ createdAt: -1 }),
    ChatMessage.find({ notebookId: notebook._id }).sort({ createdAt: 1 })
  ]);
  res.json({ notebook, uploads, messages });
});
