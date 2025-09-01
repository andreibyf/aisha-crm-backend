const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function generateToken(user) {
  // user: { id, username, tenant_id }
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '8h' });
}

module.exports = { authenticateToken, generateToken };