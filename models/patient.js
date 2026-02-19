const { pool } = require('../config/db');

/**
 * Patient model – DB access for patients table.
 * All operations are scoped by user_id (owner).
 */

async function create(userId, data) {
  const { name, email, phone, dob, medical_notes } = data;
  const result = await pool.query(
    `INSERT INTO patients (user_id, name, email, phone, dob, medical_notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_id, name, email, phone, dob, medical_notes, created_at, updated_at`,
    [userId, name || null, email || null, phone || null, dob || null, medical_notes || null]
  );
  return result.rows[0];
}

async function findById(userId, id) {
  const result = await pool.query(
    `SELECT id, user_id, name, email, phone, dob, medical_notes, created_at, updated_at
     FROM patients WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return result.rows[0] || null;
}

/**
 * List patients for user with pagination.
 * @param {number} userId
 * @param {object} opts - { page = 1, limit = 10 }
 * @returns {Promise<{ rows, total }>}
 */
async function findAllPaginated(userId, { page = 1, limit = 10 } = {}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const offset = (pageNum - 1) * limitNum;

  const countResult = await pool.query(
    'SELECT COUNT(*)::int AS total FROM patients WHERE user_id = $1',
    [userId]
  );
  const total = countResult.rows[0].total;

  const result = await pool.query(
    `SELECT id, user_id, name, email, phone, dob, medical_notes, created_at, updated_at
     FROM patients WHERE user_id = $1
     ORDER BY updated_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limitNum, offset]
  );

  return { rows: result.rows, total };
}

async function update(userId, id, data) {
  const { name, email, phone, dob, medical_notes } = data;
  const result = await pool.query(
    `UPDATE patients
     SET name = COALESCE($2, name),
         email = COALESCE($3, email),
         phone = COALESCE($4, phone),
         dob = COALESCE($5, dob),
         medical_notes = COALESCE($6, medical_notes)
     WHERE id = $1 AND user_id = $7
     RETURNING id, user_id, name, email, phone, dob, medical_notes, created_at, updated_at`,
    [id, name, email, phone, dob, medical_notes, userId]
  );
  return result.rows[0] || null;
}

async function remove(userId, id) {
  const result = await pool.query(
    'DELETE FROM patients WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  return result.rowCount > 0;
}

module.exports = {
  create,
  findById,
  findAllPaginated,
  update,
  remove,
};
