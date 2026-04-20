// Prayer times for Dhaka
const prayers = [
  { name: "ফজর", time: [4, 16], done: true },
  { name: "জোহর", time: [12, 10], done: true },
  { name: "আসর",  time: [15, 31], done: false },
  { name: "মাগরিব", time: [18, 21], done: false },
  { name: "ইশা",  time: [19, 45], done: false }
];

// Function to update clock and remaining time
function updateClockAndRemaining() {
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes();
  const totalMins = h * 60 + m;

  let currentPrayer = null;
  let nextPrayer = null;

  for (let i = 0; i < prayers.length; i++) {
    const pMins = prayers[i].time[0] * 60 + prayers[i].time[1];
    if (totalMins >= pMins) currentPrayer = prayers[i];
    if (!nextPrayer && totalMins < pMins) nextPrayer = prayers[i];
  }
  if (!nextPrayer) nextPrayer = prayers[0];

  if (currentPrayer) {
    const currentPrayerNameEl = document.getElementById('currentPrayerName');
    const currentPrayerTimeDisplayEl = document.getElementById('currentPrayerTimeDisplay');
    if (currentPrayerNameEl) currentPrayerNameEl.innerText = currentPrayer.name;
    if (currentPrayerTimeDisplayEl) {
      const hour = currentPrayer.time[0];
      const minute = currentPrayer.time[1];
      const suffix = hour >= 12 ? 'PM' : 'AM';
      const dispHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
      currentPrayerTimeDisplayEl.innerHTML = `${dispHour}:${minute.toString().padStart(2, '0')} <sub>${suffix}</sub>`;
    }
  }

  if (nextPrayer) {
    const nextMins = nextPrayer.time[0] * 60 + nextPrayer.time[1];
    let diff = nextMins - totalMins;
    if (diff < 0) diff += 24 * 60;
    const rh = Math.floor(diff / 60);
    const rm = diff % 60;
    const remainingDisplayEl = document.getElementById('remainingTimeDisplay');
    if (remainingDisplayEl) {
      remainingDisplayEl.innerHTML = `⏱ ${rh > 0 ? rh + ' ঘণ্টা ' : ''}${rm} মিনিট বাকি`;
    }
  }
}

// Function to update progress bar
function updateProgress() {
  const pills = document.querySelectorAll('.pill');
  let completed = 0;
  pills.forEach(pill => {
    if (pill.classList.contains('done')) completed++;
  });
  const percent = (completed / 5) * 100;
  const pbar = document.getElementById('pbar');
  const progressLabel = document.getElementById('progressPercentLabel');
  if (pbar) pbar.style.width = percent + '%';
  if (progressLabel) progressLabel.innerHTML = `${Math.round(percent)}% সম্পন্ন`;
}

// Function to attach pill click events
function attachPillEvents() {
  const pills = document.querySelectorAll('.pill');
  pills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      if (pill.classList.contains('active')) return;
      if (pill.classList.contains('done')) {
        pill.classList.remove('done');
        pill.classList.add('pending');
        const checkSpan = pill.querySelector('.check');
        if (checkSpan) checkSpan.innerHTML = '—';
      } else if (pill.classList.contains('pending') || pill.classList.contains('missed')) {
        pill.classList.remove('pending', 'missed');
        pill.classList.add('done');
        const checkSpan = pill.querySelector('.check');
        if (checkSpan) checkSpan.innerHTML = '✓';
      }
      updateProgress();
    });
  });
}

// Toast notification function
function showToast(msg) {
  let toast = document.createElement('div');
  toast.innerText = msg;
  toast.style.position = 'fixed';
  toast.style.bottom = '80px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.backgroundColor = 'rgba(0,0,0,0.85)';
  toast.style.color = '#fff';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '40px';
  toast.style.fontSize = '13px';
  toast.style.zIndex = '9999';
  toast.style.fontWeight = '500';
  toast.style.fontFamily = "'Poppins', sans-serif";
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.25s';
    setTimeout(() => toast.remove(), 300);
  }, 1500);
}

