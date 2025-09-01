const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { authenticateToken } = require('./auth');
const customerRoutes = require('./routes/customers');
const accountRoutes = require('./routes/accounts');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
// Protect all entity routes
app.use('/api/customers', authenticateToken, customerRoutes);
app.use('/api/accounts', authenticateToken, accountRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`CRM backend listening on port ${PORT}`));