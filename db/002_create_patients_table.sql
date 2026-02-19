-- Patients table: id, user_id (owner), name, email, phone, dob, medical_notes, created_at, updated_at
-- Run: psql "postgresql://..." -f backend/db/002_create_patients_table.sql

CREATE TABLE IF NOT EXISTS patients (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255),
  phone         VARCHAR(50),
  dob           DATE,
  medical_notes TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);

-- Reuse set_updated_at() from users migration; create trigger for patients
DROP TRIGGER IF EXISTS patients_updated_at ON patients;
CREATE TRIGGER patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();
