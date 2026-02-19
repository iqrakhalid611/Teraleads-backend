require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'db');
const FILES = [
  '001_create_users_table.sql',
  '002_create_patients_table.sql',
  '003_create_chat_messages_table.sql',
];

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('Missing DATABASE_URL in environment.');
    process.exit(1);
  }

  const client = new Client({ connectionString });
  try {
    await client.connect();
    for (const file of FILES) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      try {
        await client.query(sql);
        console.log(`OK: ${file}`);
      } catch (err) {
        console.error(`FAIL: ${file}`, err.message);
        process.exit(1);
      }
    }
    console.log('Migrations completed.');
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
