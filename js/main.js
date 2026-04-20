// js/main.js
let prayerTimes = [];
let currentPrayerIndex = -1;

const defaultPrayerTimesData = {
  timings: {
    Fajr: "04:16",
    Dhuhr: "12:10",
    Asr: "15:31",
    Maghrib: "18:21",
    Isha: "19:45"
  }
};

// Prayer name mapping: API index → Bangla name (must match pill data-prayer)
const PRAYER_NAMES_BN = ["ফজর", "জোহর", "আসর", "মাগরিব", "ইশা"];
const PRAYER_KEYS     = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

async function fetchPrayerTimes() {
  try {
    showLoading(true);
    const response = await fetch(
      'https://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh&method=4'
    );
    const data = await response.json();

    if (data.code === 200 && data.data) {
      const timings = data.data.timings;
      const date    = data.data.date;

      // ── Hijri & Gregorian date ──────────────────────────────────────────────
      document.getElementById('hijriDate').innerText =
        `${date.hijri.day} ${date.hijri.month.en} ${date.hijri.year}`;
      document.getElementById('gregorianDate').innerText =
        `${date.gregorian.day} ${date.gregorian.month.en} ${date.gregorian.year}`;

      // ── Build prayer times array ────────────────────────────────────────────
      prayerTimes = PRAYER_KEYS.map((key, i) => ({
        name: PRAYER_NAMES_BN[i],
        time: parseTimeToMinutes(timings[key]),
        rawTime: timings[key]
      }));

      // ── Sehri / Iftar ───────────────────────────────────────────────────────
      document.getElementById('sehriVal').innerText  = formatTimeDisplay(timings.Fajr);
      document.getElementById('iftarVal').innerText  = formatTimeDisplay(timings.Maghrib);

      // ── City name in settings modal ─────────────────────────────────────────
      // API returns city inside meta, not data.data.city
      const cityEl = document.getElementById('modalCityName');
      if (cityEl) {
        const cityName =
          (data.data.meta && data.data.meta.latitude)
            ? 'ঢাকা'          // aladhan doesn't return Bengali city; keep default
            : 'ঢাকা';
        cityEl.innerText = cityName;
      }
    }
  } catch (error) {
    console.error('API Error:', error);
    // ── Fallback ────────────────────────────────────────────────────────────
    prayerTimes = PRAYER_KEYS.map((key, i) => ({
      name:    PRAYER_NAMES_BN[i],
      time:    parseTimeToMinutes(defaultPrayerTimesData.timings[key]),
      rawTime: defaultPrayerTimesData.timings[key]
    }));
    document.getElementById('sehriVal').innerText =
      formatTimeDisplay(defaultPrayerTimesData.timings.Fajr);
    document.getElementById('iftarVal').innerText =
      formatTimeDisplay(defaultPrayerTimesData.timings.Maghrib);

    showToast('⚠️ ডিফল্ট সময় ব্যবহার করা হচ্ছে');
  }
  showLoading(false);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    const m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (m) {
      let h = parseInt(m[1]), min = parseInt(m[2]);
      const p = m[3].toUpperCase();
      if (p === 'PM' && h !== 12) h += 12;
      if (p === 'AM' && h === 12) h = 0;
      return h * 60 + min;
    }
  }
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  return 0;
}

function formatTimeDisplay(timeStr) {
  if (!timeStr) return '--:-- --';
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    const m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (m) return `${m[1]}:${m[2]} ${m[3]}`;
    return timeStr;
  }
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    let h = parseInt(parts[0]);
    const min = parseInt(parts[1]);
    const period = h >= 12 ? 'PM' : 'AM';
    const dh = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    return `${dh}:${min.toString().padStart(2, '0')} ${period}`;
  }
  return '--:-- --';
}

// ── Display update (runs every second) ───────────────────────────────────────

function updateDisplay() {
  if (prayerTimes.length === 0) return;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let current = -1;
  let next    = -1;

  for (let i = 0; i < prayerTimes.length; i++) {
    if (currentMinutes >= prayerTimes[i].time) current = i;
    if (next === -1 && currentMinutes < prayerTimes[i].time) next = i;
  }

  if (next    === -1) next    = 0;
  if (current === -1) current = prayerTimes.length - 1;

  currentPrayerIndex = current;

  // ── Current prayer header ─────────────────────────────────────────────────
  const cp = prayerTimes[current];
  document.getElementById('currentPrayerName').innerText = cp.name;

  const ph = Math.floor(cp.time / 60);
  const pm = cp.time % 60;
  const pp = ph >= 12 ? 'PM' : 'AM';
  const pd = ph > 12 ? ph - 12 : (ph === 0 ? 12 : ph);
  document.getElementById('currentPrayerTimeDisplay').innerHTML =
    `${pd}:${pm.toString().padStart(2, '0')} <sub>${pp}</sub>`;

  // ── Countdown to next prayer ──────────────────────────────────────────────
  const np = prayerTimes[next];
  let nextMin = np.time;
  if (nextMin <= currentMinutes) nextMin += 24 * 60;

  const diff    = nextMin - currentMinutes;
  const hours   = Math.floor(diff / 60);
  const minutes = diff % 60;
  // seconds for more accuracy
  const seconds = 59 - now.getSeconds();

  const remainingEl = document.getElementById('remainingTimeDisplay');
  if (hours > 0) {
    remainingEl.innerHTML =
      `⏱ ${np.name} পর্যন্ত ${hours} ঘণ্টা ${minutes} মিনিট ${seconds} সেকেন্ড বাকি`;
  } else {
    remainingEl.innerHTML =
      `⏱ ${np.name} পর্যন্ত ${minutes} মিনিট ${seconds} সেকেন্ড বাকি`;
  }

  updateTrackerActiveState(current);
}

