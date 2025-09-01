const express = require('express');
const db = require('../db');
const { sendWebhook } = require('../webhook');
const router = express.Router();

// All endpoints are tenant-aware via req.user.tenant_id

// List accounts (GET /api/accounts)
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM accounts WHERE tenant_id = $1', [req.user.tenant_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get account by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM accounts WHERE id = $1 AND tenant_id = $2', [req.params.id, req.user.tenant_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create account
router.post('/', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO accounts (name, tenant_id) VALUES ($1, $2) RETURNING *',
      [name, req.user.tenant_id]
    );
    await sendWebhook('create', 'account', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update account
router.put('/:id', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await db.query(
      'UPDATE accounts SET name = $1 WHERE id = $2 AND tenant_id = $3 RETURNING *',
      [name, req.params.id, req.user.tenant_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    await sendWebhook('update', 'account', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete account
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM accounts WHERE id = $1 AND tenant_id = $2 RETURNING *',
      [req.params.id, req.user.tenant_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    await sendWebhook('delete', 'account', result.rows[0]);
    res.json({ message: 'Deleted', account: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;