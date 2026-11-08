<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0d9488">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="manifest" href="manifest.json">
<title>দ্বীন টাইম - নামাজের সময়সূচি</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800&family=Noto+Sans+Arabic:wght@400;600;700&family=Noto+Nastaliq+Urdu:wght@400;700&family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/app.css">
</head>
<body data-page="home">
<div class="app-container">

  <div class="topbar fade-in">
    <div><div class="hello" data-i18n="greet">আসসালামু আলাইকুম 👋</div><div class="hijri" id="settingsHijriDate">হিজরি তারিখ</div></div>
    <button class="round-btn" id="topSettingsBtn" aria-label="সেটিংস">⚙️</button>
  </div>

  <div class="header-card fade-in">
    <div class="header-top">
      <div class="prayer-state-chip" id="prayerStateChip"><div class="state-dot"></div><span id="prayerStateTxt">অপেক্ষা</span></div>
      <div class="greg-date-header" id="gregDateText">লোড হচ্ছে...</div>
    </div>
    <div class="header-main">
      <div>
        <div class="prayer-name-bn" id="activePrayerName">ফজর</div>
        <div class="prayer-time-big">শুরু: <b id="currentPrayerStartTime">--:--</b></div>
        <div class="prayer-time-big">শেষ: <b id="currentPrayerEndTime">--:--</b></div>
        <div class="city-line">📍 <span id="cityLabel">ঢাকা</span></div>
      </div>
      <div class="header-timer">
        <svg viewBox="0 0 110 110">
          <circle class="timer-bg-circle" cx="55" cy="55" r="48" stroke-width="6"/>
          <circle id="timerProgressCircle" class="timer-progress-circle" cx="55" cy="55" r="48" stroke-width="6"/>
        </svg>
        <div class="timer-overlay"><div class="timer-countdown" id="timerCountdownText">--:--:--</div><div class="timer-sublabel" id="timerSublabel" data-i18n="pending">বাকি</div></div>
      </div>
    </div>
  </div>

  <!-- নামাজের সময়ের স্ক্রল বার: আইকন + নাম + সময় -->
  <div class="pbar fade-in" id="prayerBar"></div>

  <div class="glass-card fade-in"><div class="card-header"><div class="card-title">🕐 <span data-i18n="times">আজকের সময়সূচি</span></div></div><div id="timesList"></div></div>

  <div class="section-head fade-in"><div class="section-head-title" data-i18n="quick">দ্রুত অ্যাকশন</div></div>
  <div class="actions-grid fade-in">
    <a href="salah.html" class="action-item"><div class="icon-wrap"><img src="image/salah.png" alt=""></div><span class="action-label" data-i18n="salah">নামাজ</span></a>
    <a href="qibla.html" class="action-item"><div class="icon-wrap"><img src="image/compass.png" alt=""></div><span class="action-label" data-i18n="qibla">কিবলা</span></a>
    <a href="asmaul-husna.html" class="action-item"><div class="icon-wrap"><img src="image/asmaul_husna.png" alt=""></div><span class="action-label" data-i18n="asma">আসমাউল হুসনা</span></a>
    <a href="arabiseducation.html" class="action-item"><div class="icon-wrap" style="font-size:1.5rem">🔤</div><span class="action-label" data-i18n="arabic">আরবি শিক্ষা</span></a>
    <a href="oju.html" class="action-item"><div class="icon-wrap"><img src="image/oju.png" alt=""></div><span class="action-label" data-i18n="wudu">অজু</span></a>
    <a href="masjid.html" class="action-item"><div class="icon-wrap"><img src="image/mosjid.png" alt=""></div><span class="action-label" data-i18n="masjid">মসজিদ</span></a>
  </div>

  <div class="glass-card fade-in">
    <div class="card-header"><div class="card-title" data-i18n="today">🕌 আজকের নামাজ</div><div class="card-badge" id="trackerTotalCount">০/৫</div></div>
    <div class="progress-track"><div class="progress-bar" id="progressFillBar"></div></div>
    <div class="prayers-row" id="prayersRowContainer"></div>
  </div>

  <div class="glass-card fade-in">
    <div class="card-header"><div class="card-title" data-i18n="weekly">📅 সাপ্তাহিক নামাজ</div><div class="card-badge" id="weekCalRange">...</div></div>
    <div class="week-strip" id="weekDaysStrip"></div>
  </div>

  <div class="glass-card fade-in">
    <div class="card-header"><div class="card-title" data-i18n="stats">📊 সাপ্তাহিক পরিসংখ্যান</div><div class="card-badge" id="statsRange">...</div></div>
    <div class="stats-grid">
      <div class="stat-box"><div class="stat-icon-wrap">🔥</div><div><div class="stat-value" id="streakCount">০</div><div class="stat-label" data-i18n="streak">ধারাবাহিকতা (দিন)</div></div></div>
      <div class="stat-box"><div class="stat-icon-wrap">📈</div><div><div class="stat-value" id="weeklyProgress">০%</div><div class="stat-label" data-i18n="progress">সপ্তাহের অগ্রগতি</div></div></div>
      <div class="stat-box"><div class="stat-icon-wrap">✅</div><div><div class="stat-value" id="totalCompleted">০</div><div class="stat-label" data-i18n="weekDone">এই সপ্তাহে আদায়</div></div></div>
      <div class="stat-box"><div class="stat-icon-wrap">🎯</div><div><div class="stat-value" id="todayDone">০/৫</div><div class="stat-label" data-i18n="goal">আজকের লক্ষ্য</div></div></div>
    </div>
  </div>

  <div class="glass-card fade-in"><div class="card-header"><div class="card-title">📖 <span data-i18n="dayAyah">আজকের আয়াত</span></div></div><div id="dailyAyah" class="muted">...</div></div>
  <div class="glass-card fade-in"><div class="card-header"><div class="card-title">📜 <span data-i18n="dayHadith">আজকের হাদিস</span></div></div><div id="dailyHadith" class="muted">...</div></div>
  <div class="glass-card fade-in"><div class="card-header"><div class="card-title">🏅 <span data-i18n="badges">অর্জন</span></div></div><div class="badge-row" id="badges"></div></div>
