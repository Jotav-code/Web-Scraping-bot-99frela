const { chromium } = require('playwright');
const fs = require('fs');
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

  // 🔒 Anti-detecção + User-Agent real
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.setExtraHTTPHeaders({
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  });

  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });

  // ----------------------------------------------------
  // LOGIN
  // ----------------------------------------------------
  await page.goto("https://www.99freelas.com.br/login", {
    waitUntil: "domcontentloaded"
  });

  // Esperar inputs com fallback
  try {
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
  } catch (err) {
    console.log("⚠️ Inputs não apareceram, salvando DOM...");

    const html = await page.content();
    fs.writeFileSync("render-dom.html", html);

    console.log("📄 DOM salvo no arquivo render-dom.html");
    console.log("🔗 URL atual:", page.url());
    await browser.close();
    return; // para o bot aqui até corrigirmos o seletor
  }

  // Preenchendo login
  await page.fill('input[type="email"]', config.email);
  await page.fill('input[type="password"]', config.password);
  await page.click('button[type="submit"]');

  // Espera redirect
  await page.waitForLoadState("networkidle");

  console.log("🔗 Após login, URL:", page.url());

  // ----------------------------------------------------
  // MENSAGENS
  // ----------------------------------------------------
  await page.goto("https://www.99freelas.com.br/messages", {
    waitUntil: "networkidle"
  });

  const unread = await page.locator(selectors.unreadSelector).count();

  if (unread > 0) {
    const text = `🔥 Você tem ${unread} mensagens novas no 99Freelas!`;
    console.log(text);
    await notifyTelegram(text);
  } else {
    console.log("😴 Nada novo.");
  }

  await browser.close();
}

module.exports = checkMessages;
