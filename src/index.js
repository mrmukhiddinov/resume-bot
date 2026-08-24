/* Serverning kirish nuqtasi:
   1) Mini App sahifasini tarqatadi
   2) Telegram'dan keladigan xabarlarni qabul qiladi (webhook)
   3) Mini App'dan kelgan "PDF yasab yubor" so'rovini bajaradi     */
const express = require("express");
const crypto = require("crypto");
const path = require("path");
const { webhookCallback } = require("grammy");
const { bot, sendPDFTo } = require("./bot");
const S = require("./sessions");

const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) { console.error("XATO: BOT_TOKEN qo'yilmagan!"); process.exit(1); }

const PORT = process.env.PORT || 10000;
const PUBLIC_URL = (process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || "").replace(/\/$/, "");

const app = express();
app.use(express.json({ limit: "6mb" }));   // foto base64 bo'lib kelishi mumkin
app.use(express.static(path.join(__dirname, "..", "public"), { maxAge: "1h" }));

/* Render "tirikmisan?" deb shu manzilni so'raydi */
app.get("/", (_, res) => res.send("Rezyume bot ishlayapti ✅"));

/* --- Telegram Mini App'dan kelgan ma'lumot haqiqiyligini tekshirish ---
   Bu muhim: aks holda begona odam boshqa birovga PDF yubortira olardi. */
function checkInitData(initData) {
  try {
    const p = new URLSearchParams(initData);
    const hash = p.get("hash");
    p.delete("hash");
    const check = [...p.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([k, v]) => `${k}=${v}`).join("\n");
    const secret = crypto.createHmac("sha256", "WebAppData").update(TOKEN).digest();
    const mine = crypto.createHmac("sha256", secret).update(check).digest("hex");
    if (mine !== hash) return null;
    const user = JSON.parse(p.get("user") || "{}");
    return user && user.id ? user : null;
  } catch (e) { return null; }
}

/* Mini App ochilganda: botda kiritilgan ma'lumotni beramiz */
app.post("/api/state", (req, res) => {
  const user = checkInitData(req.body && req.body.initData);
  if (!user) return res.status(403).json({ ok: false, error: "auth" });
  const s = S.get(user.id);
  res.json({ ok: true, state: { lang: s.lang, design: s.design, tpl: s.tpl, data: s.data } });
});

/* Mini App'dagi "PDF yuborish" tugmasi */
app.post("/api/pdf", async (req, res) => {
  const user = checkInitData(req.body && req.body.initData);
  if (!user) return res.status(403).json({ ok: false, error: "auth" });
  try {
    const incoming = req.body.state || {};
    const s = S.get(user.id);
    s.lang = incoming.lang || s.lang;
    s.design = incoming.design || s.design;
    s.tpl = incoming.tpl != null ? incoming.tpl : s.tpl;
    s.data = incoming.data || s.data;
    S.set(user.id, s);
    await sendPDFTo(user.id, s);
    res.json({ ok: true });
  } catch (e) {
    console.error("Mini App PDF xatosi:", e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

/* --- Telegram xabarlari --- */
const HOOK = "/tg/" + crypto.createHash("sha256").update(TOKEN).digest("hex").slice(0, 24);
app.post(HOOK, webhookCallback(bot, "express"));

app.listen(PORT, async () => {
  console.log("Server ishga tushdi, port:", PORT);
  if (PUBLIC_URL) {
    try {
      await bot.api.setWebhook(PUBLIC_URL + HOOK, { drop_pending_updates: true });
      console.log("Webhook o'rnatildi:", PUBLIC_URL + HOOK);
      console.log("Mini App:", PUBLIC_URL + "/app.html");
      // Xabar yozish joyining yonida doimiy tugma paydo bo'ladi
      await bot.api.setChatMenuButton({
        menu_button: { type: "web_app", text: "Rezyume",
                       web_app: { url: PUBLIC_URL + "/app.html" } }
      }).catch(e => console.error("Menyu tugmasi:", e.message));
    } catch (e) { console.error("Webhook o'rnatilmadi:", e.message); }
  } else {
    console.log("PUBLIC_URL yo'q — polling rejimida ishlaymiz (kompyuterda sinash uchun)");
    bot.start();
  }
});