</div>

<div class="modal-overlay" id="settingsModal">
  <div class="modal-sheet">
    <div class="sheet-handle"></div>
    <button class="sheet-close" id="closeModalBtn">✕</button>
    <div class="sheet-title">⚙️ <span data-i18n="settings">সেটিংস</span></div>
    <div class="setting-section"><div class="setting-label">🌐 <span data-i18n="language">ভাষা</span></div><div class="lang-grid" id="langGrid"></div></div>
    <div class="setting-section"><div class="setting-label" data-i18n="theme">🌙 থিম</div>
      <div class="theme-row">
        <button class="theme-opt" data-theme="light" data-i18n="light">☀️ লাইট</button>
        <button class="theme-opt" data-theme="dark" data-i18n="dark">🌙 ডার্ক</button>
        <button class="theme-opt" data-theme="system" data-i18n="system">📱 সিস্টেম</button>
      </div></div>
    <div class="setting-section"><div class="setting-label" data-i18n="city">📍 শহর</div>
      <select id="citySelect" class="city-select"></select></div>
    <div class="setting-section"><button class="btn ghost" id="gpsBtn" data-i18n="gps" style="width:100%">📍</button></div>
    <div class="setting-section"><div class="setting-label">🕋 <span data-i18n="madhab">মাযহাব</span></div><select id="schoolSel" class="city-select"><option value="1" data-i18n="hanafi">হানাফি</option><option value="0" data-i18n="shafi">শাফিয়ি</option></select></div>
    <div class="setting-section"><div class="setting-label">🔔 <span data-i18n="notify">নোটিফিকেশন</span></div>
      <select id="adhanSel" class="city-select"><option value="off" data-i18n="nOff">বন্ধ</option><option value="beep" data-i18n="nBeep">বিপ</option><option value="file" data-i18n="nAdhan">আযান</option></select>
      <div class="setting-label" style="margin-top:10px" data-i18n="remind">রিমাইন্ডার</div>
      <select id="remindSel" class="city-select"><option value="0">—</option><option value="5">5</option><option value="10">10</option><option value="15">15</option><option value="30">30</option></select></div>
    <div class="setting-section"><div class="setting-label">🎨 <span data-i18n="accent">রঙ</span></div><div class="dots" id="colorRow">
      <div class="dot" data-c="teal" style="background:#0d9488"></div><div class="dot" data-c="green" style="background:#16a34a"></div><div class="dot" data-c="blue" style="background:#0284c7"></div><div class="dot" data-c="peach" style="background:#ea580c"></div></div></div>
    <div class="setting-section"><div class="setting-label">💾 <span data-i18n="backup">ব্যাকআপ</span></div><div class="row">
      <button class="btn ghost" id="exportBtn" data-i18n="exportB">নিন</button><button class="btn ghost" id="importBtn" data-i18n="importB">রিস্টোর</button><button class="btn ghost" id="shareBtn" data-i18n="shareB">শেয়ার</button></div>
      <input type="file" id="importFile" accept=".json" hidden></div>

  </div>
</div>

<div class="modal-overlay" id="recordModal">
  <div class="modal-sheet">
    <div class="sheet-handle"></div>
    <div class="record-header">
      <div><div class="record-day-name" id="recordModalDayName">--</div><div class="record-done-count" id="recordModalCount">০/৫ সম্পন্ন</div></div>
      <button class="sheet-close" id="recordCloseBtn">✕</button>
    </div>
    <div class="record-list" id="recordPrayerList"></div>
    <div class="legend">
      <span class="legend-item"><span class="legend-dot done"></span> <span data-i18n="done">আদায়</span></span>
      <span class="legend-item"><span class="legend-dot missed"></span> <span data-i18n="qaza">কাযা</span></span>
      <span class="legend-item"><span class="legend-dot pending"></span> <span data-i18n="pending">বাকি</span></span>
    </div>
  </div>
</div>

<script src="js/i18n.js"></script>
<script src="js/i18n-extra.js"></script>
<script src="js/reminders.js"></script>
<script src="js/main.js"></script>
<script src="js/nav.js"></script>
<script>
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(()=>{}));
</script>
</body>
</html>
