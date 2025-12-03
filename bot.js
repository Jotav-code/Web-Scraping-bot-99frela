const { chromium } = require("playwright");
const fs = require("fs");
const notifyTelegram = require("./notify");
const config = require("./config");
const selectors = require("./selectors");

async function checkMessages() {
  console.log("🔄 Verificando mensagens...");

  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"]
  });

  const page = await browser.newPage();

  // Carregar cookies
  const cookies = JSON.parse(fs.readFileSync("./cookies.json", "utf8"));
  await page.context().addCookies(cookies);

  // Ir direto para mensagens
  await page.goto("https://www.99freelas.com.br/messages", {
  waitUntil: "domcontentloaded",
  timeout: 60000
});


  console.log("🔗 URL atual:", page.url());

  // Se tiver redirecionado pra login → cookies expiraram
  if (page.url().includes("login")) {
    console.log("❌ Cookies expiraram! Refaça o login e gere novos cookies.json");
    return;
  }

  // Contar mensagens
  const unread = await page.locator(selectors.unreadSelector).count();

  if (unread > 0) {
    const msg = `🔥 Você tem ${unread} mensagens novas no 99Freelas!`;
    console.log(msg);
    await notifyTelegram(msg);
  } else {
    console.log("😴 Nada novo.");
  }

  await browser.close();
}

module.exports = checkMessages;

