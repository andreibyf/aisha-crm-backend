const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { generateToken } = require('../auth');
const router = express.Router();

// Login: returns JWT if credentials match
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = generateToken({ id: user.id, username: user.username, tenant_id: user.tenant_id });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register: creates a new user (admin only, or for initial setup)
router.post('/register', async (req, res) => {
  const { username, password, tenant_id } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (username, password_hash, tenant_id) VALUES ($1, $2, $3) RETURNING id, username, tenant_id',
      [username, hash, tenant_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;