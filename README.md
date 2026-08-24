# Rezyume bot

Telegram bot + Mini App. Foydalanuvchi ma'lumotini kiritadi, bot A4 formatdagi
PDF rezyume yasab yuboradi. 50 ta shablon: 14 struktura x 10 rang x 5 shrift.

## Fayllar
- `public/core/resume-core.js` — dizayn tizimi va rezyume chizish mantig'i (brauzer + server)
- `public/core/style.css` — rezyume CSS'i
- `public/app.html` — Mini App (qulay tahrirlash oynasi)
- `src/bot.js` — savol-javob va tugmalar
- `src/pdf.js` — serverdagi Chrome orqali PDF
- `src/index.js` — server

## Sozlamalar (Environment Variables)
- `BOT_TOKEN` — BotFather bergan kalit (majburiy)
- `PUBLIC_URL` — Render bergan manzil (Render buni o'zi beradi)
- `CHROME_PATH` — Docker ichida `/usr/bin/chromium`

## Ishga tushirish
Render'da: New > Web Service > Docker. BOT_TOKEN qo'shiladi. Tamom.
