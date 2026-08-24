/* =========================================================================
   resume-core.js — LOYIHANING O'ZAGI
   Bu fayl IKKI joyda ishlaydi:
     1) brauzerda (Mini App)  -> window.ResumeCore
     2) serverda (Node.js)    -> require("./resume-core.js")
   Shuning uchun dizayn tizimi bitta joyda turadi: shablonlar, ranglar,
   shriftlar va rezyume chizish mantig'i. Bir joyda tuzatsak — hamma joyda tuzaladi.
   ========================================================================= */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ResumeCore = factory();
})(typeof self !== "undefined" ? self : this, function () {
"use strict";

const I18N = {
uz:{
 appTitle:"Rezyume quruvchi", pdf:"PDF yuklab olish",
 htmlBtn:"HTML fayl", printBtn:"Chop etish",
 pdfTip:"Ochilgan oynada «Printer» o'rniga «PDF sifatida saqlash» (Save as PDF) ni tanlang, so'ng «Saqlash»ni bosing. Bu — brauzerning o'zi yasaydigan toza PDF.",
 tabForm:"Forma", tabPreview:"Rezyume",
 gTemplates:"Shablonlar", gCustom:"Qo'lda sozlash",
 structure:"Struktura", font:"Shrift", color:"Rang",
 customHint:"Istalgan strukturani istalgan rang va shrift bilan aralashtiring.",
 gBasics:"Asosiy ma'lumot", fullName:"Ism familiya", profession:"Kasb yoki lavozim",
 photo:"Foto (ixtiyoriy)", photoAdd:"Rasm tanlash", photoRemove:"O'chirish", showPhoto:"Rezyumeda ko'rsatilsin",
 gContact:"Aloqa", phone:"Telefon", email:"Email", city:"Shahar", link:"Havola",
 gSummary:"Qisqa tanishtiruv", summaryHint:"2–4 gap: nima qilasiz, nimada kuchlisiz.",
 gExperience:"Ish tajribasi", addExperience:"+ Ish joyi qo'shish",
 position:"Lavozim", company:"Tashkilot", place:"Shahar", period:"Muddat",
 description:"Vazifalar va natijalar", descHint:"Har bir qatordan alohida band hosil bo'ladi.",
 gEducation:"Ta'lim", addEducation:"+ Ta'lim qo'shish",
 degree:"Yo'nalish yoki daraja", institution:"O'quv muassasasi", note:"Izoh",
 gSkills:"Ko'nikmalar", skillsHint:"Har bir ko'nikma alohida qatorda. Daraja chizig'i kerak bo'lsa: Excel | 80",
 gLanguages:"Tillar", addLanguage:"+ Til qo'shish", langName:"Til", langLevel:"Daraja",
 gCertificates:"Sertifikatlar", addCertificate:"+ Sertifikat qo'shish",
 certName:"Nomi", certOrg:"Beruvchi", certYear:"Yil",
 clearAll:"Hammasini tozalash", clearAsk:"Barcha yozilganlar o'chiriladi. Davom etaymi?",
 sec:{summary:"Qisqacha", experience:"Ish tajribasi", education:"Ta'lim",
      skills:"Ko'nikmalar", languages:"Tillar", certificates:"Sertifikatlar"},
 struct:{classic:"Klassik", leftpanel:"Chap panel", rightpanel:"O'ng panel", banner:"Banner",
         timeline:"Vaqt chizig'i", minimal:"Minimal", academic:"Akademik", creative:"Ijodiy",
         deco1:"Bezak · banner", deco2:"Bezak · qora karta", deco3:"Bezak · diagonal",
         deco4:"Bezak · badge", deco5:"Bezak · nafis", deco6:"Bezak · halqalar"},
 fonts:{serif:"Serif klassik", sans:"Zamonaviy sans", geo:"Geometrik sans", mix:"Serif + sans", mono:"Texnik"},
 colors:{bw:"Qora-oq", navy:"Navy", blue:"Ko'k", olive:"Zaytun", bordo:"Bordo",
         graygold:"Kulrang-oltin", teal:"Teal", brown:"Jigarrang", purple:"Siyoh-binafsha", forest:"O'rmon yashili"}
},
ru:{
 appTitle:"Конструктор резюме", pdf:"Скачать PDF",
 htmlBtn:"HTML файл", printBtn:"Печать",
 pdfTip:"В открывшемся окне вместо принтера выберите «Сохранить как PDF» и нажмите «Сохранить». Это чистый PDF, который делает сам браузер.",
 tabForm:"Форма", tabPreview:"Резюме",
 gTemplates:"Шаблоны", gCustom:"Ручная настройка",
 structure:"Структура", font:"Шрифт", color:"Цвет",
 customHint:"Смешивайте любую структуру с любым цветом и шрифтом.",
 gBasics:"Основное", fullName:"Имя и фамилия", profession:"Профессия или должность",
 photo:"Фото (необязательно)", photoAdd:"Выбрать фото", photoRemove:"Удалить", showPhoto:"Показывать в резюме",
 gContact:"Контакты", phone:"Телефон", email:"Email", city:"Город", link:"Ссылка",
 gSummary:"О себе", summaryHint:"2–4 предложения: чем занимаетесь, в чём сильны.",
 gExperience:"Опыт работы", addExperience:"+ Добавить место работы",
 position:"Должность", company:"Организация", place:"Город", period:"Период",
 description:"Задачи и результаты", descHint:"Каждая строка станет отдельным пунктом.",
 gEducation:"Образование", addEducation:"+ Добавить образование",
 degree:"Направление или степень", institution:"Учебное заведение", note:"Примечание",
 gSkills:"Навыки", skillsHint:"Каждый навык с новой строки. Для шкалы уровня: Excel | 80",
 gLanguages:"Языки", addLanguage:"+ Добавить язык", langName:"Язык", langLevel:"Уровень",
 gCertificates:"Сертификаты", addCertificate:"+ Добавить сертификат",
 certName:"Название", certOrg:"Кем выдан", certYear:"Год",
 clearAll:"Очистить всё", clearAsk:"Все данные будут удалены. Продолжить?",
 sec:{summary:"О себе", experience:"Опыт работы", education:"Образование",
      skills:"Навыки", languages:"Языки", certificates:"Сертификаты"},
 struct:{classic:"Классика", leftpanel:"Левая панель", rightpanel:"Правая панель", banner:"Баннер",
         timeline:"Таймлайн", minimal:"Минимал", academic:"Академический", creative:"Креативный",
         deco1:"Декор · баннер", deco2:"Декор · чёрная карта", deco3:"Декор · диагональ",
         deco4:"Декор · бейджи", deco5:"Декор · изящный", deco6:"Декор · кольца"},
 fonts:{serif:"Классический serif", sans:"Современный sans", geo:"Геометрический sans", mix:"Serif + sans", mono:"Технический"},
 colors:{bw:"Чёрно-белый", navy:"Тёмно-синий", blue:"Синий", olive:"Оливковый", bordo:"Бордовый",
         graygold:"Серо-золотой", teal:"Бирюзовый", brown:"Коричневый", purple:"Чернильно-фиолетовый", forest:"Лесной зелёный"}
},
en:{
 appTitle:"Resume Builder", pdf:"Download PDF",
 htmlBtn:"HTML file", printBtn:"Print",
 pdfTip:"In the dialog that opens, pick 'Save as PDF' instead of a printer, then press Save. This is a clean PDF made by the browser itself.",
 tabForm:"Form", tabPreview:"Resume",
 gTemplates:"Templates", gCustom:"Custom mix",
 structure:"Structure", font:"Typeface", color:"Colour",
 customHint:"Mix any structure with any colour and typeface.",
 gBasics:"Basics", fullName:"Full name", profession:"Profession or title",
 photo:"Photo (optional)", photoAdd:"Choose photo", photoRemove:"Remove", showPhoto:"Show on resume",
 gContact:"Contact", phone:"Phone", email:"Email", city:"City", link:"Link",
 gSummary:"Summary", summaryHint:"2–4 sentences: what you do, what you are good at.",
 gExperience:"Experience", addExperience:"+ Add a role",
 position:"Position", company:"Organisation", place:"City", period:"Period",
 description:"Responsibilities and results", descHint:"Each line becomes a separate bullet.",
 gEducation:"Education", addEducation:"+ Add education",
 degree:"Field or degree", institution:"Institution", note:"Note",
 gSkills:"Skills", skillsHint:"One skill per line. For a level bar: Excel | 80",
 gLanguages:"Languages", addLanguage:"+ Add language", langName:"Language", langLevel:"Level",
 gCertificates:"Certificates", addCertificate:"+ Add certificate",
 certName:"Title", certOrg:"Issuer", certYear:"Year",
 clearAll:"Clear everything", clearAsk:"All entered data will be removed. Continue?",
 sec:{summary:"Summary", experience:"Experience", education:"Education",
      skills:"Skills", languages:"Languages", certificates:"Certificates"},
 struct:{classic:"Classic", leftpanel:"Left panel", rightpanel:"Right panel", banner:"Banner",
         timeline:"Timeline", minimal:"Minimal", academic:"Academic", creative:"Creative",
         deco1:"Decor · banner", deco2:"Decor · black card", deco3:"Decor · diagonal",
         deco4:"Decor · badges", deco5:"Decor · elegant", deco6:"Decor · rings"},
 fonts:{serif:"Classic serif", sans:"Modern sans", geo:"Geometric sans", mix:"Serif + sans", mono:"Technical"},
 colors:{bw:"Black & white", navy:"Navy", blue:"Blue", olive:"Olive", bordo:"Burgundy",
         graygold:"Grey & gold", teal:"Teal", brown:"Brown", purple:"Ink purple", forest:"Forest green"}
}};

/* ============================================================
   6) DIZAYN TIZIMI — ranglar, shriftlar, 44 ta shablon
   ============================================================ */
const COLORS = [["bw","#111827"],["navy","#16263f"],["blue","#12609f"],["olive","#556327"],["bordo","#7a1f2b"],
                ["graygold","#8a6d34"],["teal","#0f6461"],["brown","#69462c"],["purple","#413166"],["forest","#20503a"]];
const STRUCTURES = ["classic","leftpanel","rightpanel","banner","timeline","minimal","academic","creative",
                    "deco1","deco2","deco3","deco4","deco5","deco6"];
const FONTS = ["serif","sans","geo","mix","mono"];

/* 44 kombinatsiya: [nom, struktura, rang, shrift] */
const TEMPLATES = [
 ["Klassik Navy","classic","navy","serif"],
 ["Klassik Qora","classic","bw","serif"],
 ["Klassik Bordo","classic","bordo","serif"],
 ["Klassik Zaytun","classic","olive","mix"],
 ["Klassik Teal","classic","teal","sans"],
 ["Klassik Jigarrang","classic","brown","serif"],
 ["Panel Navy","leftpanel","navy","sans"],
 ["Panel Teal","leftpanel","teal","geo"],
 ["Panel Bordo","leftpanel","bordo","mix"],
 ["Panel O'rmon","leftpanel","forest","sans"],
 ["Panel Oltin","leftpanel","graygold","serif"],
 ["Panel Siyoh","leftpanel","purple","geo"],
 ["Yon Ko'k","rightpanel","blue","sans"],
 ["Yon Qora","rightpanel","bw","geo"],
 ["Yon Zaytun","rightpanel","olive","mix"],
 ["Yon Jigarrang","rightpanel","brown","serif"],
 ["Yon Navy","rightpanel","navy","sans"],
 ["Banner Ko'k","banner","blue","geo"],
 ["Banner Bordo","banner","bordo","sans"],
 ["Banner Teal","banner","teal","sans"],
 ["Banner Siyoh","banner","purple","geo"],
 ["Banner Qora","banner","bw","mono"],
 ["Banner O'rmon","banner","forest","mix"],
 ["Chiziq Navy","timeline","navy","mix"],
 ["Chiziq Teal","timeline","teal","sans"],
 ["Chiziq Bordo","timeline","bordo","serif"],
 ["Chiziq Oltin","timeline","graygold","mix"],
 ["Chiziq Ko'k","timeline","blue","geo"],
 ["Minimal","minimal","bw","sans"],
 ["Minimal Navy","minimal","navy","mix"],
 ["Minimal Zaytun","minimal","olive","sans"],
 ["Minimal Teal","minimal","teal","geo"],
 ["Minimal Oltin","minimal","graygold","serif"],
 ["Akademik Qora","academic","bw","serif"],
 ["Akademik Navy","academic","navy","serif"],
 ["Akademik O'rmon","academic","forest","mix"],
 ["Akademik Jigarrang","academic","brown","mix"],
 ["Akademik Siyoh","academic","purple","serif"],
 ["Ijodiy Bordo","creative","bordo","geo"],
 ["Ijodiy Teal","creative","teal","geo"],
 ["Ijodiy Siyoh","creative","purple","sans"],
 ["Ijodiy Ko'k","creative","blue","mono"],
 ["Ijodiy Zaytun","creative","olive","mix"],
 ["Ijodiy Oltin","creative","graygold","serif"],
 /* --- 6 ta maxsus bezakli shablon --- */
 ["Tabiat Banner","deco1","olive","sans"],
 ["Qora Karta","deco2","graygold","geo"],
 ["Diagonal Navy","deco3","navy","sans"],
 ["Badge Ko'k","deco4","blue","sans"],
 ["Nafis Jigarrang","deco5","brown","serif"],
 ["Halqalar","deco6","graygold","mix"]
];

const ICON = {
 phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
 mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>',
 pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
 link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>'
};

/* Bo'lim sarlavhalari uchun nishonchalar — faqat bezakli shablonlarda ko'rinadi */

const SEC_ICON = {
 summary:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>',
 experience:'<svg viewBox="0 0 24 24"><rect x="2.5" y="7" width="19" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M2.5 12h19"/></svg>',
 education:'<svg viewBox="0 0 24 24"><path d="M12 4 22 9l-10 5L2 9l10-5z"/><path d="M6 11.5V17c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.5"/></svg>',
 skills:'<svg viewBox="0 0 24 24"><path d="M12 2.5 14.6 8l6.4.9-4.6 4.4 1.1 6.2-5.5-3-5.5 3 1.1-6.2L3 8.9 9.4 8z"/></svg>',
 languages:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.2"/><path d="M3 12h18M12 2.8c2.6 2.6 3.8 6 3.8 9.2S14.6 18.6 12 21.2C9.4 18.6 8.2 15.2 8.2 12S9.4 5.4 12 2.8z"/></svg>',
 certificates:'<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="5.5"/><path d="m8.5 13.5-1 8 4.5-2.5 4.5 2.5-1-8"/></svg>'
};

/* ---------- Yordamchilar ---------- */
function esc(s){
  return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
  });
}

