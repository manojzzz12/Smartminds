import fs from "fs/promises";
import path from "path";
import mammoth from "mammoth";
import pdf from "pdf-parse";
import ExcelJS from "exceljs";
import Tesseract from "tesseract.js";
import { providerRegistry } from "./providerRegistry.js";

async function extractTextFromPdf(filePath) {
  const buffer = await fs.readFile(filePath);
  const result = await pdf(buffer);
  return result.text || "";
}

async function extractTextFromDocx(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value || "";
}

async function extractTextFromSpreadsheet(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".csv") {
    const csv = await fs.readFile(filePath, "utf8");
    return `Sheet: CSV\n${csv}`;
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheets = [];
  workbook.eachSheet((worksheet) => {
    const rows = [];
    worksheet.eachRow((row) => {
      rows.push(
        row.values
          .slice(1)
          .map((value) => (value == null ? "" : String(value)))
          .join(" | ")
      );
    });
    sheets.push(`Sheet: ${worksheet.name}\n${rows.join("\n")}`);
  });

  return sheets.join("\n\n");
}

async function extractTextFromImage(filePath) {
  const {
    data: { text }
  } = await Tesseract.recognize(filePath, "eng");
  return text || "";
}

async function extractTextFromPlainText(filePath) {
  return fs.readFile(filePath, "utf8");
}

export async function ingestUploadedFile(file) {
  const extension = path.extname(file.originalname).toLowerCase();
  const contentType = file.mimetype;
  let extractedText = "";
  let multimodalAnalysis = null;

  const structuredPrompt =
    'Analyze this uploaded source. Create a concise executive summary, 8 keywords, 3 follow-up questions, a 5-question multiple-choice quiz, and a simple mind map JSON object with the shape {"label":"Root","children":[...]}.';
  const schemaHint =
    'Return JSON with keys: summary:string, keywords:string[], recommendations:string[], insights:string[], quiz:{question:string, options:string[], answer:string}[], mindMap:{label:string, children:object[]}.';

  if (contentType === "application/pdf") {
    extractedText = await extractTextFromPdf(file.path);
  } else if (
    contentType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    extractedText = await extractTextFromDocx(file.path);
  } else if (
    contentType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    contentType === "text/csv"
  ) {
    extractedText = await extractTextFromSpreadsheet(file.path);
  } else if (contentType.startsWith("image/")) {
    extractedText = await extractTextFromImage(file.path);
  } else if (contentType.startsWith("audio/") || contentType.startsWith("video/")) {
    extractedText = await providerRegistry.transcribe(file.path, contentType);
  } else {
    extractedText = await extractTextFromPlainText(file.path);
  }

  const normalizedText = extractedText.trim();
  if (
    contentType === "application/pdf" ||
    contentType.startsWith("image/") ||
    contentType.startsWith("audio/") ||
    contentType.startsWith("video/")
  ) {
    multimodalAnalysis = await providerRegistry.generateStructuredFromFile({
      filePath: file.path,
      mimeType: contentType,
      prompt:
        `${structuredPrompt}\n\nIf there is transcriptable speech or embedded readable text, include that understanding in the summary.`,
      schemaHint
    });
  }

  const summaryPrompt = `Analyze the following extracted source content. Create a concise executive summary, 8 keywords, 3 follow-up questions, a 5-question multiple-choice quiz, and a simple mind map JSON object with the shape {"label":"Root","children":[...]}.\n\nSOURCE:\n${normalizedText.slice(0, 9000)}`;

  const analysis =
    multimodalAnalysis ||
    (await providerRegistry.generateStructured(summaryPrompt, schemaHint));

  return {
    extension,
    contentType,
    extractedText: normalizedText,
    summary: analysis.summary || "",
    analysis: {
      contentType,
      keywords: analysis.keywords || [],
      quiz: analysis.quiz || [],
      mindMap: analysis.mindMap || { label: "Source", children: [] }
    },
    memory: {
      insights: analysis.insights || [],
      recommendations: analysis.recommendations || []
    }
  };
}
