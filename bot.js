const { chromium } = require('playwright');
const notifyTelegram = require('./notify');
const config = require('./config');
const selectors = require('./selectors');

async function checkMessages() {
  console.log('🔄 Verificando mensagens...');

  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"]
  });

  const page = await browser.newPage();

  // ↓ Anti-detecção
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });

  // ----------------------------------------------------
  // LOGIN
  // ----------------------------------------------------
  await page.goto('https://www.99freelas.com.br/login', {
    waitUntil: 'domcontentloaded'
  });

  // Espera os inputs aparecerem
  await page.waitForSelector('input[type="email"]', { timeout: 15000 });
  await page.waitForSelector('input[type="password"]', { timeout: 15000 });

  // Preenche com seletores mais seguros
  await page.fill('input[type="email"]', config.email);
  await page.fill('input[type="password"]', config.password);

  // Clica em "Entrar"
  await page.click('button[type="submit"]');

  // Espera o dashboard carregar (ou redirecionar)
  await page.waitForLoadState('networkidle');

  // ----------------------------------------------------
  // IR PARA MENSAGENS
  // ----------------------------------------------------
  await page.goto('https://www.99freelas.com.br/messages', {
    waitUntil: 'networkidle'
  });

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

module.exports = checkMessages;
