const { pool } = require('../config/db');
/**
 * Create a new user.
 * @param {Object} data - { email, hashedPassword }
 * @returns {Promise<Object>} Created user (without hashed_password in return if you prefer, here we return full row)
 */
async function create({ email, hashedPassword }) {
  const result = await pool.query(
    `INSERT INTO users (email, hashed_password)
     VALUES ($1, $2)
     RETURNING id, email, created_at, updated_at`,
    [email, hashedPassword]
  );
  return result.rows[0];
}

/**
 * Find user by id.
 * @param {number} id
 * @returns {Promise<Object|null>} User row or null
 */
async function findById(id) {
  const result = await pool.query(
    'SELECT id, email, hashed_password, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Find user by email.
 * @param {string} email
 * @returns {Promise<Object|null>} User row or null
 */
async function findByEmail(email) {
  const result = await pool.query(
    'SELECT id, email, hashed_password, created_at, updated_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

module.exports = {
  create,
  findById,
  findByEmail,
};
