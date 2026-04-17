# Database Schema

## `users`

- `name`: string
- `email`: unique string
- `password`: hashed string
- `role`: `user | admin`
- `preferences.theme`: string
- `preferences.defaultOutputMode`: string

## `notebooks`

- `userId`: ObjectId -> `users`
- `title`: string
- `description`: string
- `templateKey`: string
- `color`: string
- `memory.insights`: string[]
- `memory.recommendations`: string[]

## `uploads`

- `userId`: ObjectId -> `users`
- `notebookId`: ObjectId -> `notebooks`
- `originalName`: string
- `storedName`: string
- `mimeType`: string
- `extension`: string
- `size`: number
- `storagePath`: string
- `extractedText`: long text
- `aiSummary`: string
- `analysis.contentType`: string
- `analysis.keywords`: string[]
- `analysis.quiz`: array of quiz objects
- `analysis.mindMap`: JSON object

## `sourcechunks`

- `userId`: ObjectId -> `users`
- `notebookId`: ObjectId -> `notebooks`
- `uploadId`: ObjectId -> `uploads`
- `chunkIndex`: number
- `text`: chunk text
- `charCount`: number
- `tokenHints`: string[]

## `chatmessages`

- `userId`: ObjectId -> `users`
- `notebookId`: ObjectId -> `notebooks`
- `role`: `user | assistant | system`
- `content`: long text
- `outputMode`: string
- `citations`: array

## `adminconfigs`

- `singletonKey`: fixed global key
- `appBranding`: title, subtitle, accent color
- `aiProviders`: provider definitions and default selection
- `notebookTemplates`: reusable notebook presets
