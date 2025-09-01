const axios = require('axios');
require('dotenv').config();

async function sendWebhook(event, entity, data) {
  if (!process.env.WEBHOOK_URL) return;
  try {
    await axios.post(process.env.WEBHOOK_URL, {
      event, // 'create', 'update', 'delete'
      entity, // 'customer', 'account', etc.
      data,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Webhook error:', err.message);
  }
}

module.exports = { sendWebhook };