# SourceMind

SourceMind is a full-stack AI-powered research workspace inspired by NotebookLM. It supports multi-format uploads, notebook-scoped memory, contextual chat, summaries, quizzes, mind maps, and admin-level provider controls.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- AI integration: provider abstraction for Gemini, OpenAI, and Claude-style APIs
- File ingestion: PDF, DOCX, XLSX/CSV, images via OCR, audio/video transcription

## Quick Start

1. Copy `.env.example` to `.env` and fill in the required values.
   For Gemini, set `AI_PROVIDER=gemini`, add your `GEMINI_API_KEY`, and optionally configure `GEMINI_FALLBACK_MODELS` for automatic failover during temporary model overload.
2. Install dependencies:

```bash
npm run install:all
```

3. Start MongoDB locally.
4. Run the app:

```bash
npm run dev
```

- Client: `http://localhost:5173`
- Server: `http://localhost:5000` or the `PORT` set in `.env`

## Main Capabilities

- JWT-based authentication with `user` and `admin` roles
- Smart notebooks with notebook-scoped file collections and chat history
- Multi-format upload ingestion pipeline
- Gemini-backed multimodal file analysis for PDF, image, audio, and video uploads
- Chunked source retrieval for faster, more grounded notebook answers
- Dynamic output modes: summary, detailed explanation, QA, audio script, mind map, quiz
- Recommendation chips and memory panel
- Admin overview with provider and template configuration

## Project Structure

```text
client/   React application
server/   Express API and AI ingestion pipeline
docs/     API docs, schema notes, deployment guide
```

See [API documentation](./docs/API.md), [database schema](./docs/SCHEMA.md), and [deployment guide](./docs/DEPLOYMENT.md).
