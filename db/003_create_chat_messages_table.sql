-- Chat messages: id, user_id, patient_id, role ('user'|'assistant'), content, created_at
-- Run: psql "postgresql://..." -f backend/db/003_create_chat_messages_table.sql

CREATE TABLE IF NOT EXISTS chat_messages (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  role       VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_patient_user ON chat_messages(patient_id, user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(patient_id, created_at);
