# Patient Assistant Backend

Express.js + PostgreSQL API for the AI-powered patient assistant dashboard (auth, patients CRUD, chat).

## Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Auth:** JWT, bcrypt

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **PostgreSQL**

   Create a database (e.g. `dental_dashboard`) and run migrations in order:

   ```bash
   psql "postgresql://USER:PASSWORD@HOST:PORT/DATABASE" -f db/001_create_users_table.sql
   psql "postgresql://USER:PASSWORD@HOST:PORT/DATABASE" -f db/002_create_patients_table.sql
   psql "postgresql://USER:PASSWORD@HOST:PORT/DATABASE" -f db/003_create_chat_messages_table.sql
   ```

   Example (local):

   ```bash
   psql "postgresql://localhost:5432/dental_dashboard" -f db/001_create_users_table.sql
   psql "postgresql://localhost:5432/dental_dashboard" -f db/002_create_patients_table.sql
   psql "postgresql://localhost:5432/dental_dashboard" -f db/003_create_chat_messages_table.sql
   ```

3. **Environment**

   Copy `.env.example` to `.env` and set:

   - `PORT` – server port (default `4000`)
   - `DATABASE_URL` – PostgreSQL connection string
   - `JWT_SECRET` – secret for signing JWTs (use a strong value in production)
   - Optional: AI config (see below)

## Run

```bash
npm start
```

Server listens on `http://localhost:4000` (or `PORT` from env).

## Environment variables

| Variable        | Required | Description                          |
|----------------|----------|--------------------------------------|
| `PORT`         | No       | Server port (default `4000`)         |
| `DATABASE_URL` | Yes      | PostgreSQL connection string         |
| `JWT_SECRET`   | Yes      | Secret for JWT signing               |
| `CORS_ORIGIN`  | No       | Allowed origins (comma-separated; default `http://localhost:5174`) |
| `JWT_EXPIRES_IN` | No     | Token expiry (default `24h`)         |
| `AI_SERVICE_URL` | No     | Optional: external AI service URL     |
| `OPENAI_API_KEY` | No     | Optional: OpenAI API key              |
| `OPENAI_MODEL` | No      | Optional: OpenAI model (default `gpt-3.5-turbo`) |
| `AI_TIMEOUT_MS` | No     | Optional: AI request timeout (default `30000`)   |

## API overview

- **Auth** (no JWT required)
  - `POST /auth/register` – body: `{ email, password }`
  - `POST /auth/login` – body: `{ email, password }` → `{ user, token }`

- **Patients** (require `Authorization: Bearer <token>`)
  - `GET /patients?page=1&limit=10` → `{ rows, total }`
  - `GET /patients/:id`
  - `POST /patients` – body: `{ name, email?, phone?, dob?, medical_notes? }`
  - `PUT /patients/:id`
  - `DELETE /patients/:id`

- **Chat** (require `Authorization: Bearer <token>`)
  - `POST /chat` – body: `{ patientId, message }` → `{ reply, userMessage, assistantMessage }`
  - `GET /chat?patientId=1` – chat history

- **Health**
  - `GET /health` → `{ status: "ok" }`

## AI (chat replies)

Chat uses one of (in order): **external AI service** → **OpenAI** → **mock**.

- **External:** set `AI_SERVICE_URL`. Backend `POST`s `{ message, patientContext }` and expects JSON with `reply` or `text`.
- **OpenAI:** set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`).
- **Mock:** if neither is set, a placeholder reply is returned for local dev.

On AI failure, the backend still saves the user message and a fallback assistant message and returns `aiError: true` in the response.

## Project structure

```
backend/
├── config/     # DB pool
├── controllers/
├── db/         # SQL migrations
├── middleware/ # auth (JWT)
├── models/
├── routes/
├── services/
├── index.js
└── .env.example
```
