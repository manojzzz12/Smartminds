import { Notebook } from "../models/Notebook.js";
import { ChatMessage } from "../models/ChatMessage.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { answerNotebookQuestion } from "../services/chatService.js";

export const sendMessage = asyncHandler(async (req, res) => {
  const { notebookId, prompt, outputMode = "qa" } = req.body;
  const notebook = await Notebook.findOne({ _id: notebookId, userId: req.user._id });
  if (!notebook) {
    throw new ApiError(404, "Notebook not found");
  }

  const userMessage = await ChatMessage.create({
    userId: req.user._id,
    notebookId,
    role: "user",
    content: prompt,
    outputMode
  });

  const result = await answerNotebookQuestion({
    notebook,
    user: req.user,
    prompt,
    outputMode
  });

  const assistantContent =
    typeof result.reply === "string" ? result.reply : JSON.stringify(result.reply, null, 2);

  const assistantMessage = await ChatMessage.create({
    userId: req.user._id,
    notebookId,
    role: "assistant",
    content: assistantContent,
    outputMode,
    citations: result.citations || []
  });

  notebook.memory.recommendations = result.recommendations.slice(0, 6);
  await notebook.save();

  res.status(201).json({
    userMessage,
    assistantMessage,
    recommendations: notebook.memory.recommendations
  });
});
