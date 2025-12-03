const axios = require('axios');
const { telegramToken, telegramChatId } = require('./config');

async function notifyTelegram(text) {
  const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;

  await axios.post(url, {
    chat_id: telegramChatId,
    text,
  });
}

module.exports = notifyTelegram;
