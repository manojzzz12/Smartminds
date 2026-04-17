import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import mime from "mime-types";
import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

function buildOpenAiHeaders() {
  if (!env.openAiApiKey) {
    throw new ApiError(500, "Missing OPENAI_API_KEY");
  }
  return {
    Authorization: `Bearer ${env.openAiApiKey}`
  };
}

function getGeminiClient() {
  if (!env.geminiApiKey) {
    throw new ApiError(500, "Missing GEMINI_API_KEY");
  }
  return new GoogleGenAI({ apiKey: env.geminiApiKey });
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getGeminiModelCandidates() {
  return [env.geminiModel, ...env.geminiFallbackModels].filter(
    (model, index, values) => model && values.indexOf(model) === index
  );
}

function isRetryableGeminiError(error) {
  const status = error.response?.status || error.status || error.code;
  return status === 503 || status === 504 || status === "UNAVAILABLE";
}

function normalizeProviderError(error) {
  const status = error.response?.status || error.status;
  const providerMessage =
    error.response?.data?.error?.message ||
    error.response?.data?.message ||
    error.message;

  if (status === 503 || status === 504) {
    throw new ApiError(
      503,
      "AI provider is temporarily overloaded. Please try again shortly.",
      providerMessage
    );
  }

  if (status === 429) {
    throw new ApiError(
      429,
      "AI provider rate limit or quota exceeded. Check your billing/usage, wait a moment, then try again.",
      providerMessage
    );
  }

  if (status === 401 || status === 403) {
    throw new ApiError(
      401,
      "AI provider rejected the API key. Verify the configured provider credentials.",
      providerMessage
    );
  }

  if (status === 400) {
    throw new ApiError(400, "AI provider rejected the request.", providerMessage);
  }

  throw new ApiError(502, "AI provider request failed.", providerMessage);
}

function extractGeminiText(response) {
  return response.text || response.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
}

async function uploadGeminiFile(filePath, mimeType) {
  const client = getGeminiClient();
  const uploaded = await client.files.upload({
    file: filePath,
    config: { mimeType: mimeType || mime.lookup(filePath) || "application/octet-stream" }
  });

  if (!uploaded?.uri) {
    throw new ApiError(502, "Gemini file upload did not return a usable file URI.");
  }

  return uploaded;
}

async function runGeminiWithFallback(executor) {
  const models = getGeminiModelCandidates();
  let lastError = null;

  for (let index = 0; index < models.length; index += 1) {
    const model = models[index];
    try {
      return await executor(model);
    } catch (error) {
      lastError = error;
      if (!isRetryableGeminiError(error) || index === models.length - 1) {
        normalizeProviderError(error);
      }
      await sleep(350 * (index + 1));
    }
  }

  normalizeProviderError(lastError);
}

async function geminiJsonResponse(prompt, schemaHint = "") {
  try {
    const response = await runGeminiWithFallback(async (model) => {
      const client = getGeminiClient();
      return client.models.generateContent({
        model,
        contents: `${schemaHint}\nReturn valid JSON only.\n\n${prompt}`,
        config: {
          responseMimeType: "application/json"
        }
      });
    });

    return JSON.parse(extractGeminiText(response));
  } catch (error) {
    normalizeProviderError(error);
  }
}

async function geminiTextResponse(prompt) {
  try {
    const response = await runGeminiWithFallback(async (model) => {
      const client = getGeminiClient();
      return client.models.generateContent({
        model,
        contents: prompt
      });
    });

    return extractGeminiText(response);
  } catch (error) {
    normalizeProviderError(error);
  }
}

async function geminiStructuredFromFile({ filePath, mimeType, prompt, schemaHint }) {
  try {
    const uploaded = await uploadGeminiFile(filePath, mimeType);
    const response = await runGeminiWithFallback(async (model) => {
      const client = getGeminiClient();
      return client.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              {
                fileData: {
                  fileUri: uploaded.uri,
                  mimeType: uploaded.mimeType || mimeType
                }
              },
              {
                text: `${schemaHint}\nReturn valid JSON only.\n\n${prompt}`
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });
    });

    return JSON.parse(extractGeminiText(response));
  } catch (error) {
    normalizeProviderError(error);
  }
}