function contactHTML(d){
  var p = [];
  if (d.phone) p.push('<div class="c-item">' + ICON.phone + "<span>" + esc(d.phone) + "</span></div>");
  if (d.email) p.push('<div class="c-item">' + ICON.mail  + "<span>" + esc(d.email) + "</span></div>");
  if (d.city)  p.push('<div class="c-item">' + ICON.pin   + "<span>" + esc(d.city)  + "</span></div>");
  if (d.link)  p.push('<div class="c-item">' + ICON.link  + "<span>" + esc(d.link)  + "</span></div>");
  return p.length ? '<div class="r-contact">' + p.join("") + "</div>" : "";
}

function descHTML(txt){
  var lines = String(txt || "").split("\n").map(function(s){ return s.trim(); }).filter(Boolean);
  if (!lines.length) return "";
  if (lines.length === 1) return '<div class="item-desc"><p>' + esc(lines[0]) + "</p></div>";
  return '<div class="item-desc"><ul>' + lines.map(function(l){ return "<li>" + esc(l) + "</li>"; }).join("") + "</ul></div>";
}

function sec(key, inner, lang){
  if (!inner || !inner.trim()) return "";
  var t = (I18N[lang] || I18N.uz).sec[key];
  var ic = SEC_ICON[key] ? '<span class="sec-ic">' + SEC_ICON[key] + "</span>" : "";
  return '<section class="sec" data-sec="' + key + '"><h2 class="sec-t">' + ic + esc(t) +
         '</h2><div class="sec-b">' + inner + "</div></section>";
}

