// ===== বহুভাষা (i18n) : bn / ar / ur / en =====
// অন্য পেজেও ব্যবহার করা যাবে: <script src="js/i18n.js"></script> + data-i18n="key"
const LANGS={
bn:{flag:'🇧🇩',name:'বাংলা',dir:'ltr',digits:'০১২৩৪৫৬৭৮৯',am:'AM',pm:'PM',
 prayers:['ফজর','যোহর','আসর','মাগরিব','ইশা'],
 days:['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার'],
 daysShort:['রবি','সোম','মঙ্গল','বুধ','বৃহ','শুক্র','শনি'],
 months:['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'],
 hijri:['মুহররম','সফর','রবিউল আউয়াল','রবিউস সানি','জমাদিউল আউয়াল','জমাদিউস সানি','রজব','শা\'বান','রমজান','শাওয়াল','জিলকদ','জিলহজ'],
 cities:{Dhaka:'ঢাকা',Chittagong:'চট্টগ্রাম',Sylhet:'সিলেট',Rajshahi:'রাজশাহী',Khulna:'খুলনা',Barisal:'বরিশাল',Rangpur:'রংপুর',Mymensingh:'ময়মনসিংহ',Comilla:'কুমিল্লা'},
 t:{greet:'আসসালামু আলাইকুম 👋',hijriWord:'হিজরি',loading:'লোড হচ্ছে...',waiting:'অপেক্ষা',next:'পরবর্তী: {p}',inTime:'নামাজের সময়',endsIn:'শেষ হতে বাকি',startsIn:'শুরু হতে বাকি',start:'শুরু',end:'শেষ',
 quick:'দ্রুত অ্যাকশন',salah:'নামাজ',qibla:'কিবলা',asma:'আসমাউল হুসনা',arabic:'আরবি শিক্ষা',wudu:'অজু',masjid:'মসজিদ',
 today:'আজকের নামাজ',weekly:'সাপ্তাহিক নামাজ',stats:'সাপ্তাহিক পরিসংখ্যান',streak:'ধারাবাহিকতা (দিন)',progress:'সপ্তাহের অগ্রগতি',weekDone:'এই সপ্তাহে আদায়',goal:'আজকের লক্ষ্য',
 tasbih:'তাসবিহ',quran:'কুরআন',home:'হোম',hadith:'হাদিস',settings:'সেটিংস',theme:'থিম',light:'লাইট',dark:'ডার্ক',system:'সিস্টেম',city:'শহর',language:'ভাষা',
 doneOf:'{x} সম্পন্ন',done:'আদায়',qaza:'কাযা',pending:'বাকি',toastDone:'✅ {p} আদায় হয়েছে',toastMissed:'❌ {p} কাযা',toastPending:'⭕ {p} বাকি'}},
ar:{flag:'🇸🇦',name:'العربية',dir:'rtl',digits:'٠١٢٣٤٥٦٧٨٩',am:'ص',pm:'م',
 prayers:['الفجر','الظهر','العصر','المغرب','العشاء'],
 days:['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'],
 daysShort:['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'],
 months:['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
 hijri:['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'],
 cities:{Dhaka:'دكا',Chittagong:'شيتاغونغ',Sylhet:'سيلهيت',Rajshahi:'راجشاهي',Khulna:'خولنا',Barisal:'باريسال',Rangpur:'رانغبور',Mymensingh:'ميمنسينغ',Comilla:'كوميلا'},
 t:{greet:'السلام عليكم 👋',hijriWord:'هـ',loading:'جارٍ التحميل...',waiting:'انتظار',next:'التالية: {p}',inTime:'وقت الصلاة',endsIn:'المتبقي لانتهائها',startsIn:'المتبقي لبدايتها',start:'البداية',end:'النهاية',
 quick:'إجراءات سريعة',salah:'الصلاة',qibla:'القبلة',asma:'أسماء الله الحسنى',arabic:'تعلّم العربية',wudu:'الوضوء',masjid:'المساجد',
 today:'صلوات اليوم',weekly:'صلوات الأسبوع',stats:'إحصائيات الأسبوع',streak:'أيام متتالية',progress:'تقدّم الأسبوع',weekDone:'المؤدّاة هذا الأسبوع',goal:'هدف اليوم',
 tasbih:'التسبيح',quran:'القرآن',home:'الرئيسية',hadith:'الحديث',settings:'الإعدادات',theme:'المظهر',light:'فاتح',dark:'داكن',system:'النظام',city:'المدينة',language:'اللغة',
 doneOf:'{x} مكتملة',done:'أُدّيت',qaza:'قضاء',pending:'متبقية',toastDone:'✅ تمّت صلاة {p}',toastMissed:'❌ {p} قضاء',toastPending:'⭕ {p} متبقية'}},
ur:{flag:'🇵🇰',name:'اردو',dir:'rtl',digits:'۰۱۲۳۴۵۶۷۸۹',am:'ص',pm:'ش',
 prayers:['فجر','ظہر','عصر','مغرب','عشاء'],
 days:['اتوار','پیر','منگل','بدھ','جمعرات','جمعہ','ہفتہ'],
 daysShort:['اتوار','پیر','منگل','بدھ','جمعرات','جمعہ','ہفتہ'],
 months:['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر'],
 hijri:['محرم','صفر','ربیع الاول','ربیع الثانی','جمادی الاول','جمادی الثانی','رجب','شعبان','رمضان','شوال','ذوالقعدہ','ذوالحجہ'],
 cities:{Dhaka:'ڈھاکہ',Chittagong:'چٹاگانگ',Sylhet:'سلہٹ',Rajshahi:'راجشاہی',Khulna:'کھلنا',Barisal:'باریسال',Rangpur:'رنگپور',Mymensingh:'میمن سنگھ',Comilla:'کومیلا'},
 t:{greet:'السلام علیکم 👋',hijriWord:'ھ',loading:'لوڈ ہو رہا ہے...',waiting:'انتظار',next:'اگلی: {p}',inTime:'نماز کا وقت',endsIn:'ختم ہونے میں باقی',startsIn:'شروع ہونے میں باقی',start:'آغاز',end:'اختتام',
 quick:'فوری عمل',salah:'نماز',qibla:'قبلہ',asma:'اسماء الحسنیٰ',arabic:'عربی تعلیم',wudu:'وضو',masjid:'مساجد',
 today:'آج کی نمازیں',weekly:'ہفتہ وار نماز',stats:'ہفتہ وار اعداد و شمار',streak:'مسلسل دن',progress:'ہفتے کی پیش رفت',weekDone:'اس ہفتے ادا شدہ',goal:'آج کا ہدف',
 tasbih:'تسبیح',quran:'قرآن',home:'ہوم',hadith:'حدیث',settings:'ترتیبات',theme:'تھیم',light:'لائٹ',dark:'ڈارک',system:'سسٹم',city:'شہر',language:'زبان',
 doneOf:'{x} مکمل',done:'ادا',qaza:'قضا',pending:'باقی',toastDone:'✅ {p} ادا ہوئی',toastMissed:'❌ {p} قضا',toastPending:'⭕ {p} باقی'}},
en:{flag:'🇺🇸',name:'English',dir:'ltr',digits:null,am:'AM',pm:'PM',
 prayers:['Fajr','Dhuhr','Asr','Maghrib','Isha'],
 days:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
 daysShort:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
 months:['January','February','March','April','May','June','July','August','September','October','November','December'],
 hijri:['Muharram','Safar','Rabi\' al-Awwal','Rabi\' al-Thani','Jumada al-Awwal','Jumada al-Thani','Rajab','Sha\'ban','Ramadan','Shawwal','Dhu al-Qi\'dah','Dhu al-Hijjah'],
 cities:{Dhaka:'Dhaka',Chittagong:'Chattogram',Sylhet:'Sylhet',Rajshahi:'Rajshahi',Khulna:'Khulna',Barisal:'Barishal',Rangpur:'Rangpur',Mymensingh:'Mymensingh',Comilla:'Cumilla'},
 t:{greet:'Assalamu Alaikum 👋',hijriWord:'AH',loading:'Loading...',waiting:'Waiting',next:'Next: {p}',inTime:'Prayer time',endsIn:'left until it ends',startsIn:'left until it starts',start:'Starts',end:'Ends',
 quick:'Quick Actions',salah:'Salah',qibla:'Qibla',asma:'Asmaul Husna',arabic:'Learn Arabic',wudu:'Wudu',masjid:'Mosques',
 today:'Today\'s Prayers',weekly:'Weekly Prayers',stats:'Weekly Stats',streak:'Day streak',progress:'Weekly progress',weekDone:'Prayed this week',goal:'Today\'s goal',
 tasbih:'Tasbih',quran:'Quran',home:'Home',hadith:'Hadith',settings:'Settings',theme:'Theme',light:'Light',dark:'Dark',system:'System',city:'City',language:'Language',
 doneOf:'{x} completed',done:'Prayed',qaza:'Missed',pending:'Pending',toastDone:'✅ {p} prayed',toastMissed:'❌ {p} missed',toastPending:'⭕ {p} pending'}}
};
let LANG=localStorage.getItem('deen_lang');if(!LANGS[LANG])LANG='bn';
const L=()=>LANGS[LANG];
const t=(k,v)=>{let s=L().t[k]||k;if(v)for(const x in v)s=s.replace('{'+x+'}',v[x]);return s};
const num=n=>{const d=L().digits;return d?String(n).replace(/\d/g,x=>d[x]):String(n)};
const pnOf=bnName=>L().prayers[['ফজর','যোহর','আসর','মাগরিব','ইশা'].indexOf(bnName)];
function applyI18n(){
  const l=L(),h=document.documentElement;h.lang=LANG;h.dir=l.dir;
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
}
function setLang(c){if(!LANGS[c])return;LANG=c;localStorage.setItem('deen_lang',c);applyI18n()}