async function geminiTextFromFile({ filePath, mimeType, prompt }) {
  try {
    const uploaded = await uploadGeminiFile(filePath, mimeType);
    const response = await runGeminiWithFallback(async (model) => {
      const client = getGeminiClient();
      return client.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              {
                fileData: {
                  fileUri: uploaded.uri,
                  mimeType: uploaded.mimeType || mimeType
                }
              },
              { text: prompt }
            ]
          }
        ]
      });
    });

    return extractGeminiText(response);
  } catch (error) {
    normalizeProviderError(error);
  }
}

async function openAiJsonResponse(prompt, schemaHint = "") {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: env.openAiModel,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a research assistant that returns clean JSON only. " +
              schemaHint
          },
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          ...buildOpenAiHeaders(),
          "Content-Type": "application/json"
        }
      }
    );

    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    normalizeProviderError(error);
  }
}

async function openAiTextResponse(prompt) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: env.openAiModel,
        messages: [
          {
            role: "system",
            content:
              "You are an expert knowledge assistant. Be clear, structured, and grounded in the provided source context."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          ...buildOpenAiHeaders(),
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    normalizeProviderError(error);
  }
}

async function openAiTranscribe(filePath) {
  try {
    const form = new FormData();
    form.append("model", env.openAiTranscriptionModel);
    form.append("file", fs.createReadStream(filePath));

    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      form,
      {
        headers: {
          ...buildOpenAiHeaders(),
          ...form.getHeaders()
        }
      }
    );

    return response.data.text;
  } catch (error) {
    normalizeProviderError(error);
  }
}

async function anthropicTextResponse(prompt) {
  if (!env.anthropicApiKey) {
    throw new ApiError(500, "Missing ANTHROPIC_API_KEY");
  }

  try {
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: env.anthropicModel,
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          "x-api-key": env.anthropicApiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.content?.[0]?.text || "";
  } catch (error) {
    normalizeProviderError(error);
  }
}

export const providerRegistry = {
  async generateText(prompt) {
    if (env.aiProvider === "anthropic") {
      return anthropicTextResponse(prompt);
    }
    if (env.aiProvider === "gemini") {
      return geminiTextResponse(prompt);
    }
    return openAiTextResponse(prompt);
  },

  async generateStructured(prompt, schemaHint) {
    if (env.aiProvider === "anthropic") {
      const text = await anthropicTextResponse(
        `${schemaHint}\nRespond with JSON only.\n\n${prompt}`
      );
      return JSON.parse(text);
    }
    if (env.aiProvider === "gemini") {
      return geminiJsonResponse(prompt, schemaHint);
    }
    return openAiJsonResponse(prompt, schemaHint);
  },

  async generateStructuredFromFile({ filePath, mimeType, prompt, schemaHint }) {
    if (env.aiProvider === "gemini") {
      return geminiStructuredFromFile({ filePath, mimeType, prompt, schemaHint });
    }
    return this.generateStructured(prompt, schemaHint);
  },

  async generateTextFromFile({ filePath, mimeType, prompt }) {
    if (env.aiProvider === "gemini") {
      return geminiTextFromFile({ filePath, mimeType, prompt });
    }
    return this.generateText(prompt);
  },

  async transcribe(filePath, mimeType) {
    if (env.aiProvider === "gemini") {
      return geminiTextFromFile({
        filePath,
        mimeType,
        prompt:
          "Generate a clean transcript of this file. If there are speakers, label them when possible."
      });
    }
    if (env.aiProvider !== "openai") {
      throw new ApiError(
        400,
        "Audio transcription is currently implemented for OpenAI and Gemini."
      );
    }
    return openAiTranscribe(filePath);
  }
};
