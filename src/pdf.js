/* PDF yasovchi qism.
   Serverda haqiqiy Chrome ochiladi, u bizning HTML'ni chizadi va PDF qaytaradi.
   Brauzerdagi "chop etish -> PDF saqlash" ning aynan o'zi, faqat avtomatik. */
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");
const Core = require("../public/core/resume-core.js");

const CSS = fs.readFileSync(path.join(__dirname, "..", "public", "core", "style.css"), "utf8");
const CHROME_PATH = process.env.CHROME_PATH || "/usr/bin/chromium";

// Bir vaqtda bitta PDF: bepul serverda xotira kam, navbat bilan ishlaymiz
let navbat = Promise.resolve();

function makePDF(state) {
  const ish = navbat.then(() => render(state), () => render(state));
  navbat = ish.catch(() => {});
  return ish;
}

async function render(state) {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    args: [
      "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage",
      "--disable-gpu", "--single-process", "--no-zygote",
      "--font-render-hinting=none", "--disable-extensions"
    ]
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123 });

    await page.setContent(Core.documentHTML(state, CSS), {
      waitUntil: "networkidle0", timeout: 45000
    });

    // Shriftlar yuklanib bo'lishini kutamiz (internetsiz qolsa ham davom etadi)
    await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});

    // Matn A4'dan bir necha mm oshsa — bo'sh ikkinchi varaq chiqmasin
    await page.evaluate(() => {
      const A4 = 297 * 96 / 25.4;
      const r = document.getElementById("resume");
      const ratio = r.scrollHeight / A4;
      if (ratio > 1.002 && ratio < 1.14) {
        r.style.setProperty("--pscale", (1 / ratio).toFixed(4));
        document.body.classList.add("fit-one");
      }
    });

    return await page.pdf({
      format: "A4",
      printBackground: true,          // rangli panellar chiqishi uchun
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" }
    });
  } finally {
    await browser.close().catch(() => {});
  }
}

module.exports = { makePDF };
