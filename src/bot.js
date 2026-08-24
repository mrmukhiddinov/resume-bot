/* Botning miyasi: savol-javob, shablon tanlash, PDF yuborish. */
const { Bot, InlineKeyboard, InputFile } = require("grammy");
const Core = require("../public/core/resume-core.js");
const S = require("./sessions");
const txt = require("./texts");
const { makePDF } = require("./pdf");

const bot = new Bot(process.env.BOT_TOKEN);
const APP_URL = () => (process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || "").replace(/\/$/, "");

/* ---------- kichik yordamchilar ---------- */
const lines = (s) => String(s || "").split("\n").map(x => x.trim()).filter(Boolean);
const isSkip = (s) => /^(\/skip|-|yo'q|нет|no|skip)$/i.test(String(s || "").trim());

// Faqat "qulay oynada to'ldirish" tugmasi
function appKb(t) {
  const u = APP_URL();
  return u ? new InlineKeyboard().webApp(t.btnApp, u + "/app.html") : undefined;
}

function mainKb(t) {
  const kb = new InlineKeyboard().text(t.btnTpl, "tpl:0").text(t.btnPdf, "pdf");
  const u = APP_URL();
  if (u) kb.row().webApp(t.btnApp, u + "/app.html");
  return kb;
}

/* ---------- /start ---------- */
bot.command("start", async (ctx) => {
  const s = S.reset(ctx.from.id);
  s.step = "lang";
  S.set(ctx.from.id, s);
  await ctx.reply(txt("uz").chooseLang, {
    reply_markup: new InlineKeyboard()
      .text("🇺🇿 O'zbekcha", "lang:uz")
      .text("🇷🇺 Русский", "lang:ru")
      .text("🇬🇧 English", "lang:en")
  });
});

bot.command("help", (ctx) => ctx.reply(txt(S.get(ctx.from.id).lang).help));
bot.command("reset", (ctx) => { S.reset(ctx.from.id); return ctx.reply(txt("uz").resetOk); });

bot.command("app", async (ctx) => {
  const t = txt(S.get(ctx.from.id).lang);
  const u = APP_URL();
  if (!u) return ctx.reply("Mini App manzili sozlanmagan.");
  await ctx.reply(t.btnApp, { reply_markup: new InlineKeyboard().webApp(t.btnApp, u + "/app.html") });
});

bot.command("tpl", (ctx) => showTemplates(ctx, 0));
bot.command("pdf", async (ctx) => {
  const s = S.get(ctx.from.id);
  if (!s.data.name) return ctx.reply(txt(s.lang).noData);
  await sendPDF(ctx, s);
});

/* ---------- til tanlash ---------- */
bot.callbackQuery(/^lang:(uz|ru|en)$/, async (ctx) => {
  const s = S.get(ctx.from.id);
  s.lang = ctx.match[1];
  s.step = "name";
  S.set(ctx.from.id, s);
  await ctx.answerCallbackQuery();
  const t = txt(s.lang);
  await ctx.reply(t.welcome, { reply_markup: appKb(t) });
});

/* ---------- "o'tkazib yuborish" va "yana qo'shish" tugmalari ---------- */
bot.callbackQuery(/^go:(\w+)$/, async (ctx) => {
  const s = S.get(ctx.from.id);
  await ctx.answerCallbackQuery();
  await goTo(ctx, s, ctx.match[1]);
});

/* ---------- shablonlar ro'yxati ---------- */
const PER_PAGE = 8;
function tplKeyboard(page, lang) {
  const kb = new InlineKeyboard();
  const start = page * PER_PAGE;
  const items = Core.TEMPLATES.slice(start, start + PER_PAGE);
  items.forEach((tp, i) => {
    kb.text(tp[0], "pick:" + (start + i));
    if (i % 2 === 1) kb.row();
  });
  if (items.length % 2 === 1) kb.row();
  const pages = Math.ceil(Core.TEMPLATES.length / PER_PAGE);
  const nav = [];
  if (page > 0) nav.push(["◀", "tpl:" + (page - 1)]);
  nav.push([`${page + 1}/${pages}`, "noop"]);
  if (page < pages - 1) nav.push(["▶", "tpl:" + (page + 1)]);
  nav.forEach(([label, data]) => kb.text(label, data));
  return kb;
}

async function showTemplates(ctx, page) {
  const s = S.get(ctx.from.id);
  const t = txt(s.lang);
  if (!s.data.name) return ctx.reply(t.noData);
  await ctx.reply(t.chooseTpl, { reply_markup: tplKeyboard(page, s.lang) });
}

bot.callbackQuery(/^tpl:(\d+)$/, async (ctx) => {
  const s = S.get(ctx.from.id);
  await ctx.answerCallbackQuery();
  try {
    await ctx.editMessageReplyMarkup({ reply_markup: tplKeyboard(+ctx.match[1], s.lang) });
  } catch (e) {
    await ctx.reply(txt(s.lang).chooseTpl, { reply_markup: tplKeyboard(+ctx.match[1], s.lang) });
  }
});
bot.callbackQuery("noop", (ctx) => ctx.answerCallbackQuery());

bot.callbackQuery(/^pick:(\d+)$/, async (ctx) => {
  const s = S.get(ctx.from.id);
  const tp = Core.TEMPLATES[+ctx.match[1]];
  if (!tp) return ctx.answerCallbackQuery();
  s.tpl = +ctx.match[1];
  s.design = { structure: tp[1], color: tp[2], font: tp[3] };
  S.set(ctx.from.id, s);
  await ctx.answerCallbackQuery({ text: tp[0] });
  await sendPDF(ctx, s);
});

bot.callbackQuery("pdf", async (ctx) => {
  const s = S.get(ctx.from.id);
  await ctx.answerCallbackQuery();
  if (!s.data.name) return ctx.reply(txt(s.lang).noData);
  await sendPDF(ctx, s);
});

/* ---------- PDF yuborish ---------- */
async function sendPDF(ctx, s) {
  const t = txt(s.lang);
  const wait = await ctx.reply(t.making);
  try {
    await ctx.replyWithChatAction("upload_document");
    const buf = await makePDF(s);
    const fname = (s.data.name || "rezyume").trim().replace(/\s+/g, "-").toLowerCase() + ".pdf";
    await ctx.replyWithDocument(new InputFile(buf, fname), {
      caption: t.caption, reply_markup: mainKb(t)
    });
  } catch (e) {
    console.error("PDF xato:", e.message);
    await ctx.reply(t.err);
  } finally {
    ctx.api.deleteMessage(ctx.chat.id, wait.message_id).catch(() => {});
  }
}

/* ---------- foto ---------- */
bot.on("message:photo", async (ctx) => {
  const s = S.get(ctx.from.id);
  if (s.step !== "photo") return;
  const t = txt(s.lang);
  try {
    const file = await ctx.getFile();                       // eng katta o'lchamdagi rasm
    const url = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
    const res = await fetch(url);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 900 * 1024) throw new Error("juda katta");
    s.data.photo = "data:image/jpeg;base64," + buf.toString("base64");
    s.data.showPhoto = true;
    S.set(ctx.from.id, s);
  } catch (e) { /* foto olinmasa — fotosiz davom etamiz */ }
  await goTo(ctx, s, "summary");
});

