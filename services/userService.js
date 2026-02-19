const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * User service – business logic for user/auth.
 * Uses the user model for DB access; does not touch the DB directly.
 */

async function register(email, plainPassword) {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    const err = new Error('Email already registered');
    err.code = 'EMAIL_EXISTS';
    throw err;
  }
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  const user = await userModel.create({ email, hashedPassword });
  return user; // { id, email, created_at, updated_at }
}

/**
 * Login: find user, compare password, return { user, token } or null.
 */
async function login(email, plainPassword) {
  const user = await userModel.findByEmail(email);
  if (!user) return null;
  const match = await bcrypt.compare(plainPassword, user.hashed_password);
  if (!match) return null;
  const { hashed_password, ...safe } = user;
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  return { user: safe, token };
}

async function getById(id) {
  const user = await userModel.findById(id);
  if (!user) return null;
  const { hashed_password, ...safe } = user;
  return safe;
}

module.exports = {
  register,
  login,
  getById,
};