/* ---------- Bo'sh rezyume ---------- */
function emptyState(){
  return {
    lang: "uz",
    design: { structure: "classic", color: "navy", font: "serif" },
    tpl: 0,
    data: {
      name: "", role: "", photo: null, showPhoto: true,
      phone: "", email: "", city: "", link: "", summary: "",
      experience: [], education: [], skills: "", languages: [], certificates: []
    }
  };
}

/* ---------- Rezyume ichki HTML'i (varaq ichidagi hamma narsa) ---------- */
function inner(state){
  var d = state.data, lang = state.lang || "uz";
  var photo = (d.photo && d.showPhoto !== false) ? '<img class="photo" src="' + d.photo + '" alt="">' : "";
  var contact = contactHTML(d);

  var head = '<header class="r-head"><div class="r-id">' +
      '<h1 class="r-name">' + (esc(d.name) || "&nbsp;") + "</h1>" +
      (d.role ? '<div class="r-role">' + esc(d.role) + "</div>" : "") +
      contact + "</div>" + photo + "</header>";

  var exp = (d.experience || []).map(function(e){
    if (!e.role && !e.org && !e.date && !e.desc) return "";
    var org = [e.org, e.place].filter(Boolean).join(" \u00b7 ");
    return '<div class="item"><div class="item-h"><div class="item-role">' + esc(e.role) + "</div>" +
      (e.date ? '<div class="item-date">' + esc(e.date) + "</div>" : "") + "</div>" +
      (org ? '<div class="item-org">' + esc(org) + "</div>" : "") + descHTML(e.desc) + "</div>";
  }).join("");

  var edu = (d.education || []).map(function(e){
    if (!e.degree && !e.org && !e.date && !e.note) return "";
    return '<div class="item"><div class="item-h"><div class="item-role">' + esc(e.degree) + "</div>" +
      (e.date ? '<div class="item-date">' + esc(e.date) + "</div>" : "") + "</div>" +
      (e.org ? '<div class="item-org">' + esc(e.org) + "</div>" : "") + descHTML(e.note) + "</div>";
  }).join("");

  var list = String(d.skills || "").split(/\n|,/).map(function(s){ return s.trim(); }).filter(Boolean)
    .map(function(s){
      var m = s.match(/^(.*?)\s*\|\s*(\d{1,3})\s*%?$/);
      return m ? { n: m[1].trim(), v: Math.max(0, Math.min(100, +m[2])) } : { n: s, v: null };
    });
  var hasBars = list.some(function(x){ return x.v !== null; });
  var skills = !list.length ? "" : (hasBars
    ? '<div class="skills-bars">' + list.map(function(x){
        return '<div class="skill' + (x.v === null ? " no-bar" : "") + '"><span class="skill-n">' + esc(x.n) + "</span>" +
          (x.v !== null ? '<span class="bar"><i style="width:' + x.v + '%"></i></span>' : "") + "</div>";
      }).join("") + "</div>"
    : '<div class="chips">' + list.map(function(x){ return '<span class="chip">' + esc(x.n) + "</span>"; }).join("") + "</div>");

  var lg = (d.languages || []).filter(function(l){ return l.name || l.level; });
  var langs = lg.length ? '<div class="langs">' + lg.map(function(l){
      return '<div class="lang"><b>' + esc(l.name) + "</b><i>" + esc(l.level) + "</i></div>";
    }).join("") + "</div>" : "";

  var certs = (d.certificates || []).filter(function(c){ return c.name || c.org || c.year; }).map(function(c){
    var sub = [c.org, c.year].filter(Boolean).join(" \u00b7 ");
    return '<div class="item"><div class="item-role" style="font-size:9.9pt">' + esc(c.name) + "</div>" +
      (sub ? '<div class="item-org">' + esc(sub) + "</div>" : "") + "</div>";
  }).join("");

  var main = '<main class="r-main">' +
      sec("summary", d.summary ? '<div class="summary">' + esc(d.summary) + "</div>" : "", lang) +
      sec("experience", exp, lang) + sec("education", edu, lang) + "</main>";

  var side = '<aside class="r-side">' + photo + contact +
      sec("skills", skills, lang) + sec("languages", langs, lang) + sec("certificates", certs, lang) + "</aside>";

  return '<div class="deco" aria-hidden="true"></div>' + head + side + main;
}

/* ---------- PDF uchun to'liq sahifa ---------- */
function documentHTML(state, css){
  var g = state.design || {};
  return '<!DOCTYPE html><html lang="' + (state.lang || "uz") + '"><head><meta charset="utf-8">' +
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
    '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lora:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;600&family=Merriweather:wght@400;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">' +
    "<style>" + css + "\nhtml,body{margin:0;padding:0;background:#fff}</style></head><body>" +
    '<div class="resume" id="resume" data-structure="' + (g.structure || "classic") +
    '" data-color="' + (g.color || "navy") + '" data-font="' + (g.font || "serif") + '">' +
    inner(state) + "</div></body></html>";
}

return { I18N: I18N, COLORS: COLORS, STRUCTURES: STRUCTURES, FONTS: FONTS, TEMPLATES: TEMPLATES,
         esc: esc, inner: inner, documentHTML: documentHTML, emptyState: emptyState };
});