// Dark mode toggle functionality
function initDarkMode() {
  const savedTheme = localStorage.getItem('deenTheme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  }
  
  // Create dark mode toggle button in bottom nav or somewhere
  const darkModeBtn = document.createElement('div');
  darkModeBtn.className = 'nav-item';
  darkModeBtn.setAttribute('data-nav', 'darkmode');
  darkModeBtn.innerHTML = `
    <span class="nav-icon" id="darkModeIcon">🌙</span>
    <span class="nav-label">ডার্ক</span>
  `;
  
  const bottomNav = document.querySelector('.bottom-nav');
  if (bottomNav && !document.querySelector('[data-nav="darkmode"]')) {
    bottomNav.appendChild(darkModeBtn);
  }
  
  const darkModeToggle = document.getElementById('darkModeIcon') || darkModeBtn;
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      document.body.classList.toggle('dark');
      const isDark = document.body.classList.contains('dark');
      localStorage.setItem('deenTheme', isDark ? 'dark' : 'light');
      const iconSpan = document.querySelector('#darkModeIcon');
      if (iconSpan) {
        iconSpan.innerHTML = isDark ? '☀️' : '🌙';
      }
      const labelSpan = darkModeBtn.querySelector('.nav-label');
      if (labelSpan) {
        labelSpan.innerHTML = isDark ? 'লাইট' : 'ডার্ক';
      }
      showToast(isDark ? '🌙 ডার্ক মোড সক্রিয়' : '☀️ লাইট মোড সক্রিয়');
    });
  }
}

// Add dark mode styles dynamically
function addDarkModeStyles() {
  const style = document.createElement('style');
  style.textContent = `
    body.dark {
      background: #0F172A;
    }
    body.dark .tracker-card,
    body.dark .bottom-nav {
      background: #1F2937;
    }
    body.dark .tracker-card h3,
    body.dark .progress-label {
      color: #9CA3AF;
    }
    body.dark .pill.pending {
      background: #374151;
      color: #9CA3AF;
      border-color: #4B5563;
    }
    body.dark .hadith-card {
      background: linear-gradient(135deg, #1F2937, #111827);
      border-left-color: #4a90c4;
    }
    body.dark .hadith-card .hadith-text {
      color: #E5E7EB;
    }
    body.dark .hadith-card .narrator,
    body.dark .hadith-card .source {
      color: #9CA3AF;
    }
    body.dark .icon-btn .icon-box {
      background: #1F2937;
    }
    body.dark .icon-btn .icon-label {
      color: #9CA3AF;
    }
    body.dark .nav-item.active {
      background: rgba(74,144,196,0.2);
    }
    body.dark .nav-item .nav-label {
      color: #9CA3AF;
    }
    body.dark .nav-item.active .nav-label {
      color: #4a90c4;
    }
  `;
  document.head.appendChild(style);
}

// Initialize all event listeners
function initEventListeners() {
  // Icon buttons click
  const iconBtns = document.querySelectorAll('.icon-btn');
  iconBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name') || 'বৈশিষ্ট্য';
      showToast(`✨ ${name} শীঘ্রই আসছে ✨`);
    });
  });
  
  // Bottom nav items click (excluding dark mode which is handled separately)
  const navItems = document.querySelectorAll('.nav-item:not([data-nav="darkmode"])');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const label = item.querySelector('.nav-label')?.innerText || 'পৃষ্ঠা';
      showToast(`🔹 ${label} বিভাগ শীঘ্রই আসছে`);
    });
  });
  
  // Bell notification button
  const bellBtn = document.getElementById('notificationBtn');
  if (bellBtn) {
    bellBtn.addEventListener('click', () => {
      showToast('🔔 নোটিফিকেশন সেটিংস শীঘ্রই আসছে');
    });
  }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  updateClockAndRemaining();
  setInterval(updateClockAndRemaining, 30000);
  attachPillEvents();
  updateProgress();
  addDarkModeStyles();
  initDarkMode();
  initEventListeners();
});