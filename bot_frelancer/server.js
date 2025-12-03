const express = require('express');
const axios = require('axios');
const startBot = require('./bot');
const config = require('./config');

const app = express();

app.get('/', (req, res) => {
  res.send('Bot do 99Freelas online 😎');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('🌐 Server HTTP iniciado');
  startBot();
});

// Keep-alive automático (opcional, mas ajuda)
if (config.appUrl) {
  setInterval(() => {
    axios
      .get(config.appUrl)
      .then(() => console.log('🔗 Keep-alive enviado'))
      .catch(() => {});
  }, 5 * 60 * 1000); // 5 min
}