// ── Pill active state ─────────────────────────────────────────────────────────

function updateTrackerActiveState(currentIndex) {
  document.querySelectorAll('.pill').forEach((pill, index) => {
    // Only change 'active' state; never override 'done' or 'missed'
    if (pill.classList.contains('done') || pill.classList.contains('missed')) return;
    pill.classList.remove('active', 'pending');
    pill.classList.add(index === currentIndex ? 'active' : 'pending');
  });
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function updateProgress() {
  const pills = document.querySelectorAll('.pill');
  let completed = 0;
  pills.forEach(pill => { if (pill.classList.contains('done')) completed++; });
  const percent = (completed / 5) * 100;
  const pbar  = document.getElementById('pbar');
  const label = document.getElementById('progressPercentLabel');
  if (pbar)  pbar.style.width = percent + '%';
  if (label) label.innerText  = `${Math.round(percent)}% সম্পন্ন`;
}

// ── Pill click events ─────────────────────────────────────────────────────────

function attachPillEvents() {
  document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      // Don't toggle the currently active (in-progress) prayer
      if (pill.classList.contains('active')) return;

      if (pill.classList.contains('done')) {
        pill.classList.remove('done');
        pill.classList.add('pending');
        pill.querySelector('.check').innerHTML = '—';
      } else {
        pill.classList.remove('pending', 'missed');
        pill.classList.add('done');
        pill.querySelector('.check').innerHTML = '✓';
      }
      updateProgress();
    });
  });
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function showLoading(show) {
  let loader = document.getElementById('customLoader');
  if (show) {
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'customLoader';
      loader.style.cssText =
        'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
        'background:rgba(0,0,0,0.85);color:white;padding:12px 24px;' +
        'border-radius:40px;z-index:9999;font-size:14px;' +
        'font-family:Poppins,sans-serif;font-weight:500;';
      loader.innerText = '⏳ সময় লোড হচ্ছে...';
      document.body.appendChild(loader);
    }
    loader.style.display = 'block';
  } else {
    if (loader) loader.style.display = 'none';
  }
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.innerText = msg;
  toast.style.cssText =
    'position:fixed;bottom:88px;left:50%;transform:translateX(-50%);' +
    'background:rgba(0,0,0,0.85);color:#fff;padding:10px 22px;' +
    'border-radius:40px;font-size:13px;z-index:9999;' +
    'font-weight:500;font-family:Poppins,sans-serif;' +
    'opacity:1;transition:opacity 0.3s;white-space:nowrap;';
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 1600);
}

// ── Dark mode ─────────────────────────────────────────────────────────────────

function setTheme(mode) {
  const body = document.body;
  if (mode === 'dark') {
    body.classList.add('dark');
  } else if (mode === 'light') {
    body.classList.remove('dark');
  } else if (mode === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    prefersDark ? body.classList.add('dark') : body.classList.remove('dark');
  }
  localStorage.setItem('deenTheme', mode);

  // Sync buttons
  document.querySelectorAll('.darkmode-option').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
  });
}

function initDarkMode() {
  const saved = localStorage.getItem('deenTheme') || 'light';
  setTheme(saved);

  document.querySelectorAll('.darkmode-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode');
      setTheme(mode);
      const msgs = {
        dark:   '🌙 ডার্ক মোড সক্রিয়',
        light:  '☀️ লাইট মোড সক্রিয়',
        system: '📱 সিস্টেম থিম অনুসরণ করা হবে'
      };
      showToast(msgs[mode] || '');
    });
  });

  // Auto-switch if system mode and OS preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (localStorage.getItem('deenTheme') === 'system') setTheme('system');
  });
}

// ── Settings modal ────────────────────────────────────────────────────────────

function initSettingsModal() {
  const settingsBtn     = document.getElementById('settingsBtn');
  const settingsModal   = document.getElementById('settingsModal');
  const closeSettingsBtn= document.getElementById('closeSettingsBtn');
  const notifToggle     = document.getElementById('modalNotificationToggle');
  const mosqueSelect    = document.getElementById('mosqueSelect');

  settingsBtn.addEventListener('click', () => settingsModal.classList.add('show'));
  closeSettingsBtn.addEventListener('click', () => settingsModal.classList.remove('show'));
  settingsModal.addEventListener('click', e => {
    if (e.target === settingsModal) settingsModal.classList.remove('show');
  });
  notifToggle.addEventListener('click', () =>
    showToast('🔔 নোটিফিকেশন সেটিংস শীঘ্রই আসছে')
  );
  mosqueSelect.addEventListener('change', e =>
    showToast(`🕌 ${e.target.options[e.target.selectedIndex].text} নির্বাচিত হয়েছে`)
  );
}

// ── Icon & nav buttons ────────────────────────────────────────────────────────

function initEventListeners() {
  document.querySelectorAll('.icon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name') || 'বৈশিষ্ট্য';
      showToast(`✨ ${name} শীঘ্রই আসছে`);
    });
  });

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const label = item.querySelector('.nav-label')?.innerText || 'পৃষ্ঠা';
      showToast(`🔹 ${label} বিভাগ শীঘ্রই আসছে`);
    });
  });
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  initDarkMode();         // theme first — avoids flash of wrong mode
  await fetchPrayerTimes();
  updateDisplay();
  updateProgress();
  attachPillEvents();
  initSettingsModal();
  initEventListeners();
  setInterval(updateDisplay, 1000);
});