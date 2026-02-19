const userService = require('../services/userService');

async function register(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await userService.register(email, password);
    return res.status(201).json(user);
  } catch (err) {
    if (err.code === 'EMAIL_EXISTS') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error('Registration error:', err.message || err);
    return res.status(500).json({
      error: 'Registration failed',
      ...(process.env.NODE_ENV !== 'production' && { detail: err.message }),
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const result = await userService.login(email, password);
    if (!result) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    return res.json(result); // { user, token }
  } catch (err) {
    return res.status(500).json({ error: 'Login failed' });
  }
}

module.exports = { register, login };