/* ---------- matnli javoblar ---------- */
bot.on("message:text", async (ctx) => {
  const s = S.get(ctx.from.id);
  const t = txt(s.lang);
  const v = ctx.message.text.trim();
  if (v.startsWith("/")) return;

  switch (s.step) {
    case "lang":
      return ctx.reply(t.chooseLang, {
        reply_markup: new InlineKeyboard()
          .text("🇺🇿 O'zbekcha", "lang:uz").text("🇷🇺 Русский", "lang:ru").text("🇬🇧 English", "lang:en")
      });

    case "name":
      s.data.name = v; S.set(ctx.from.id, s);
      return goTo(ctx, s, "role");

    case "role":
      s.data.role = isSkip(v) ? "" : v; S.set(ctx.from.id, s);
      return goTo(ctx, s, "contact");

    case "contact": {
      const L = ctx.message.text.split("\n").map(x => x.trim());
      const val = (i) => (L[i] && L[i] !== "-" ? L[i] : "");
      s.data.phone = val(0); s.data.email = val(1); s.data.city = val(2); s.data.link = val(3);
      S.set(ctx.from.id, s);
      return goTo(ctx, s, "photo");
    }

    case "photo":
      return goTo(ctx, s, "summary");

    case "summary":
      s.data.summary = isSkip(v) ? "" : v; S.set(ctx.from.id, s);
      return goTo(ctx, s, "experience");

    case "experience": {
      if (isSkip(v)) return goTo(ctx, s, "education");
      const L = lines(v);
      s.data.experience.push({
        role: L[0] || "", org: L[1] || "", date: L[2] || "", place: "",
        desc: L.slice(3).join("\n")
      });
      S.set(ctx.from.id, s);
      return ctx.reply(t.addedExp, {
        reply_markup: new InlineKeyboard().text(t.btnMore, "go:experience").text(t.btnNext, "go:education")
      });
    }

    case "education": {
      if (isSkip(v)) return goTo(ctx, s, "skills");
      const L = lines(v);
      s.data.education.push({ degree: L[0] || "", org: L[1] || "", date: L[2] || "", note: L.slice(3).join("\n") });
      S.set(ctx.from.id, s);
      return ctx.reply(t.addedEdu, {
        reply_markup: new InlineKeyboard().text(t.btnMore, "go:education").text(t.btnNext, "go:skills")
      });
    }

    case "skills":
      s.data.skills = isSkip(v) ? "" : lines(v).join("\n"); S.set(ctx.from.id, s);
      return goTo(ctx, s, "languages");

    case "languages":
      if (!isSkip(v)) {
        s.data.languages = lines(v).map(l => {
          const p = l.split(/\s[—–-]\s|\s*\|\s*/);
          return { name: (p[0] || "").trim(), level: (p[1] || "").trim() };
        });
      }
      S.set(ctx.from.id, s);
      return goTo(ctx, s, "certificates");

    case "certificates":
      if (!isSkip(v)) {
        s.data.certificates = lines(v).map(l => {
          const p = l.split(/\s[—–-]\s/);
          return { name: (p[0] || "").trim(), org: (p[1] || "").trim(), year: (p[2] || "").trim() };
        });
      }
      S.set(ctx.from.id, s);
      return showTemplates(ctx, 0);

    default:
      return ctx.reply(t.help);
  }
});

