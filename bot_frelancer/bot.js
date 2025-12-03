const { chromium } = require('playwright');
const notifyTelegram = require('./notify');
const config = require('./config');
const selectors = require('./selectors');

async function checkMessages() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('🔄 Verificando mensagens...');

  // Login
  await page.goto('https://www.99freelas.com.br/login');
  await page.fill('#email', config.email);
  await page.fill('#password', config.password);
  await page.click('button[type=submit]');

  await page.waitForLoadState('networkidle');

  // Mensagens
  await page.goto('https://www.99freelas.com.br/messages');

  // Verificar não lidas
  const unread = await page.locator(selectors.unreadSelector).count();

  if (unread > 0) {
    const text = `🔥 Você tem ${unread} mensagens novas no 99Freelas!`;
    console.log(text);
    await notifyTelegram(text);
  } else {
    console.log('😴 Nada novo.');
  }

  await browser.close();
}

async function startBot() {
  while (true) {
    try {
      await checkMessages();
    } catch (err) {
      console.log('❌ Erro:', err.message);
    }

    await new Promise((r) => setTimeout(r, config.checkInterval));
  }
}

module.exports = startBot;
