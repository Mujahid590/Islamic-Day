/* ===== সেটিংস পেজ — js/setting.js =====
   ভাষা, থিম, রঙ, যোগাযোগ।
   নিচের KEYS যদি আপনার main.js/i18n.js এ ভিন্ন নামে থাকে, শুধু এখানে বদলে নিন। */
(function () {
  'use strict';

  var EMAIL = 'mujahid590.bd@gmail.com';
  var VERSION = '1.0';
  /* অ্যাপের বাকি পেজের সঙ্গে একই কী (main.js: deen_theme, deen_color); ভাষা i18n.js এর setLang() দিয়ে সেভ হয় */
  var KEYS = { lang: ['deen_lang', 'lang'], theme: 'deen_theme', color: 'deen_color' };

  var COLORS = {
    teal:  { c: '#0d9488', n: { bn: 'টিল', en: 'Teal', ar: 'تركوازي', ur: 'ٹیل', hi: 'टील' } },
    green: { c: '#16a34a', n: { bn: 'সবুজ', en: 'Green', ar: 'أخضر', ur: 'سبز', hi: 'हरा' } },
    blue:  { c: '#0284c7', n: { bn: 'নীল', en: 'Blue', ar: 'أزرق', ur: 'نیلا', hi: 'नीला' } },
    peach: { c: '#ea580c', n: { bn: 'পিচ', en: 'Peach', ar: 'خوخي', ur: 'آڑو', hi: 'पीच' } }
  };

  var FALLBACK_LANGS = [
    { id: 'bn', flag: '🇧🇩', name: 'বাংলা', dir: 'ltr' },
    { id: 'en', flag: '🇬🇧', name: 'English', dir: 'ltr' },
    { id: 'ar', flag: '🇸🇦', name: 'العربية', dir: 'rtl' },
    { id: 'ur', flag: '🇵🇰', name: 'اردو', dir: 'rtl' },
    { id: 'hi', flag: '🇮🇳', name: 'हिन्दी', dir: 'ltr' }
  ];

  /* অ্যাপের আসল ভাষা তালিকা (i18n.js) থাকলে সেটাই ব্যবহার হবে */
  var LANG_LIST = FALLBACK_LANGS;
  try {
    if (typeof LANGS !== 'undefined' && LANGS && Object.keys(LANGS).length) {
      LANG_LIST = Object.keys(LANGS).map(function (k) {
        var g = LANGS[k] || {};
        return { id: k, flag: g.flag || '🌐', name: g.name || k, dir: (k === 'ar' || k === 'ur' || g.dir === 'rtl') ? 'rtl' : 'ltr' };
      });
    }
  } catch (e) {}

  var T = {
    bn: { title: 'সেটিংস', subtitle: 'অ্যাপ আপনার মতো সাজিয়ে নিন', back: 'ফিরে যান', secLook: 'চেহারা ও ভাষা', lang: 'ভাষা', theme: 'থিম', themeDark: '🌙 ডার্ক', themeLight: '☀️ লাইট', themeSystem: '📱 সিস্টেম', color: 'অ্যাকসেন্ট রঙ',
      secData: 'ডেটা ও ব্যাকআপ', export: '⬇ ব্যাকআপ নিন', import: '⬆ রিস্টোর করুন', share: '🔗 অ্যাপ শেয়ার করুন', danger: 'বিপদজনক এলাকা', resetTracker: 'নামাজের হিসাব মুছুন', resetAll: 'সব সেটিংস রিসেট',
      secContact: 'যোগাযোগ', email: 'ইমেইল', copy: 'কপি', phone: 'মোবাইল', phoneSoon: 'শীঘ্রই যুক্ত হবে', sendMail: '✉️ ইমেইল পাঠান', report: '🐞 সমস্যা/পরামর্শ জানান',
      contactNote: 'এই অ্যাপে কোনো ত্রুটি বা সমস্যা দেখা গেলে, কিংবা আপনার কোনো পরামর্শ থাকলে নির্দ্বিধায় ইমেইলের মাধ্যমে জানান। আপনার একটি বার্তাই অ্যাপটিকে আরও সুন্দর ও নির্ভুল করে তুলতে সাহায্য করবে। 🤍',
      secAbout: 'অ্যাপ সম্পর্কে', appName: 'অ্যাপ', version: 'সংস্করণ', dataSrc: 'সময়ের উৎস',
      items: 'টি তথ্য', copied: 'ইমেইল কপি হয়েছে', copyFail: 'কপি করা যায়নি', exported: 'ব্যাকআপ ফাইল তৈরি হয়েছে', imported: 'রিস্টোর সফল হয়েছে', importFail: 'ফাইলটি সঠিক নয়', shared: 'লিংক কপি হয়েছে',
      confTracker: 'নামাজের সব হিসাব মুছে যাবে। নিশ্চিত?', confAll: 'সব সেটিংস ও ডেটা মুছে রিসেট হবে। নিশ্চিত?', done: 'সম্পন্ন হয়েছে', shareText: 'দ্বীন টাইম — নামাজের সময়, কুরআন ও আরও অনেক কিছু',
      mailSubject: 'ইসলামিক অ্যাপের জন্য আমার পরামর্শের আবেদন', mailBody: 'জনাব,\n\nআসসালামু আলাইকুম।\n\nআমি "ইসলামিক নূর" অ্যাপ্লিকেশনটি ব্যবহার করছি। আমার মনে হয়, অ্যাপটিতে নিচের বিষয়টি যুক্ত করা হলে ব্যবহারকারীদের জন্য আরও উপকারী হবে:\n\nপ্রস্তাবিত অপশনের বিবরণ:\n(এখানে আপনার পরামর্শ বিস্তারিত লিখুন)\n\nবিষয়টি বিবেচনা করে যথাসম্ভব দ্রুত অ্যাপে যুক্ত করার ব্যবস্থা গ্রহণ করলে কৃতজ্ঞ থাকব।\n\nজাযাকাল্লাহু খাইরান।\n\nবিনীত,\n(এখানে আপনার নাম লিখুন)\n', repSubject: 'ইসলামিক নূর অ্যাপ্লিকেশন — সমস্যা সমাধানের আবেদন', repBody: 'জনাব,\n\nআসসালামু আলাইকুম।\n\nআমি "ইসলামিক নূর" অ্যাপ্লিকেশনটি ব্যবহার করছি। ব্যবহারের সময় আমি নিচের সমস্যাটির সম্মুখীন হয়েছি:\n\nসমস্যার বিবরণ:\n(এখানে আপনার সমস্যাটি বিস্তারিত লিখুন)\n\nবিষয়টি অনুগ্রহ করে দ্রুত দেখে সমাধানের ব্যবস্থা গ্রহণ করলে কৃতজ্ঞ থাকবো।\n\nজাযাকাল্লাহু খাইরান।\n\nবিনীত,\n(এখানে আপনার নাম লিখুন)\n' },
    en: { title: 'Settings', subtitle: 'Make the app your own', back: 'Go back', secLook: 'Appearance & Language', lang: 'Language', theme: 'Theme', themeDark: '🌙 Dark', themeLight: '☀️ Light', themeSystem: '📱 System', color: 'Accent color',
      secData: 'Data & Backup', export: '⬇ Back up', import: '⬆ Restore', share: '🔗 Share app', danger: 'Danger zone', resetTracker: 'Clear prayer tracker', resetAll: 'Reset all settings',
      secContact: 'Contact', email: 'Email', copy: 'Copy', phone: 'Mobile', phoneSoon: 'Coming soon', sendMail: '✉️ Send email', report: '🐞 Report issue / feedback',
      contactNote: 'If you notice any bug or problem in this app, or have a suggestion, please feel free to tell us by email. A single message from you helps make the app better and more accurate. 🤍',
      secAbout: 'About', appName: 'App', version: 'Version', dataSrc: 'Time source',
      items: ' items', copied: 'Email copied', copyFail: 'Could not copy', exported: 'Backup file created', imported: 'Restore successful', importFail: 'Invalid file', shared: 'Link copied',
      confTracker: 'All prayer tracker data will be deleted. Sure?', confAll: 'All settings and data will be erased. Sure?', done: 'Done', shareText: 'Deen Time — prayer times, Quran and more',
      mailSubject: 'Request to Consider My Suggestion for the Islamic App', mailBody: 'Dear Sir/Madam,\n\nAssalamu alaikum.\n\nI am a user of the "Islamic Nur (Deen Time)" application. I believe adding the following feature would make the app even more beneficial for its users:\n\nSuggested feature:\n(Please describe your suggestion in detail here)\n\nI kindly request you to consider this suggestion and add it to the app at your earliest convenience. I would be very grateful.\n\nJazakAllahu khairan.\n\nSincerely,\nName: (Write your name here)\n', repSubject: 'Islamic Nur App — Request for Issue Resolution', repBody: 'Dear Sir/Madam,\n\nAssalamu alaikum.\n\nWhile using the "Islamic Nur (Deen Time)" application, I have encountered the following issue:\n\nIssue description:\n(Please describe your issue in detail here)\n\nI kindly request you to look into this matter and resolve it at your earliest convenience.\n\nJazakAllahu khairan.\n\nSincerely,\nApplicant\'s name: (Write your name here)\n' },
    ar: { title: 'الإعدادات', subtitle: 'خصّص التطبيق على ذوقك', back: 'رجوع', secLook: 'المظهر واللغة', lang: 'اللغة', theme: 'السمة', themeDark: '🌙 داكن', themeLight: '☀️ فاتح', themeSystem: '📱 النظام', color: 'لون التمييز',
      secData: 'البيانات والنسخ الاحتياطي', export: '⬇ نسخ احتياطي', import: '⬆ استعادة', share: '🔗 مشاركة التطبيق', danger: 'منطقة الخطر', resetTracker: 'مسح سجل الصلاة', resetAll: 'إعادة ضبط الإعدادات',
      secContact: 'التواصل', email: 'البريد الإلكتروني', copy: 'نسخ', phone: 'الجوال', phoneSoon: 'سيُضاف قريباً', sendMail: '✉️ إرسال بريد', report: '🐞 إبلاغ عن مشكلة / اقتراح',
      contactNote: 'إذا لاحظت أي خلل أو مشكلة في هذا التطبيق، أو كان لديك اقتراح، فلا تتردد في إبلاغنا عبر البريد الإلكتروني. رسالة واحدة منك تساعدنا على جعل التطبيق أجمل وأدق. 🤍',
      secAbout: 'حول التطبيق', appName: 'التطبيق', version: 'الإصدار', dataSrc: 'مصدر الأوقات',
      items: ' عنصر', copied: 'تم نسخ البريد', copyFail: 'تعذّر النسخ', exported: 'تم إنشاء النسخة الاحتياطية', imported: 'تمت الاستعادة بنجاح', importFail: 'ملف غير صالح', shared: 'تم نسخ الرابط',
      confTracker: 'سيتم حذف كل سجل الصلاة. هل أنت متأكد؟', confAll: 'سيتم مسح كل الإعدادات والبيانات. هل أنت متأكد؟', done: 'تم', shareText: 'دين تايم — أوقات الصلاة والقرآن والمزيد',
      mailSubject: 'طلب النظر في اقتراحي للتطبيق الإسلامي', mailBody: 'السادة المحترمون،\n\nالسلام عليكم ورحمة الله وبركاته.\n\nأستخدم تطبيق "نور الإسلامي (دين تايم)"، وأرى أن إضافة الميزة التالية ستجعله أكثر فائدة للمستخدمين:\n\nوصف الميزة المقترحة:\n(يرجى كتابة اقتراحك هنا بالتفصيل)\n\nأرجو التكرم بدراسة هذا الاقتراح والعمل على إضافته إلى التطبيق في أقرب وقت ممكن، وأكون لكم من الشاكرين.\n\nجزاكم الله خيراً.\n\nمقدّم الاقتراح،\nالاسم: (اكتب اسمك هنا)\n', repSubject: 'تطبيق نور الإسلامي — طلب معالجة مشكلة', repBody: 'السادة المحترمون،\n\nالسلام عليكم ورحمة الله وبركاته.\n\nأثناء استخدام تطبيق "نور الإسلامي (دين تايم)" واجهتني المشكلة التالية:\n\nوصف المشكلة:\n(يرجى كتابة مشكلتك هنا بالتفصيل)\n\nأرجو التكرم بالنظر في الأمر ومعالجته في أقرب وقت ممكن.\n\nجزاكم الله خيراً.\n\nمقدّم الطلب،\nالاسم: (اكتب اسمك هنا)\n' },
    ur: { title: 'سیٹنگز', subtitle: 'ایپ کو اپنی پسند کے مطابق بنائیں', back: 'واپس', secLook: 'ظاہری شکل اور زبان', lang: 'زبان', theme: 'تھیم', themeDark: '🌙 ڈارک', themeLight: '☀️ لائٹ', themeSystem: '📱 سسٹم', color: 'نمایاں رنگ',
      secData: 'ڈیٹا اور بیک اپ', export: '⬇ بیک اپ لیں', import: '⬆ بحال کریں', share: '🔗 ایپ شیئر کریں', danger: 'خطرناک حصہ', resetTracker: 'نماز کا ریکارڈ مٹائیں', resetAll: 'تمام سیٹنگز ری سیٹ',
      secContact: 'رابطہ', email: 'ای میل', copy: 'کاپی', phone: 'موبائل', phoneSoon: 'جلد شامل ہوگا', sendMail: '✉️ ای میل بھیجیں', report: '🐞 مسئلہ / مشورہ بھیجیں',
      contactNote: 'اگر آپ کو اس ایپ میں کوئی خرابی یا مسئلہ نظر آئے، یا کوئی مشورہ ہو، تو بلا جھجھک ای میل کے ذریعے ہمیں بتائیں۔ آپ کا ایک پیغام ایپ کو مزید بہتر اور درست بنانے میں مدد دیتا ہے۔ 🤍',
      secAbout: 'ایپ کے بارے میں', appName: 'ایپ', version: 'ورژن', dataSrc: 'اوقات کا ماخذ',
      items: ' آئٹمز', copied: 'ای میل کاپی ہو گئی', copyFail: 'کاپی نہیں ہو سکی', exported: 'بیک اپ فائل بن گئی', imported: 'بحالی کامیاب', importFail: 'فائل درست نہیں', shared: 'لنک کاپی ہو گیا',
      confTracker: 'نماز کا تمام ریکارڈ مٹ جائے گا۔ کیا آپ کو یقین ہے؟', confAll: 'تمام سیٹنگز اور ڈیٹا مٹ جائے گا۔ کیا آپ کو یقین ہے؟', done: 'ہو گیا', shareText: 'دین ٹائم — نماز کے اوقات، قرآن اور بہت کچھ',
      mailSubject: 'اسلامی ایپ کے لیے میری تجویز کی درخواست', mailBody: 'محترم جناب،\n\nالسلام علیکم ورحمۃ اللہ وبرکاتہ۔\n\nمیں "اسلامک نور (دین ٹائم)" ایپ کا صارف ہوں۔ میری رائے میں اگر ایپ میں درج ذیل سہولت شامل کر دی جائے تو یہ صارفین کے لیے مزید مفید ہو جائے گی:\n\nمجوزہ سہولت کی تفصیل:\n(یہاں اپنی تجویز تفصیل سے لکھیں)\n\nگزارش ہے کہ اس تجویز پر غور فرما کر جلد از جلد اسے ایپ میں شامل کرنے کا انتظام فرمائیں۔ آپ کی نوازش ہوگی۔\n\nجزاکم اللہ خیراً۔\n\nدرخواست گزار،\nنام: (یہاں اپنا نام لکھیں)\n', repSubject: 'اسلامک نور ایپ — مسئلے کے حل کی درخواست', repBody: 'محترم جناب،\n\nالسلام علیکم ورحمۃ اللہ وبرکاتہ۔\n\n"اسلامک نور (دین ٹائم)" ایپ کے استعمال کے دوران مجھے درج ذیل مسئلہ پیش آیا ہے:\n\nمسئلے کی تفصیل:\n(براہِ کرم اپنا مسئلہ یہاں تفصیل سے لکھیں)\n\nگزارش ہے کہ اس معاملے کو دیکھ کر جلد از جلد حل فرما دیں۔\n\nجزاکم اللہ خیراً۔\n\nدرخواست گزار،\nنام: (یہاں اپنا نام لکھیں)\n' },
    hi: { title: 'सेटिंग्स', subtitle: 'ऐप को अपने अनुसार सजाएँ', back: 'वापस', secLook: 'रूप और भाषा', lang: 'भाषा', theme: 'थीम', themeDark: '🌙 डार्क', themeLight: '☀️ लाइट', themeSystem: '📱 सिस्टम', color: 'एक्सेंट रंग',
      secData: 'डेटा और बैकअप', export: '⬇ बैकअप लें', import: '⬆ रीस्टोर करें', share: '🔗 ऐप शेयर करें', danger: 'खतरनाक क्षेत्र', resetTracker: 'नमाज़ का रिकॉर्ड मिटाएँ', resetAll: 'सभी सेटिंग्स रीसेट',
      secContact: 'संपर्क', email: 'ईमेल', copy: 'कॉपी', phone: 'मोबाइल', phoneSoon: 'जल्द जोड़ा जाएगा', sendMail: '✉️ ईमेल भेजें', report: '🐞 समस्या / सुझाव भेजें',
      contactNote: 'इस ऐप में कोई खामी या समस्या दिखे, या आपका कोई सुझाव हो, तो बेझिझक ईमेल के ज़रिए हमें बताएँ। आपका एक संदेश ऐप को और बेहतर व सटीक बनाने में मदद करता है। 🤍',
      secAbout: 'ऐप के बारे में', appName: 'ऐप', version: 'संस्करण', dataSrc: 'समय का स्रोत',
      items: ' आइटम', copied: 'ईमेल कॉपी हो गया', copyFail: 'कॉपी नहीं हो सका', exported: 'बैकअप फ़ाइल बन गई', imported: 'रीस्टोर सफल', importFail: 'फ़ाइल सही नहीं है', shared: 'लिंक कॉपी हो गया',
      confTracker: 'नमाज़ का सारा रिकॉर्ड मिट जाएगा। क्या आप निश्चित हैं?', confAll: 'सभी सेटिंग्स और डेटा मिट जाएगा। क्या आप निश्चित हैं?', done: 'हो गया', shareText: 'दीन टाइम — नमाज़ के समय, क़ुरआन और बहुत कुछ',
      mailSubject: 'इस्लामिक ऐप के लिए मेरे सुझाव का आवेदन', mailBody: 'आदरणीय महोदय/महोदया,\n\nअस्सलामु अलैकुम।\n\nमैं "इस्लामिक नूर (दीन टाइम)" ऐप का उपयोगकर्ता हूँ। मेरा मानना है कि ऐप में निम्नलिखित सुविधा जोड़ी जाए तो यह उपयोगकर्ताओं के लिए और भी उपयोगी होगा:\n\nप्रस्तावित सुविधा का विवरण:\n(यहाँ अपना सुझाव विस्तार से लिखें)\n\nआपसे विनम्र अनुरोध है कि इस सुझाव पर विचार कर इसे शीघ्र ऐप में जोड़ने की व्यवस्था करें। आपकी बड़ी कृपा होगी।\n\nजज़ाकल्लाहु ख़ैरन।\n\nविनीत,\nनाम: (यहाँ अपना नाम लिखें)\n', repSubject: 'इस्लामिक नूर ऐप — समस्या समाधान हेतु आवेदन', repBody: 'आदरणीय महोदय/महोदया,\n\nअस्सलामु अलैकुम।\n\n"इस्लामिक नूर (दीन टाइम)" ऐप के उपयोग के दौरान मुझे निम्नलिखित समस्या का सामना करना पड़ा है:\n\nसमस्या का विवरण:\n(कृपया अपनी समस्या यहाँ विस्तार से लिखें)\n\nआपसे विनम्र अनुरोध है कि इस विषय को देखकर शीघ्र समाधान करें।\n\nजज़ाकल्लाहु ख़ैरन।\n\nआवेदक,\nनाम: (यहाँ अपना नाम लिखें)\n' }
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

  var lang = 'bn';
  try { if (typeof LANG !== 'undefined' && LANG) lang = LANG; else lang = store(KEYS.lang) || 'bn'; } catch (e) { lang = store(KEYS.lang) || 'bn'; }
  if (!LANG_LIST.some(function (x) { return x.id === lang; })) lang = LANG_LIST[0].id;
  var theme = store(KEYS.theme) || 'dark';
  var color = store(KEYS.color) || 'teal';
  if (!COLORS[color]) color = 'teal';

  function dict() { return T[lang] || T.en; }
  function t(k) { return dict()[k] || T.en[k] || ''; }

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
    var d = dict();
    document.querySelectorAll('[data-k]').forEach(function (el) {
      var v = d[el.getAttribute('data-k')];
      if (v !== undefined) el.textContent = v;
    });
    var back = $('backBtn'); if (back) back.setAttribute('aria-label', t('back'));
    document.title = t('title') + ' - ' + (lang === 'bn' ? 'দ্বীন টাইম' : 'Deen Time');
    updateColorName();
    buildMailLinks();
  }

  function chooseLang(id, silent) {
    var L = LANG_LIST.filter(function (x) { return x.id === id; })[0] || LANG_LIST[0];
    lang = L.id;
    /* অ্যাপের আসল ভাষা-ফাংশন (i18n.js) — এতে সব পেজে ভাষা বদলে যায় */
    var used = false;
    if (!silent) { try { if (typeof setLang === 'function') { setLang(lang); used = true; } } catch (e) { console.warn('setLang failed', e); } }
    if (silent) used = true;
    if (!used) store(KEYS.lang, lang);
    doc.lang = lang;
    doc.dir = L.dir;
    document.body.classList.toggle('rtl', L.dir === 'rtl');
    renderLang();
    applyLangText();
    renderTheme();
    try { window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } })); } catch (e) {}
  }

  function renderLang() {
    var box = $('langGrid');
    var cur = LANG_LIST.filter(function (x) { return x.id === lang; })[0];
    var open = box.classList.contains('open');
    var h = '<button type="button" class="lang-current" id="langBtn" aria-haspopup="listbox" aria-expanded="' + open + '">' +
      '<span class="flag">' + cur.flag + '</span><span class="lang-name">' + cur.name + '</span><span class="chev" aria-hidden="true">▾</span></button>' +
      '<div class="lang-menu" id="langMenu" role="listbox"' + (open ? '' : ' hidden') + '>';
    LANG_LIST.forEach(function (L) {
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
    updateMeta();
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
  function applyColor() {
    /* style.css এর body[data-color=...] ও body.dark[data-color=...] নিয়ম ব্যবহার করে — লাইট ও ডার্ক দুই মোডেই সঠিক রঙ আসে */
    document.body.dataset.color = color;
    doc.style.removeProperty('--accent');
    doc.style.removeProperty('--accent-l');
    updateMeta();
  }
  function updateMeta() {
    var m = document.querySelector('meta[name=theme-color]');
    if (m) m.setAttribute('content', document.body.classList.contains('dark') ? '#0b2428' : COLORS[color].c);
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
    $('mailBtn').href = mailto(t('mailSubject'), t('mailBody'));
    $('reportBtn').href = mailto(t('repSubject'), t('repBody'));
    $('emailLink').href = 'mailto:' + EMAIL;
  }

  /* ---------- ইভেন্ট ---------- */
  function bind() {
    $('langGrid').addEventListener('click', function (e) {
      var opt = e.target.closest('.lang-opt');
      if (opt) { $('langGrid').classList.remove('open'); chooseLang(opt.getAttribute('data-l')); return; }
      if (e.target.closest('#langBtn')) toggleLangMenu();
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('#langGrid')) { var m = $('langMenu'); if (m && !m.hidden) toggleLangMenu(false); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var m = $('langMenu'); if (m && !m.hidden) { toggleLangMenu(false); $('langBtn').focus(); } } });

    $('themeRow').addEventListener('click', function (e) { var b = e.target.closest('.theme-opt'); if (b) setTheme(b.getAttribute('data-theme')); });
    $('colorDots').addEventListener('click', function (e) { var d = e.target.closest('.dot'); if (d) setColor(d.getAttribute('data-c')); });

    $('copyEmailBtn').addEventListener('click', function () { copyText(EMAIL, t('copied')); });
  }

  function safe(fn) { try { fn(); } catch (err) { console.error('settings:', err); } }
  function init() {
    safe(function () { var v = $('appVer'); if (v) v.textContent = VERSION; });
    safe(bind);
    safe(applyTheme); safe(applyColor);
    safe(function () { chooseLang(lang, true); });
    safe(renderTheme); safe(renderColor);
  }

  init();
  window.addEventListener('load', function () { applyLangText(); renderTheme(); });
})();
