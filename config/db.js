const { Pool } = require('pg');
require('dotenv').config();

// Use explicit sslmode to avoid pg SSL warning (prefer/require → verify-full semantics)
function getConnectionString() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return raw;
  try {
    const url = new URL(raw.replace(/^postgres:\/\//, 'postgresql://'));
    url.searchParams.set('sslmode', 'verify-full');
    return url.toString();
  } catch {
    return raw;
  }
}

const pool = new Pool({
  connectionString: getConnectionString(),
});

module.exports = { pool };
