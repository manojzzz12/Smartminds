import { Upload } from "../models/Upload.js";
import { ChatMessage } from "../models/ChatMessage.js";
import { SourceChunk } from "../models/SourceChunk.js";
import { providerRegistry } from "./providerRegistry.js";
import { rankChunksAgainstQuery } from "./retrievalService.js";

export async function buildNotebookContext(notebookId, query) {
  const [uploads, chunks] = await Promise.all([
    Upload.find({ notebookId }).sort({ createdAt: -1 }),
    SourceChunk.find({ notebookId }).sort({ createdAt: -1 }).limit(250)
  ]);

  const uploadMap = new Map(uploads.map((upload) => [String(upload._id), upload]));
  const rankedChunks = rankChunksAgainstQuery(chunks, query, uploadMap);
  const selectedChunks = [];
  let runningChars = 0;

  for (const chunk of rankedChunks) {
    const hasExplicitMatches = chunk.score > 0;
    if (!hasExplicitMatches && selectedChunks.length >= 6) break;
    if (runningChars + chunk.charCount > 7000 && selectedChunks.length >= 4) break;

    selectedChunks.push(chunk);
    runningChars += chunk.charCount;

    if (selectedChunks.length >= 8) break;
  }

  if (!selectedChunks.length) {
    selectedChunks.push(...chunks.slice(0, 4));
  }

  const sourceText = selectedChunks
    .map((chunk) => {
      const upload = uploadMap.get(String(chunk.uploadId));
      return [
        `FILE: ${upload?.originalName || "Unknown source"}`,
        `SUMMARY: ${upload?.aiSummary || "No summary available."}`,
        `CHUNK ${chunk.chunkIndex + 1}:`,
        chunk.text
      ].join("\n");
    })
    .join("\n\n");

  return {
    uploads,
    sourceText,
    selectedChunks
  };
}

export async function answerNotebookQuestion({
  notebook,
  user,
  prompt,
  outputMode
}) {
  const [history, context] = await Promise.all([
    ChatMessage.find({ notebookId: notebook._id }).sort({ createdAt: 1 }).limit(12),
    buildNotebookContext(notebook._id, prompt)
  ]);

  const historyText = history
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n");

  const modeInstructions = {
    summary: "Respond with a structured summary.",
    detailed: "Respond with a detailed explanation with sections.",
    qa: "Answer directly and cite which source files informed the answer.",
    audio: "Write a spoken-style script suitable for text-to-speech.",
    mindmap:
      'Return a JSON mind map with the shape {"label":"Root","children":[...]} only.',
    quiz:
      'Return JSON with the shape {"quiz":[{"question":"","options":[],"answer":""}]}.'
  };

  const composedPrompt = `
User: ${user.name}
Notebook: ${notebook.title}
Requested mode: ${outputMode}
Instruction: ${modeInstructions[outputMode] || "Answer naturally."}
Only answer from the provided notebook sources. If the answer is unclear from the retrieved chunks, say so briefly.

Previous chat:
${historyText || "No prior history."}

Notebook sources:
${context.sourceText || "No uploaded sources."}

User question:
${prompt}
  `;

  const reply =
    outputMode === "mindmap" || outputMode === "quiz"
      ? await providerRegistry.generateStructured(
          composedPrompt,
          outputMode === "mindmap"
            ? 'Return JSON with keys label:string and children:object[].'
            : 'Return JSON with key quiz containing an array of {question:string, options:string[], answer:string}.'
        )
      : await providerRegistry.generateText(composedPrompt);

  const recommendations =
    context.uploads.flatMap((item) => item.analysis?.keywords || []).slice(0, 5);

  return {
    reply,
    citations: context.selectedChunks.map((chunk) => {
      const upload = context.uploads.find((item) => String(item._id) === String(chunk.uploadId));
      const snippet =
        chunk.text.length > 220 ? `${chunk.text.slice(0, 220).trim()}...` : chunk.text;

      return {
        fileId: String(chunk.uploadId),
        label: `${upload?.originalName || "Source"} - chunk ${chunk.chunkIndex + 1}`,
        snippet,
        chunkIndex: chunk.chunkIndex + 1
      };
    }),
    recommendations: recommendations.map(
      (keyword) => `How does ${keyword} connect to the main source material?`
    )
  };
}
