const express = require('express');
const db = require('../db');
const { sendWebhook } = require('../webhook');
const router = express.Router();

// All endpoints are tenant-aware via req.user.tenant_id

// List customers (GET /api/customers)
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM customers WHERE tenant_id = $1', [req.user.tenant_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM customers WHERE id = $1 AND tenant_id = $2', [req.params.id, req.user.tenant_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create customer
router.post('/', async (req, res) => {
  const { name, email } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO customers (name, email, tenant_id) VALUES ($1, $2, $3) RETURNING *',
      [name, email, req.user.tenant_id]
    );
    await sendWebhook('create', 'customer', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  const { name, email } = req.body;
  try {
    const result = await db.query(
      'UPDATE customers SET name = $1, email = $2 WHERE id = $3 AND tenant_id = $4 RETURNING *',
      [name, email, req.params.id, req.user.tenant_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    await sendWebhook('update', 'customer', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM customers WHERE id = $1 AND tenant_id = $2 RETURNING *',
      [req.params.id, req.user.tenant_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    await sendWebhook('delete', 'customer', result.rows[0]);
    res.json({ message: 'Deleted', customer: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;