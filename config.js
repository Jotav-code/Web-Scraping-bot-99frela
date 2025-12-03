module.exports = {
  email: process.env.EMAIL,
  password: process.env.PASSWORD,

  telegramToken: process.env.TELEGRAM_TOKEN,
  telegramChatId: process.env.TELEGRAM_CHATID,

  checkInterval: process.env.CHECK_INTERVAL || 60000, // 1 min
  appUrl: process.env.APP_URL, // URL do Render para keep-alive
};
