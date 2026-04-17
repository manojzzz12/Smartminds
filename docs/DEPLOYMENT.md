# Deployment Guide

## Environment

Set these variables in production:

- `PORT`
- `CLIENT_URL`
- `MONGODB_URI`
- `JWT_SECRET`
- `AI_PROVIDER`
- `GEMINI_API_KEY` when using Gemini
- `GEMINI_FALLBACK_MODELS` for Gemini failover, for example `gemini-2.5-flash-lite`
- `OPENAI_API_KEY` and/or `ANTHROPIC_API_KEY`
- `UPLOAD_DIR`
- `MAX_FILE_SIZE_MB`

## Docker Deployment

The project now includes:

- [docker-compose.yml](../docker-compose.yml)
- [server/Dockerfile](../server/Dockerfile)
- [client/Dockerfile](../client/Dockerfile)
- [client/nginx.conf](../client/nginx.conf)

### Run With Docker Compose

1. Make sure your root `.env` contains at least:

```env
JWT_SECRET=your_secret
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_FALLBACK_MODELS=gemini-2.5-flash-lite,gemini-2-flash
```

2. Start the stack:

```bash
docker compose up --build
```

3. Open:

- Frontend: `http://localhost:8080`
- Backend health: `http://localhost:5001/api/health`

The compose stack includes:

- `mongo` for MongoDB
- `server` for the Express API
- `client` for the built React app served by Nginx

## Vercel + Render Deployment

Recommended split:

- `Vercel` for the React frontend
- `Render` for the Express API
- `MongoDB Atlas` for the database

### 1. Deploy The API To Render

This repo now includes [render.yaml](../render.yaml).

1. Push the repo to GitHub.
2. In Render, create a new Blueprint or Web Service from the repo.
3. Use the `sourcemind-api` service from `render.yaml`.
4. Set these Render environment variables:

```env
CLIENT_URL=https://your-vercel-app.vercel.app
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
GEMINI_API_KEY=your_gemini_api_key
```

5. Deploy and note the backend URL, for example:

```text
https://sourcemind-api.onrender.com
```

### 2. Deploy The Frontend To Vercel

This repo now includes [vercel.json](../vercel.json).

1. Import the GitHub repo into Vercel.
2. Keep the project rooted at the repo root.
3. Add this environment variable in Vercel:

```env
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
```

4. Deploy.

### 3. Verify

- Frontend loads on Vercel
- Login/signup works
- Backend health endpoint returns OK:

```text
https://your-render-service.onrender.com/api/health
```

- Uploads and chat work against the Render API

## Backend Deployment

1. Provision MongoDB Atlas or a managed MongoDB cluster.
2. Deploy the `server` package on a Node 20+ host.
3. Mount persistent storage for `server/uploads`.
4. Run:

```bash
cd server
npm install
npm start
```

## Frontend Deployment

1. Set `VITE_API_BASE_URL` to the deployed API base URL if you are hosting the frontend separately, for example `https://api.example.com/api`.
2. Build and deploy:

```bash
cd client
npm install
npm run build
```

3. Serve the generated `client/dist` directory using Vercel, Netlify, Nginx, or a static host.

## Recommended Production Enhancements

- Move uploads to S3 or another object store
- Add background jobs for heavy OCR/transcription workloads
- Add vector search for large knowledge bases
- Add rate limiting, audit logs, and refresh tokens
- Add FFmpeg-backed video audio extraction if video transcription volume grows
- Add container registry + CI/CD pipeline for automated deploys
