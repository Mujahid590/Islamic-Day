// ========== TASBIH COUNTER SCRIPT ==========
const tasbihTypes = {
  subhanallah: { arabic: "سُبْحَانَ اللَّهِ", bangla: "সুবহানাল্লাহ", target: 33, key: "subhanallah" },
  alhamdulillah: { arabic: "الْحَمْدُ لِلَّهِ", bangla: "আলহামদুলিল্লাহ", target: 33, key: "alhamdulillah" },
  allahuakbar: { arabic: "اللَّهُ أَكْبَرُ", bangla: "আল্লাহু আকবার", target: 34, key: "allahuakbar" },
  lahilaha: { arabic: "لَا إِلٰهَ إِلَّا اللَّهُ", bangla: "লা ইলাহা ইল্লাল্লাহ", target: 1, key: "lahilaha" }
};

let currentType = "subhanallah";
let currentCount = 0;

function loadCounts() {
  const today = new Date().toISOString().split('T')[0];
  const saved = localStorage.getItem(`tasbih_${today}`);
  if (saved) {
    const data = JSON.parse(saved);
    currentCount = data[currentType] || 0;
  } else {
    currentCount = 0;
  }
  updateDisplay();
}

function saveCounts() {
  const today = new Date().toISOString().split('T')[0];
  const saved = localStorage.getItem(`tasbih_${today}`);
  let data = saved ? JSON.parse(saved) : {};
  data[currentType] = currentCount;
  localStorage.setItem(`tasbih_${today}`, JSON.stringify(data));
  renderStats();
}

function increment() {
  const target = tasbihTypes[currentType].target;
  if (currentCount < target) {
    currentCount++;
    saveCounts();
    updateDisplay();
    playHaptic();
  } else {
    showToast("🎯 লক্ষ্য পূরণ হয়েছে!");
  }
}

function decrement() {
  if (currentCount > 0) {
    currentCount--;
    saveCounts();
    updateDisplay();
    playHaptic();
  }
}

function reset() {
  currentCount = 0;
  saveCounts();
  updateDisplay();
  showToast("⟳ রিসেট করা হয়েছে");
}

function complete() {
  const target = tasbihTypes[currentType].target;
  if (currentCount < target) {
    currentCount = target;
    saveCounts();
    updateDisplay();
    showToast(`✅ ${tasbihTypes[currentType].bangla} সম্পন্ন!`);
  } else {
    showToast("ইতিমধ্যে সম্পন্ন হয়েছে");
  }
}

function updateDisplay() {
  const target = tasbihTypes[currentType].target;
  document.getElementById('counterValue').textContent = currentCount;
  const percent = (currentCount / target) * 100;
  document.getElementById('counterProgressFill').style.width = `${percent}%`;
}

function playHaptic() {
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(50);
  }
}

function changeType(type) {
  currentType = type;
  
  document.querySelectorAll('.tasbih-type').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.type === type) btn.classList.add('active');
  });
  
  const today = new Date().toISOString().split('T')[0];
  const saved = localStorage.getItem(`tasbih_${today}`);
  if (saved) {
    const data = JSON.parse(saved);
    currentCount = data[currentType] || 0;
  } else {
    currentCount = 0;
  }
  updateDisplay();
}

function renderStats() {
  const today = new Date().toISOString().split('T')[0];
  const saved = localStorage.getItem(`tasbih_${today}`);
  const data = saved ? JSON.parse(saved) : {};
  
  const statsGrid = document.getElementById('statsGrid');
  statsGrid.innerHTML = Object.values(tasbihTypes).map(type => {
    const count = data[type.key] || 0;
    const percent = (count / type.target) * 100;
    return `
      <div class="stat-card">
        <div class="stat-arabic">${type.arabic}</div>
        <div class="stat-name">${type.bangla}</div>
        <div class="stat-progress">${count}/${type.target} (${Math.round(percent)}%)</div>
      </div>
    `;
  }).join('');
}

function resetAll() {
  if (confirm('সকল তাসবিহের কাউন্ট রিসেট করতে চান?')) {
    const today = new Date().toISOString().split('T')[0];
    localStorage.removeItem(`tasbih_${today}`);
    currentCount = 0;
    updateDisplay();
    renderStats();
    showToast("সব কাউন্ট রিসেট করা হয়েছে");
  }
}

function showToast(msg) {
  const existing = document.querySelector('.toast-msg');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

document.addEventListener('DOMContentLoaded', () => {
  loadCounts();
  renderStats();
  
  document.getElementById('plusBtn').addEventListener('click', increment);
  document.getElementById('minusBtn').addEventListener('click', decrement);
  document.getElementById('resetBtn').addEventListener('click', reset);
  document.getElementById('completeBtn').addEventListener('click', complete);
  document.getElementById('resetAllBtn').addEventListener('click', resetAll);
  
  document.querySelectorAll('.tasbih-type').forEach(btn => {
    btn.addEventListener('click', () => changeType(btn.dataset.type));
  });
});