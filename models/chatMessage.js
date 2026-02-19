const { pool } = require('../config/db');

/**
 * Chat message model – DB access for chat_messages table.
 * All operations scoped by user_id and patient_id (patient must belong to user).
 */

async function create(userId, patientId, role, content) {
  const result = await pool.query(
    `INSERT INTO chat_messages (user_id, patient_id, role, content)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, patient_id, role, content, created_at`,
    [userId, patientId, role, content]
  );
  return result.rows[0];
}

/**
 * Get chat history for a patient (must belong to user), ordered by created_at.
 * @param {number} userId
 * @param {number} patientId
 * @param {object} opts - { limit = 50 } optional
 */
async function getHistory(userId, patientId, { limit = 50 } = {}) {
  const result = await pool.query(
    `SELECT id, user_id, patient_id, role, content, created_at
     FROM chat_messages
     WHERE user_id = $1 AND patient_id = $2
     ORDER BY created_at ASC
     LIMIT $3`,
    [userId, patientId, Math.min(limit, 200)]
  );
  return result.rows;
}

module.exports = {
  create,
  getHistory,
};
