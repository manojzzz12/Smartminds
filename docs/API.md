# API Documentation

Base URL: `/api`

## Auth

### `POST /auth/signup`

```json
{
  "name": "Ava Patel",
  "email": "ava@example.com",
  "password": "strongpassword"
}
```

Returns a JWT token and user profile.

### `POST /auth/login`

```json
{
  "email": "ava@example.com",
  "password": "strongpassword"
}
```

### `GET /auth/me`

Requires `Authorization: Bearer <token>`.

## Notebooks

### `GET /notebooks`

Lists notebooks for the authenticated user.

### `POST /notebooks`

```json
{
  "title": "Quarterly Research",
  "description": "Earnings, market notes, and interviews",
  "templateKey": "research-brief",
  "color": "#e88437"
}
```

### `GET /notebooks/:id`

Returns notebook details, uploads, and chat messages.

### `PATCH /notebooks/:id`

Updates notebook metadata.

### `DELETE /notebooks/:id`

Deletes the notebook and its related uploads/chat history.

## Uploads

### `POST /uploads`

Multipart form data:

- `file`: binary source
- `notebookId`: target notebook id

Supported types:

- `PDF`
- `DOCX`
- `XLSX`
- `CSV`
- `PNG/JPEG/WEBP`
- `MP3/WAV`
- `MP4`
- `TXT`

The backend extracts text, runs AI analysis, stores memory insights, and returns the saved upload record.

When `AI_PROVIDER=gemini`, PDF, image, audio, and video uploads can be analyzed through Gemini's multimodal file flow in addition to local extraction.

## Chat

### `POST /chat`

```json
{
  "notebookId": "661f...",
  "prompt": "Summarize the key findings from all uploaded sources.",
  "outputMode": "summary"
}
```

Supported `outputMode` values:

- `summary`
- `detailed`
- `qa`
- `audio`
- `mindmap`
- `quiz`

Returns the user message, assistant message, and recommended follow-up questions.

## Admin

Admin routes require the authenticated user to have role `admin`.

### `GET /admin`

Returns usage metrics and global config.

### `PUT /admin`

```json
{
  "appBranding": {
    "heroTitle": "New title",
    "heroSubtitle": "New subtitle",
    "accent": "#529c89"
  },
  "aiProviders": [
    {
      "key": "openai",
      "label": "OpenAI",
      "enabled": true,
      "isDefault": true
    }
  ],
  "notebookTemplates": [
    {
      "name": "Meeting Analyst",
      "description": "Capture action items and blockers",
      "starterPrompts": ["What decisions were made?"]
    }
  ]
}
```
