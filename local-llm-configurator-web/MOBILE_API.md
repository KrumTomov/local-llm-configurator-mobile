# NeuroForge Mobile REST API

Base path: `/api/mobile/v1`

Mobile clients authenticate with JWT bearer tokens:

```http
Authorization: Bearer <accessToken>
```

Standard success response:

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "pageSize": 20 }
}
```

Standard error response:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "field is required.",
    "details": {}
  }
}
```

Pagination: list endpoints accept `page` and `pageSize` query params. `pageSize` is capped at `100`.

Filtering and sorting: implemented filters are listed per endpoint. Sorting defaults to newest first for user-owned records and registry order for models.

Rate limiting recommendation: apply IP + user token rate limits at the deployment edge, for example `60 req/min` for general API reads, `20 req/min` for writes, and stricter limits for auth endpoints such as `10 attempts/min` per IP/email.

Role authorization: mobile auth helper supports route-level role guards. Current user-owned endpoints require any authenticated role; admin-only mobile endpoints can call `requireMobileSession(request, ["admin"])`.

## Authentication

### POST `/auth/register`
Registers a user. Auth: public.

Request:

```json
{ "name": "Krum", "email": "krum@example.com", "password": "Password123" }
```

Success `201`:

```json
{ "success": true, "data": { "accessToken": "jwt", "tokenType": "Bearer", "expiresIn": 3600, "user": { "id": 1, "email": "krum@example.com", "displayName": "Krum", "role": "user" } }, "meta": {} }
```

Error:

```json
{ "success": false, "error": { "code": "EMAIL_EXISTS", "message": "An account with this email already exists." } }
```

### POST `/auth/login`
Logs in and returns a JWT. Auth: public.

Request:

```json
{ "email": "user1@example.com", "password": "Password123" }
```

Success `200`: same shape as register. Error `401`: `INVALID_CREDENTIALS`.

### POST `/auth/logout`
Stateless mobile logout acknowledgement. Auth: bearer token.

Success:

```json
{ "success": true, "data": { "loggedOut": true }, "meta": {} }
```

### GET `/auth/me`
Returns current JWT user profile. Auth: bearer token.

### POST `/auth/refresh`
Returns a new access token from a valid current token. Auth: bearer token.

## Users

### GET `/users/profile`
Returns current user's profile. Auth: bearer token.

### PATCH `/users/profile`
Updates current user's `displayName` and/or `avatarUrl`. Auth: bearer token.

Request:

```json
{ "displayName": "Krum Tomov", "avatarUrl": "https://example.com/avatar.png" }
```

## AI Models

### GET `/models`
Lists available AI models. Auth: bearer token.

Query params: `page`, `pageSize`, `provider`, `family`, `modelType`, `quantization`, `availability`.

### GET `/models/:id`
Returns model details. Auth: bearer token.

Error `404`: `NOT_FOUND`.

## Model Configurations

### GET `/configurations`
Lists current user's configurations. Auth: bearer token.

### POST `/configurations`
Creates a configuration. Auth: bearer token.

Request:

```json
{
  "modelId": 1,
  "configName": "RTX 4090 coding profile",
  "temperature": "0.20",
  "contextSize": 8192,
  "gpuLayers": 40,
  "useCaseCategory": "coding"
}
```

### GET `/configurations/:id`
Returns one user-owned configuration. Auth: bearer token.

### PATCH `/configurations/:id`
Updates a configuration. Auth: bearer token.

### DELETE `/configurations/:id`
Soft-deletes a configuration. Auth: bearer token.

## Benchmarks

### GET `/benchmarks`
Lists benchmark results. Auth: bearer token.

Query params: `page`, `pageSize`, `modelId`.

### POST `/benchmarks`
Starts a synthetic benchmark and stores the result. Auth: bearer token.

Request:

```json
{ "modelId": 1, "configurationId": 2, "benchmarkPrompt": "Explain local LLM orchestration." }
```

### GET `/benchmarks/:id`
Returns benchmark details. Auth: bearer token.

### DELETE `/benchmarks/:id`
Deletes a benchmark result. Auth: bearer token.

## Prompt Templates

### GET `/prompts`
Lists prompt templates. Auth: bearer token.

Query params: `page`, `pageSize`, `category`.

### POST `/prompts`
Creates a prompt template. Auth: bearer token.

Request:

```json
{ "title": "RAG Answer", "content": "Answer using only provided context.", "category": "rag", "visibility": "private" }
```

### GET `/prompts/:id`
Returns prompt template details. Auth: bearer token.

### PATCH `/prompts/:id`
Updates a prompt template. Auth: bearer token.

### DELETE `/prompts/:id`
Soft-deletes a prompt template. Auth: bearer token.

## Agent Presets

### GET `/agents`
Lists AI agent presets. Auth: bearer token.

### POST `/agents`
Creates an agent preset. Auth: bearer token.

Request:

```json
{ "name": "Research Agent", "modelId": 1, "configurationId": 2, "systemPrompt": "Research carefully.", "category": "research" }
```

### GET `/agents/:id`
Returns agent preset details. Auth: bearer token.

### PATCH `/agents/:id`
Updates an agent preset. Auth: bearer token.

### DELETE `/agents/:id`
Soft-deletes an agent preset. Auth: bearer token.

### POST `/agents/:id/run`
Runs an agent with a prompt and returns a simulated output/session. Auth: bearer token.

Request:

```json
{ "prompt": "Summarize today's benchmark health." }
```

## Model Sessions

### GET `/sessions`
Lists current user's active and historical sessions. Auth: bearer token.

Query params: `page`, `pageSize`, `status`.

### GET `/sessions/active`
Lists active sessions only. Auth: bearer token.

### POST `/sessions`
Starts a model session. Auth: bearer token.

Request:

```json
{ "modelId": 1, "configurationId": 2, "agentPresetId": 3, "sessionName": "Mobile coding run" }
```

### GET `/sessions/:id`
Returns session details and messages. Auth: bearer token.

### POST `/sessions/:id/stop`
Stops a model session. Auth: bearer token.

## System Logs

### GET `/logs`
Lists logs for the current user. Auth: bearer token.

Query params: `page`, `pageSize`, `eventType`, `level`, `dateFrom`, `dateTo`.

## Mobile Dashboard

### GET `/dashboard`
Returns summary data for active sessions, recent benchmarks, saved configurations, available models, and recent logs. Auth: bearer token.

