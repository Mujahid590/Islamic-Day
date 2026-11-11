/* ===== সেটিংস পেজ — js/setting.js =====
   ভাষা, থিম, রঙ, যোগাযোগ।
   নিচের KEYS যদি আপনার main.js/i18n.js এ ভিন্ন নামে থাকে, শুধু এখানে বদলে নিন। */
(function () {
  'use strict';

  var EMAIL = 'mujahid590.bd@gmail.com';
  var VERSION = '1.0';
  /* অ্যাপের বাকি পেজ যে কী ব্যবহার করে (theme = deen_theme নিশ্চিত); lang/color এর সম্ভাব্য নামগুলোতে একসাথে সেভ হয় */
  var KEYS = { lang: ['deen_lang', 'lang', 'language'], theme: ['deen_theme', 'theme'], color: ['deen_color', 'deen_accent', 'accent'] };

  var COLORS = {
    teal:  { c: '#0d9488', n: { bn: 'টিল', en: 'Teal', ar: 'تركوازي', ur: 'ٹیل', hi: 'टील' } },
    green: { c: '#16a34a', n: { bn: 'সবুজ', en: 'Green', ar: 'أخضر', ur: 'سبز', hi: 'हरा' } },
    blue:  { c: '#0284c7', n: { bn: 'নীল', en: 'Blue', ar: 'أزرق', ur: 'نیلا', hi: 'नीला' } },
    peach: { c: '#ea580c', n: { bn: 'পিচ', en: 'Peach', ar: 'خوخي', ur: 'آڑو', hi: 'पीच' } }
  };

  var LANGS = [
    { id: 'bn', flag: '🇧🇩', name: 'বাংলা', dir: 'ltr' },
    { id: 'en', flag: '🇬🇧', name: 'English', dir: 'ltr' },
    { id: 'ar', flag: '🇸🇦', name: 'العربية', dir: 'rtl' },
    { id: 'ur', flag: '🇵🇰', name: 'اردو', dir: 'rtl' },
    { id: 'hi', flag: '🇮🇳', name: 'हिन्दी', dir: 'ltr' }
  ];

  var T = {
    bn: { title: 'সেটিংস', subtitle: 'অ্যাপ আপনার মতো সাজিয়ে নিন', back: 'ফিরে যান', secLook: 'চেহারা ও ভাষা', lang: 'ভাষা', theme: 'থিম', themeDark: '🌙 ডার্ক', themeLight: '☀️ লাইট', themeSystem: '📱 সিস্টেম', color: 'অ্যাকসেন্ট রঙ',
      secData: 'ডেটা ও ব্যাকআপ', export: '⬇ ব্যাকআপ নিন', import: '⬆ রিস্টোর করুন', share: '🔗 অ্যাপ শেয়ার করুন', danger: 'বিপদজনক এলাকা', resetTracker: 'নামাজের হিসাব মুছুন', resetAll: 'সব সেটিংস রিসেট',
      secContact: 'যোগাযোগ', email: 'ইমেইল', copy: 'কপি', phone: 'মোবাইল', phoneSoon: 'শীঘ্রই যুক্ত হবে', sendMail: '✉️ ইমেইল পাঠান', report: '🐞 সমস্যা/পরামর্শ জানান',
      contactNote: 'সমস্যা জানালে অ্যাপের সংস্করণ ও ডিভাইসের তথ্য ইমেইলে আপনা-আপনি যুক্ত হবে, যাতে দ্রুত সমাধান করা যায়।',
      secAbout: 'অ্যাপ সম্পর্কে', appName: 'অ্যাপ', version: 'সংস্করণ', dataSrc: 'সময়ের উৎস',
      items: 'টি তথ্য', copied: 'ইমেইল কপি হয়েছে', copyFail: 'কপি করা যায়নি', exported: 'ব্যাকআপ ফাইল তৈরি হয়েছে', imported: 'রিস্টোর সফল হয়েছে', importFail: 'ফাইলটি সঠিক নয়', shared: 'লিংক কপি হয়েছে',
      confTracker: 'নামাজের সব হিসাব মুছে যাবে। নিশ্চিত?', confAll: 'সব সেটিংস ও ডেটা মুছে রিসেট হবে। নিশ্চিত?', done: 'সম্পন্ন হয়েছে', shareText: 'দ্বীন টাইম — নামাজের সময়, কুরআন ও আরও অনেক কিছু',
      mailSubject: 'দ্বীন টাইম — যোগাযোগ', repSubject: 'দ্বীন টাইম — সমস্যা/পরামর্শ', repBody: 'আসসালামু আলাইকুম,\n\n(এখানে আপনার সমস্যা/পরামর্শ লিখুন)\n\n--- অ্যাপের তথ্য ---' },
    en: { title: 'Settings', subtitle: 'Make the app your own', back: 'Go back', secLook: 'Appearance & Language', lang: 'Language', theme: 'Theme', themeDark: '🌙 Dark', themeLight: '☀️ Light', themeSystem: '📱 System', color: 'Accent color',
      secData: 'Data & Backup', export: '⬇ Back up', import: '⬆ Restore', share: '🔗 Share app', danger: 'Danger zone', resetTracker: 'Clear prayer tracker', resetAll: 'Reset all settings',
      secContact: 'Contact', email: 'Email', copy: 'Copy', phone: 'Mobile', phoneSoon: 'Coming soon', sendMail: '✉️ Send email', report: '🐞 Report issue / feedback',
      contactNote: 'When you report an issue, the app version and device info are added to the email automatically so it can be fixed faster.',
      secAbout: 'About', appName: 'App', version: 'Version', dataSrc: 'Time source',
      items: ' items', copied: 'Email copied', copyFail: 'Could not copy', exported: 'Backup file created', imported: 'Restore successful', importFail: 'Invalid file', shared: 'Link copied',
      confTracker: 'All prayer tracker data will be deleted. Sure?', confAll: 'All settings and data will be erased. Sure?', done: 'Done', shareText: 'Deen Time — prayer times, Quran and more',
      mailSubject: 'Deen Time — Contact', repSubject: 'Deen Time — Issue / Feedback', repBody: 'Assalamu alaikum,\n\n(Write your issue / feedback here)\n\n--- App info ---' },
    ar: { title: 'الإعدادات', subtitle: 'خصّص التطبيق على ذوقك', back: 'رجوع', secLook: 'المظهر واللغة', lang: 'اللغة', theme: 'السمة', themeDark: '🌙 داكن', themeLight: '☀️ فاتح', themeSystem: '📱 النظام', color: 'لون التمييز',
      secData: 'البيانات والنسخ الاحتياطي', export: '⬇ نسخ احتياطي', import: '⬆ استعادة', share: '🔗 مشاركة التطبيق', danger: 'منطقة الخطر', resetTracker: 'مسح سجل الصلاة', resetAll: 'إعادة ضبط الإعدادات',
      secContact: 'التواصل', email: 'البريد الإلكتروني', copy: 'نسخ', phone: 'الجوال', phoneSoon: 'سيُضاف قريباً', sendMail: '✉️ إرسال بريد', report: '🐞 إبلاغ عن مشكلة / اقتراح',
      contactNote: 'عند الإبلاغ عن مشكلة تُضاف نسخة التطبيق ومعلومات الجهاز تلقائياً إلى البريد لتسريع الحل.',
      secAbout: 'حول التطبيق', appName: 'التطبيق', version: 'الإصدار', dataSrc: 'مصدر الأوقات',
      items: ' عنصر', copied: 'تم نسخ البريد', copyFail: 'تعذّر النسخ', exported: 'تم إنشاء النسخة الاحتياطية', imported: 'تمت الاستعادة بنجاح', importFail: 'ملف غير صالح', shared: 'تم نسخ الرابط',
      confTracker: 'سيتم حذف كل سجل الصلاة. هل أنت متأكد؟', confAll: 'سيتم مسح كل الإعدادات والبيانات. هل أنت متأكد؟', done: 'تم', shareText: 'دين تايم — أوقات الصلاة والقرآن والمزيد',
      mailSubject: 'دين تايم — تواصل', repSubject: 'دين تايم — مشكلة / اقتراح', repBody: 'السلام عليكم،\n\n(اكتب مشكلتك / اقتراحك هنا)\n\n--- معلومات التطبيق ---' },
    ur: { title: 'سیٹنگز', subtitle: 'ایپ کو اپنی پسند کے مطابق بنائیں', back: 'واپس', secLook: 'ظاہری شکل اور زبان', lang: 'زبان', theme: 'تھیم', themeDark: '🌙 ڈارک', themeLight: '☀️ لائٹ', themeSystem: '📱 سسٹم', color: 'نمایاں رنگ',
      secData: 'ڈیٹا اور بیک اپ', export: '⬇ بیک اپ لیں', import: '⬆ بحال کریں', share: '🔗 ایپ شیئر کریں', danger: 'خطرناک حصہ', resetTracker: 'نماز کا ریکارڈ مٹائیں', resetAll: 'تمام سیٹنگز ری سیٹ',
      secContact: 'رابطہ', email: 'ای میل', copy: 'کاپی', phone: 'موبائل', phoneSoon: 'جلد شامل ہوگا', sendMail: '✉️ ای میل بھیجیں', report: '🐞 مسئلہ / مشورہ بھیجیں',
      contactNote: 'مسئلہ بتانے پر ایپ کا ورژن اور ڈیوائس کی معلومات خود بخود ای میل میں شامل ہو جائیں گی تاکہ جلد حل ہو سکے۔',
      secAbout: 'ایپ کے بارے میں', appName: 'ایپ', version: 'ورژن', dataSrc: 'اوقات کا ماخذ',
      items: ' آئٹمز', copied: 'ای میل کاپی ہو گئی', copyFail: 'کاپی نہیں ہو سکی', exported: 'بیک اپ فائل بن گئی', imported: 'بحالی کامیاب', importFail: 'فائل درست نہیں', shared: 'لنک کاپی ہو گیا',
      confTracker: 'نماز کا تمام ریکارڈ مٹ جائے گا۔ کیا آپ کو یقین ہے؟', confAll: 'تمام سیٹنگز اور ڈیٹا مٹ جائے گا۔ کیا آپ کو یقین ہے؟', done: 'ہو گیا', shareText: 'دین ٹائم — نماز کے اوقات، قرآن اور بہت کچھ',
      mailSubject: 'دین ٹائم — رابطہ', repSubject: 'دین ٹائم — مسئلہ / مشورہ', repBody: 'السلام علیکم،\n\n(یہاں اپنا مسئلہ / مشورہ لکھیں)\n\n--- ایپ کی معلومات ---' },
    hi: { title: 'सेटिंग्स', subtitle: 'ऐप को अपने अनुसार सजाएँ', back: 'वापस', secLook: 'रूप और भाषा', lang: 'भाषा', theme: 'थीम', themeDark: '🌙 डार्क', themeLight: '☀️ लाइट', themeSystem: '📱 सिस्टम', color: 'एक्सेंट रंग',
      secData: 'डेटा और बैकअप', export: '⬇ बैकअप लें', import: '⬆ रीस्टोर करें', share: '🔗 ऐप शेयर करें', danger: 'खतरनाक क्षेत्र', resetTracker: 'नमाज़ का रिकॉर्ड मिटाएँ', resetAll: 'सभी सेटिंग्स रीसेट',
      secContact: 'संपर्क', email: 'ईमेल', copy: 'कॉपी', phone: 'मोबाइल', phoneSoon: 'जल्द जोड़ा जाएगा', sendMail: '✉️ ईमेल भेजें', report: '🐞 समस्या / सुझाव भेजें',
      contactNote: 'समस्या बताने पर ऐप का संस्करण और डिवाइस की जानकारी ईमेल में अपने-आप जुड़ जाएगी ताकि जल्दी समाधान हो सके।',
      secAbout: 'ऐप के बारे में', appName: 'ऐप', version: 'संस्करण', dataSrc: 'समय का स्रोत',
      items: ' आइटम', copied: 'ईमेल कॉपी हो गया', copyFail: 'कॉपी नहीं हो सका', exported: 'बैकअप फ़ाइल बन गई', imported: 'रीस्टोर सफल', importFail: 'फ़ाइल सही नहीं है', shared: 'लिंक कॉपी हो गया',
      confTracker: 'नमाज़ का सारा रिकॉर्ड मिट जाएगा। क्या आप निश्चित हैं?', confAll: 'सभी सेटिंग्स और डेटा मिट जाएगा। क्या आप निश्चित हैं?', done: 'हो गया', shareText: 'दीन टाइम — नमाज़ के समय, क़ुरआन और बहुत कुछ',
      mailSubject: 'दीन टाइम — संपर्क', repSubject: 'दीन टाइम — समस्या / सुझाव', repBody: 'अस्सलामु अलैकुम,\n\n(यहाँ अपनी समस्या / सुझाव लिखें)\n\n--- ऐप की जानकारी ---' }
  };

  var $ = function (id) { return document.getElementById(id); };
  var doc = document.documentElement;

  function store(k, v) {
    var list = Array.isArray(k) ? k : [k];
    try {
      if (v === undefined) { for (var i = 0; i < list.length; i++) { var x = localStorage.getItem(list[i]); if (x) return x; } return null; }
      list.forEach(function (n) { localStorage.setItem(n, v); });
    } catch (e) {}
    return null;
  }

  var lang = store(KEYS.lang) || 'bn';
  if (!T[lang]) lang = 'bn';
  var theme = store(KEYS.theme) || 'dark';
  var color = store(KEYS.color) || 'teal';
  if (!COLORS[color]) color = 'teal';

  function t(k) { return (T[lang] && T[lang][k]) || T.bn[k] || ''; }

  /* ---------- টোস্ট ---------- */
  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'sx-toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  /* ---------- ভাষা ---------- */
  function applyLangText() {
    var d = T[lang];
    document.querySelectorAll('[data-k]').forEach(function (el) {
      var v = d[el.getAttribute('data-k')];
      if (v !== undefined) el.textContent = v;
    });
    var back = $('backBtn'); if (back) back.setAttribute('aria-label', t('back'));
    document.title = t('title') + ' - ' + (lang === 'bn' ? 'দ্বীন টাইম' : 'Deen Time');
    updateColorName();
    buildMailLinks();
  }

  function setLang(id) {
    var L = LANGS.filter(function (x) { return x.id === id; })[0] || LANGS[0];
    lang = L.id;
    store(KEYS.lang, lang);
    doc.lang = lang;
    doc.dir = L.dir;
    document.body.classList.toggle('rtl', L.dir === 'rtl');
    renderLang();
    applyLangText();
    try { window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } })); } catch (e) {}
  }

  function renderLang() {
    var box = $('langGrid');
    var cur = LANGS.filter(function (x) { return x.id === lang; })[0];
    var open = box.classList.contains('open');
    var h = '<button type="button" class="lang-current" id="langBtn" aria-haspopup="listbox" aria-expanded="' + open + '">' +
      '<span class="flag">' + cur.flag + '</span><span class="lang-name">' + cur.name + '</span><span class="chev" aria-hidden="true">▾</span></button>' +
      '<div class="lang-menu" id="langMenu" role="listbox"' + (open ? '' : ' hidden') + '>';
    LANGS.forEach(function (L) {
      h += '<button type="button" class="lang-opt' + (L.id === lang ? ' active' : '') + '" role="option" aria-selected="' + (L.id === lang) + '" data-l="' + L.id + '">' +
        '<span class="flag">' + L.flag + '</span><span class="lang-name">' + L.name + '</span><span class="tick" aria-hidden="true">✓</span></button>';
    });
    box.innerHTML = h + '</div>';
  }

  function toggleLangMenu(force) {
    var box = $('langGrid'), menu = $('langMenu'), btn = $('langBtn');
    var open = force === undefined ? menu.hidden : force;
    menu.hidden = !open;
    box.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  }

  /* ---------- থিম ---------- */
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function applyTheme() {
    var dark = theme === 'dark' || (theme === 'system' && mq && mq.matches);
    document.body.classList.toggle('dark', dark);
    document.body.classList.toggle('light', !dark);
    doc.setAttribute('data-theme', dark ? 'dark' : 'light');
    var m = document.querySelector('meta[name=theme-color]');
    if (m) m.setAttribute('content', dark ? '#0b1a20' : COLORS[color].c);
  }
  function renderTheme() {
    var row = $('themeRow'), idx = 0;
    row.querySelectorAll('.theme-opt').forEach(function (b, i) {
      var on = b.getAttribute('data-theme') === theme;
      b.classList.toggle('active', on);
      b.setAttribute('aria-checked', on);
      if (on) idx = i;
    });
    var s = row.querySelector('.slider');
    if (!s) { s = document.createElement('span'); s.className = 'slider'; s.setAttribute('aria-hidden', 'true'); row.insertBefore(s, row.firstChild); }
    s.style.transform = 'translateX(' + (doc.dir === 'rtl' ? -idx : idx) * 100 + '%)';
  }
  function setTheme(v) { theme = v; store(KEYS.theme, v); applyTheme(); renderTheme(); }
  if (mq) { var onMq = function () { if (theme === 'system') applyTheme(); }; mq.addEventListener ? mq.addEventListener('change', onMq) : mq.addListener(onMq); }

  /* ---------- রঙ ---------- */
  function hexToRgba(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function applyColor() {
    var c = COLORS[color].c;
    doc.setAttribute('data-accent', color);
    doc.style.setProperty('--accent', c);
    doc.style.setProperty('--accent-l', hexToRgba(c, 0.14));
    var m = document.querySelector('meta[name=theme-color]');
    if (m && !document.body.classList.contains('dark')) m.setAttribute('content', c);
  }
  function updateColorName() { var e = $('colorName'); if (e) e.textContent = '· ' + COLORS[color].n[lang]; }
  function renderColor() {
    document.querySelectorAll('#colorDots .dot').forEach(function (d) {
      var k = d.getAttribute('data-c'), on = k === color;
      d.classList.toggle('active', on);
      d.setAttribute('aria-checked', on);
      d.setAttribute('aria-label', COLORS[k].n[lang]);
      d.title = COLORS[k].n[lang];
    });
  }
  function setColor(k) { color = k; store(KEYS.color, k); applyColor(); renderColor(); updateColorName(); }

  /* ---------- যোগাযোগ ---------- */
  function copyText(text, okMsg) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      ta.remove(); toast(ok ? okMsg : t('copyFail'));
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { toast(okMsg); }, fallback);
    else fallback();
  }

  /* mailto: ক্লিক করলে ইমেইল অ্যাপে ঠিকানা সহ কম্পোজ স্ক্রিন খোলে */
  function mailto(subject, body) {
    var q = [];
    if (subject) q.push('subject=' + encodeURIComponent(subject));
    if (body) q.push('body=' + encodeURIComponent(body));
    return 'mailto:' + EMAIL + (q.length ? '?' + q.join('&') : '');
  }
  function buildMailLinks() {
    $('mailBtn').href = mailto(t('mailSubject'));
    var info = '\n' + t('version') + ': ' + VERSION + '\n' + t('lang') + ': ' + lang + '\n' + (navigator.userAgent || '') + '\n' + screen.width + 'x' + screen.height;
    $('reportBtn').href = mailto(t('repSubject'), t('repBody') + info);
    $('emailLink').href = 'mailto:' + EMAIL;
  }

  /* ---------- ইভেন্ট ---------- */
  function bind() {
    $('langGrid').addEventListener('click', function (e) {
      var opt = e.target.closest('.lang-opt');
      if (opt) { $('langGrid').classList.remove('open'); setLang(opt.getAttribute('data-l')); return; }
      if (e.target.closest('#langBtn')) toggleLangMenu();
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('#langGrid')) { var m = $('langMenu'); if (m && !m.hidden) toggleLangMenu(false); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var m = $('langMenu'); if (m && !m.hidden) { toggleLangMenu(false); $('langBtn').focus(); } } });

    $('themeRow').addEventListener('click', function (e) { var b = e.target.closest('.theme-opt'); if (b) setTheme(b.getAttribute('data-theme')); });
    $('colorDots').addEventListener('click', function (e) { var d = e.target.closest('.dot'); if (d) setColor(d.getAttribute('data-c')); });

    $('copyEmailBtn').addEventListener('click', function () { copyText(EMAIL, t('copied')); });
  }

  function init() {
    var verEl = $('appVer'); if (verEl) verEl.textContent = VERSION;
    bind();
    applyTheme(); applyColor();
    setLang(lang);
    renderTheme(); renderColor();
  }

  init();
  window.addEventListener('load', function () { setLang(lang); renderTheme(); });
})();
