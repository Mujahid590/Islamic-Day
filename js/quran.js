// ========== QURAN API AND FUNCTIONALITY ==========

// API Endpoints
const API_BASE = 'https://api.alquran.cloud/v1';
const SURAH_API = `${API_BASE}/surah`;

// Global Variables
let surahList = [];
let currentAyahs = [];
let showTranslation = true;
let currentReciter = 'ar.alafasy';
let isLoading = false;

// DOM Elements
const surahListContainer = document.getElementById('surahList');
const ayahContainer = document.getElementById('ayahContainer');
const surahNameEl = document.getElementById('surahName');
const surahNameArabicEl = document.getElementById('surahNameArabic');
const surahMeaningEl = document.getElementById('surahMeaning');
const surahDetailsEl = document.getElementById('surahDetails');
const loadingIndicator = document.getElementById('loadingIndicator');
const settingsHeaderBtn = document.getElementById('settingsHeaderBtn');
const quranSettingsModal = document.getElementById('quranSettingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const reciterSelect = document.getElementById('reciterSelect');
const showTranslationToggle = document.getElementById('showTranslationToggle');
const audioPlayer = document.getElementById('audioPlayer');
const quranAudio = document.getElementById('quranAudio');
const closeAudioBtn = document.getElementById('closeAudioBtn');
const toggleSurahBtn = document.getElementById('toggleSurahBtn');
const surahSidebar = document.getElementById('surahSidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

// Theme buttons
const themeBtns = document.querySelectorAll('.theme-btn-small');

// Surah Fatiha Data (Built-in)
const SURAH_FATIHA = {
  number: 1,
  name: "সূরা আল-ফাতিহা",
  nameArabic: "الفاتحة",
  meaning: "উদ্বোধন",
  revelationType: "Meccan",
  numberOfAyahs: 7,
  ayahs: [
    { number: 1, arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translation: "শুরু করছি আল্লাহর নামে যিনি পরম করুণাময়, অতি দয়ালু।" },
    { number: 2, arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", translation: "সমস্ত প্রশংসা আল্লাহর জন্য, যিনি সমগ্র বিশ্বের পালনকর্তা।" },
    { number: 3, arabic: "الرَّحْمَٰنِ الرَّحِيمِ", translation: "যিনি পরম করুণাময়, অতি দয়ালু।" },
    { number: 4, arabic: "مَالِكِ يَوْمِ الدِّينِ", translation: "যিনি বিচার দিনের মালিক।" },
    { number: 5, arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", translation: "আমরা শুধু আপনারই ইবাদত করি এবং শুধু আপনারই সাহায্য প্রার্থনা করি।" },
    { number: 6, arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", translation: "আমাদেরকে সরল পথ দেখান।" },
    { number: 7, arabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", translation: "তাদের পথ, যাদেরকে আপনি অনুগ্রহ দান করেছেন, যাদের উপর আপনার ক্রোধ নাযিল হয়নি এবং যারা পথভ্রষ্ট হয়নি।" }
  ]
};

// ========== THEME FUNCTIONS ==========
function setThemeMode(mode) {
  if (mode === "dark") document.body.classList.add("dark");
  else if (mode === "light") document.body.classList.remove("dark");
  else {
    window.matchMedia("(prefers-color-scheme:dark)").matches ?
      document.body.classList.add("dark") : document.body.classList.remove("dark");
  }
  localStorage.setItem("deen_theme", mode);
  document.querySelectorAll(".theme-btn-small").forEach(b =>
    b.classList.toggle("active", b.dataset.theme === mode));
}

function initTheme() {
  const savedTheme = localStorage.getItem("deen_theme") || "light";
  setThemeMode(savedTheme);
  themeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      setThemeMode(btn.dataset.theme);
      showToast(btn.dataset.theme === "dark" ? "🌙 ডার্ক মোড সক্রিয়" : 
                 btn.dataset.theme === "light" ? "☀️ লাইট মোড সক্রিয়" : "📱 সিস্টেম থিম");
    });
  });
  window.matchMedia("(prefers-color-scheme:dark)").addEventListener("change", () => {
    if (localStorage.getItem("deen_theme") === "system") setThemeMode("system");
  });
}

// ========== SIDEBAR TOGGLE FUNCTIONS ==========
function toggleSidebar() {
  surahSidebar.classList.toggle('open');
  sidebarOverlay.classList.toggle('show');
}

function closeSidebar() {
  surahSidebar.classList.remove('open');
  sidebarOverlay.classList.remove('show');
}

// ========== LOAD SURAH LIST ==========
async function loadSurahList() {
  try {
    const response = await fetch(`${API_BASE}/surah`);
    const data = await response.json();
    
    if (data.code === 200) {
      surahList = data.data;
      renderSurahList();
    } else {
      throw new Error('Failed to load surah list');
    }
  } catch (error) {
    console.error('Error loading surah list:', error);
    loadFallbackSurahList();
  }
}

function loadFallbackSurahList() {
  surahList = [];
  for (let i = 1; i <= 114; i++) {
    surahList.push({
      number: i,
      name: `সূরা ${i}`,
      englishName: `Surah ${i}`,
      englishNameTranslation: '',
      revelationType: i % 2 === 0 ? 'Meccan' : 'Medinan',
      numberOfAyahs: i === 1 ? 7 : (i === 2 ? 286 : 20)
    });
  }
  renderSurahList();
}

function renderSurahList() {
  if (!surahListContainer) return;
  
  surahListContainer.innerHTML = surahList.map(surah => `
    <div class="surah-item" data-surah="${surah.number}">
      <span class="surah-number">${surah.number}</span>
      <div class="surah-name">
        <div>${surah.englishName || surah.name}</div>
        <div class="surah-name-ar">${surah.name || ''}</div>
      </div>
      <span class="ayah-count">${surah.numberOfAyahs} আয়াত</span>
    </div>
  `).join('');
  
  document.querySelectorAll('.surah-item').forEach(item => {
    item.addEventListener('click', () => {
      const surahNum = parseInt(item.dataset.surah);
      if (surahNum === 1) {
        loadSurahFatiha();
      } else {
        showToast(`শুধুমাত্র সূরা আল-ফাতিহা উপলব্ধ`);
      }
      closeSidebar();
    });
  });
}

// ========== LOAD SURAH FATIHA ==========
function loadSurahFatiha() {
  showLoading(true);
  
  currentAyahs = SURAH_FATIHA.ayahs;
  
  surahNameEl.textContent = SURAH_FATIHA.name;
  surahNameArabicEl.textContent = SURAH_FATIHA.nameArabic;
  surahMeaningEl.textContent = SURAH_FATIHA.meaning;
  surahDetailsEl.textContent = `মক্কী · ${SURAH_FATIHA.numberOfAyahs} আয়াত`;
  
  renderAyahs();
  updateActiveSurahInList(1);
  showLoading(false);
}

function renderAyahs() {
  if (!ayahContainer) return;
  
  ayahContainer.innerHTML = currentAyahs.map(ayah => `
    <div class="ayah-item" data-ayah="${ayah.number}">
      <div class="ayah-number">${ayah.number}</div>
      <div class="ayah-arabic">${ayah.arabic}</div>
      ${showTranslation ? `<div class="ayah-translation">${ayah.translation}</div>` : ''}
    </div>
  `).join('');
}

function updateActiveSurahInList(surahNumber) {
  document.querySelectorAll('.surah-item').forEach(item => {
    const num = parseInt(item.dataset.surah);
    if (num === surahNumber) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// ========== AUDIO PLAYER ==========
function playSurahAudio(surahNumber = 1, ayahNumber = 1) {
  try {
    const audioUrl = `https://cdn.islamic.network/quran/audio/128/${currentReciter}/${surahNumber}_${ayahNumber}.mp3`;
    quranAudio.src = audioUrl;
    audioPlayer.style.display = 'flex';
    quranAudio.play().catch(e => console.log('Audio play error:', e));
  } catch (error) {
    console.error('Error playing audio:', error);
    showToast('অডিও প্লে করতে ব্যর্থ হয়েছে');
  }
}

// ========== LOADING & TOAST ==========
function showLoading(show) {
  if (loadingIndicator) {
    loadingIndicator.style.display = show ? 'flex' : 'none';
  }
  if (ayahContainer) {
    ayahContainer.style.display = show ? 'none' : 'block';
  }
}

function showToast(message) {
  const existingToast = document.querySelector('.toast-msg');
  if (existingToast) existingToast.remove();
  
  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 2500);
}

// ========== SETTINGS ==========
function openSettings() {
  quranSettingsModal.classList.add('show');
}

function closeSettings() {
  quranSettingsModal.classList.remove('show');
}

function saveSettings() {
  currentReciter = reciterSelect.value;
  showTranslation = showTranslationToggle.checked;
  localStorage.setItem('quran_reciter', currentReciter);
  localStorage.setItem('quran_show_translation', showTranslation);
  
  if (currentAyahs.length) {
    renderAyahs();
  }
}

function loadSettings() {
  const savedReciter = localStorage.getItem('quran_reciter');
  const savedTranslation = localStorage.getItem('quran_show_translation');
  
  if (savedReciter) {
    currentReciter = savedReciter;
    reciterSelect.value = savedReciter;
  }
  if (savedTranslation !== null) {
    showTranslation = savedTranslation === 'true';
    showTranslationToggle.checked = showTranslation;
  }
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadSettings();
  loadSurahList();
  loadSurahFatiha();
  
  if (settingsHeaderBtn) settingsHeaderBtn.addEventListener('click', openSettings);
  if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettings);
  if (reciterSelect) reciterSelect.addEventListener('change', saveSettings);
  if (showTranslationToggle) showTranslationToggle.addEventListener('change', saveSettings);
  if (closeAudioBtn) closeAudioBtn.addEventListener('click', () => {
    audioPlayer.style.display = 'none';
    quranAudio.pause();
  });
  if (toggleSurahBtn) toggleSurahBtn.addEventListener('click', toggleSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
  
  if (quranSettingsModal) {
    quranSettingsModal.addEventListener('click', (e) => {
      if (e.target === quranSettingsModal) closeSettings();
    });
  }
});