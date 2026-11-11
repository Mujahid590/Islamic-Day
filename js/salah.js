// ========== SALAH & CUSTOM ALERT SCRIPT ==========
document.addEventListener('DOMContentLoaded', () => {
  // ১. সেটিংসের থিম, রঙ ও ভাষা সিঙ্ক করা (হোম, কিবলা ও মসজিদ পেজের মতো)
  const savedTheme = localStorage.getItem('deen_theme') || 'system';
  const savedColor = localStorage.getItem('deen_color') || 'teal';
  
  if (savedTheme === 'dark' || (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
  
  if (savedColor) {
    document.body.setAttribute('data-color', savedColor);
  }

  // ২. আযান ও সাউন্ড টেস্ট ফিচার
  const testSoundBtn = document.getElementById('testSoundBtn');
  const prayerSoundSelect = document.getElementById('prayerSoundSelect');
  const alertStatusBadge = document.getElementById('alertStatusBadge');
  const toggleAlertsBtn = document.getElementById('toggleAlertsBtn');

  let alertsEnabled = localStorage.getItem('deen_alerts') !== 'false';
  updateAlertBadge();

  function playAudioAlert() {
    if (!alertsEnabled) return;
    // ব্রাউজারের ওয়েব অডিও API দিয়ে সুন্দর রিমাইন্ডার টোন বা আযানের সিগন্যাল বাজানো
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.log("Audio not supported");
    }
  }

  testSoundBtn.addEventListener('click', () => {
    playAudioAlert();
    alert("🔊 সাউন্ড টেস্ট সফল হয়েছে! ওয়াক্তের সময় এই সাউন্ড বাজবে।");
  });

  toggleAlertsBtn.addEventListener('click', () => {
    alertsEnabled = !alertsEnabled;
    localStorage.setItem('deen_alerts', alertsEnabled);
    updateAlertBadge();
  });

  function updateAlertBadge() {
    if (alertsEnabled) {
      alertStatusBadge.textContent = "সক্রিয়";
      alertStatusBadge.style.color = "var(--done)";
    } else {
      alertStatusBadge.textContent = "বন্ধ";
      alertStatusBadge.style.color = "var(--missed)";
    }
  }

  // ৩. মনমতো সময় দিয়ে কাস্টম অ্যালার্ট সেভ করা
  const saveCustomAlertBtn = document.getElementById('saveCustomAlertBtn');
  const customPrayerSelect = document.getElementById('customPrayerSelect');
  const customTimeInput = document.getElementById('customTimeInput');

  // লোড করা পুরনো কাস্টম সেটিংস
  const savedCustomAlerts = JSON.parse(localStorage.getItem('deen_custom_alerts') || '{}');
  if (customPrayerSelect && customTimeInput) {
    customPrayerSelect.addEventListener('change', () => {
      const prayer = customPrayerSelect.value;
      if (savedCustomAlerts[prayer] !== undefined) {
        customTimeInput.value = savedCustomAlerts[prayer];
      }
    });
  }

  saveCustomAlertBtn.addEventListener('click', () => {
    const prayer = customPrayerSelect.value;
    const minutes = customTimeInput.value;
    savedCustomAlerts[prayer] = minutes;
    localStorage.setItem('deen_custom_alerts', JSON.stringify(savedCustomAlerts));
    alert(`✅ ${customPrayerSelect.options[customPrayerSelect.selectedIndex].text} ওয়াক্তের জন্য ${minutes} মিনিট আগের কাস্টম অ্যালার্ট সফলভাবে সেভ হয়েছে!`);
  });

  // ৪. সালাহ ট্র্যাকার রেন্ডার
  const salahList = document.getElementById('salahList') || document.getElementById('salahTrackerList');
  const salahs = [
    { id: 'fajr', name: 'ফজর' },
    { id: 'dhuhr', name: 'যোহর' },
    { id: 'asr', name: 'আসর' },
    { id: 'maghrib', name: 'মাগরিব' },
    { id: 'isha', name: 'ইশা' }
  ];

  const todayKey = new Date().toISOString().split('T')[0];
  let trackerData = JSON.parse(localStorage.getItem(`deen_tracker_${todayKey}`) || '{}');

  function renderTracker() {
    if (!salahList) return;
    let completedCount = 0;

    salahList.innerHTML = salahs.map(p => {
      const status = trackerData[p.id] || 'pending';
      if (status === 'done') completedCount++;

      return `
        <div class="record-row">
          <div class="record-row-left">
            <span style="font-size:1.2rem;">🕌</span>
            <span class="record-row-name">${p.name}</span>
          </div>
          <div class="rec-btns">
            <button type="button" class="rec-btn ${status === 'done' ? 'done-active' : ''}" onclick="setSalahStatus('${p.id}', 'done')">আদায়</button>
            <button type="button" class="rec-btn ${status === 'missed' ? 'missed-active' : ''}" onclick="setSalahStatus('${p.id}', 'missed')">কাযা</button>
            <button type="button" class="rec-btn ${status === 'pending' ? 'pending-active' : ''}" onclick="setSalahStatus('${p.id}', 'pending')">বাকি</button>
          </div>
        </div>
      `;
    }).join('');

    const badge = document.getElementById('salahCountBadge');
    if (badge) badge.textContent = `${completedCount}/৫`;
  }

  window.setSalahStatus = function(prayerId, status) {
    trackerData[prayerId] = status;
    localStorage.setItem(`deen_tracker_${todayKey}`, JSON.stringify(trackerData));
    renderTracker();
  };

  renderTracker();
});
