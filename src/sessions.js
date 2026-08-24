/* Har bir foydalanuvchining yozganlarini saqlash.
   Bepul serverda disk "vaqtinchalik" — dastur uxlaganda o'chishi mumkin.
   Shuning uchun asosiy nusxa xotirada, fayl esa qo'shimcha himoya. */
const fs = require("fs");
const path = require("path");
const Core = require("../public/core/resume-core.js");

const FILE = path.join(__dirname, "..", "data", "sessions.json");
const mem = new Map();

try {
  if (fs.existsSync(FILE)) {
    const obj = JSON.parse(fs.readFileSync(FILE, "utf8"));
    for (const k of Object.keys(obj)) mem.set(k, obj[k]);
    console.log("Saqlangan sessiyalar yuklandi:", mem.size);
  }
} catch (e) { console.log("Sessiya fayli o'qilmadi, toza boshlaymiz"); }

let timer = null;
function saveSoon() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    try {
      fs.mkdirSync(path.dirname(FILE), { recursive: true });
      fs.writeFileSync(FILE, JSON.stringify(Object.fromEntries(mem)));
    } catch (e) { /* disk yozilmasa — mayli, xotirada bor */ }
  }, 1500);
}

function get(id) {
  const k = String(id);
  if (!mem.has(k)) {
    const s = Core.emptyState();
    s.step = "lang";
    mem.set(k, s);
  }
  return mem.get(k);
}
function set(id, s) { mem.set(String(id), s); saveSoon(); }
function reset(id) {
  const s = Core.emptyState();
  s.step = "lang";
  mem.set(String(id), s); saveSoon();
  return s;
}
module.exports = { get, set, reset };