/* ---------- bosqichdan bosqichga o'tish ---------- */
async function goTo(ctx, s, step) {
  const t = txt(s.lang);
  s.step = step; S.set(ctx.from.id, s);
  const skipKb = new InlineKeyboard().text(t.btnSkip, "go:" + nextOf(step));
  switch (step) {
    case "role":         return ctx.reply(t.askRole);
    case "contact":      return ctx.reply(t.askContact);
    case "photo":        return ctx.reply(t.askPhoto, { reply_markup: skipKb });
    case "summary":      return ctx.reply(t.askSummary);
    case "experience":   return ctx.reply(t.askExp, { reply_markup: skipKb });
    case "education":    return ctx.reply(t.askEdu, { reply_markup: skipKb });
    case "skills":       return ctx.reply(t.askSkills, { reply_markup: skipKb });
    case "languages":    return ctx.reply(t.askLangs, { reply_markup: skipKb });
    case "certificates": return ctx.reply(t.askCerts, { reply_markup: skipKb });
    case "templates":    return showTemplates(ctx, 0);
    default:             return ctx.reply(t.help);
  }
}
const ORDER = ["name", "role", "contact", "photo", "summary", "experience", "education", "skills", "languages", "certificates", "templates"];
const nextOf = (step) => ORDER[Math.min(ORDER.indexOf(step) + 1, ORDER.length - 1)];

bot.catch((err) => console.error("Bot xatosi:", err.message));

module.exports = { bot, sendPDFTo: async (userId, s) => {
  const t = txt(s.lang);
  const buf = await makePDF(s);
  const fname = (s.data.name || "rezyume").trim().replace(/\s+/g, "-").toLowerCase() + ".pdf";
  await bot.api.sendDocument(userId, new InputFile(buf, fname), {
    caption: t.savedFromApp + "\n" + t.caption, reply_markup: mainKb(t)
  });
}};
