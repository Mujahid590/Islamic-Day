// ========== QURAN API AND FUNCTIONALITY ==========

// Global Variables
let surahList = [];
let filteredSurahList = [];
let currentAyahs = [];
let showTranslation = true;
let touchMode = true;
let currentReciter = 'ar.alafasy';
let isLoading = false;
let currentTooltip = null;
let tooltipTimeout = null;

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
const touchModeToggle = document.getElementById('touchModeToggle');
const audioPlayer = document.getElementById('audioPlayer');
const quranAudio = document.getElementById('quranAudio');
const closeAudioBtn = document.getElementById('closeAudioBtn');
const toggleSurahBtn = document.getElementById('toggleSurahBtn');
const surahSidebar = document.getElementById('surahSidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const searchInput = document.getElementById('surahSearchInput');
const searchClearBtn = document.getElementById('searchClearBtn');
const surahCountSpan = document.getElementById('surahCount');
const ayahTooltip = document.getElementById('ayahTooltip');

// Theme buttons
const themeBtns = document.querySelectorAll('.theme-btn-small');

// Surah Fatiha Data (Built-in)
const SURAH_FATIHA = {
  number: 1,
  name: "সূরা আল-ফাতিহা",
  nameArabic: "الفاتحة",
  meaning: "উদ্বোধন",
  revelationType: "মক্কী",
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

// ========== SEARCH FUNCTIONALITY ==========
function filterSurahList(searchTerm) {
  if (!searchTerm.trim()) {
    filteredSurahList = [...surahList];
    searchClearBtn.style.display = 'none';
  } else {
    const term = searchTerm.toLowerCase().trim();
    filteredSurahList = surahList.filter(surah => {
      const banglaName = surah.name?.toLowerCase() || '';
      const arabicName = surah.nameArabic?.toLowerCase() || '';
      const numberMatch = surah.number.toString().includes(term);
      const englishName = surah.nameEnglish?.toLowerCase() || '';
      
      return banglaName.includes(term) || 
             arabicName.includes(term) || 
             numberMatch ||
             englishName.includes(term);
    });
    searchClearBtn.style.display = 'inline-block';
  }
  
  renderSurahList();
  updateSurahCount();
}

function updateSurahCount() {
  if (surahCountSpan) {
    surahCountSpan.textContent = `${filteredSurahList.length} টি সূরা`;
  }
}

function clearSearch() {
  if (searchInput) {
    searchInput.value = '';
    filterSurahList('');
  }
}

// ========== LOAD SURAH LIST ==========
async function loadSurahList() {
  try {
    const response = await fetch('surah data/surah-list.json');
    const data = await response.json();
    
    if (data && data.length) {
      surahList = data;
      filteredSurahList = [...surahList];
      renderSurahList();
      updateSurahCount();
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
      nameArabic: i === 1 ? 'الفاتحة' : `سورة ${i}`,
      nameEnglish: `Surah ${i}`,
      meaning: '',
      revelationType: i % 2 === 0 ? 'মাদানী' : 'মক্কী',
      numberOfAyahs: i === 1 ? 7 : (i === 2 ? 286 : 20)
    });
  }
  filteredSurahList = [...surahList];
  renderSurahList();
  updateSurahCount();
}

function renderSurahList() {
  if (!surahListContainer) return;
  
  if (filteredSurahList.length === 0) {
    surahListContainer.innerHTML = `
      <div class="no-results">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <p>কোন সূরা খুঁজে পাওয়া যায়নি</p>
      </div>
    `;
    return;
  }
  
  surahListContainer.innerHTML = filteredSurahList.map(surah => `
    <div class="surah-item" data-surah="${surah.number}">
      <span class="surah-number">${surah.number}</span>
      <div class="surah-name-info">
        <div class="surah-name">${surah.name}</div>
        <div class="surah-name-ar">${surah.nameArabic || ''}</div>
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
  surahDetailsEl.textContent = `${SURAH_FATIHA.revelationType} · ${SURAH_FATIHA.numberOfAyahs} আয়াত`;
  
  renderAyahs();
  updateActiveSurahInList(1);
  showLoading(false);
}

function renderAyahs() {
  if (!ayahContainer) return;
  
  ayahContainer.innerHTML = currentAyahs.map(ayah => `
    <div class="ayah-item" data-ayah="${ayah.number}">
      <div class="ayah-number">${ayah.number}</div>
      <div class="ayah-arabic" data-arabic="${encodeURIComponent(ayah.arabic)}" data-translation="${encodeURIComponent(ayah.translation)}">${ayah.arabic}</div>
      ${showTranslation ? `<div class="ayah-translation">${ayah.translation}</div>` : ''}
    </div>
  `).join('');
  
  // Add click/touch listeners for arabic text
  attachAyahListeners();
}

function attachAyahListeners() {
  const arabicElements = document.querySelectorAll('.ayah-arabic');
  
  arabicElements.forEach(el => {
    // Remove existing listeners to avoid duplicates
    el.removeEventListener('click', handleAyahClick);
    el.removeEventListener('mouseenter', handleAyahMouseEnter);
    el.removeEventListener('mouseleave', handleAyahMouseLeave);
    
    if (touchMode) {
      // Touch mode: click/tap to show tooltip
      el.addEventListener('click', handleAyahClick);
    } else {
      // Desktop mode: hover to show tooltip
      el.addEventListener('mouseenter', handleAyahMouseEnter);
      el.addEventListener('mouseleave', handleAyahMouseLeave);
    }
  });
}

function handleAyahClick(e) {
  e.stopPropagation();
  const element = e.currentTarget;
  const arabic = decodeURIComponent(element.dataset.arabic || '');
  const translation = decodeURIComponent(element.dataset.translation || '');
  
  showTooltip(element, arabic, translation);
}

function handleAyahMouseEnter(e) {
  if (touchMode) return;
  
  if (tooltipTimeout) clearTimeout(tooltipTimeout);
  
  const element = e.currentTarget;
  const arabic = decodeURIComponent(element.dataset.arabic || '');
  const translation = decodeURIComponent(element.dataset.translation || '');
  
  showTooltip(element, arabic, translation);
}

function handleAyahMouseLeave(e) {
  if (touchMode) return;
  
  tooltipTimeout = setTimeout(() => {
    hideTooltip();
  }, 200);
}

function showTooltip(targetElement, arabic, translation) {
  if (!ayahTooltip) return;
  
  // Update tooltip content
  const tooltipArabic = ayahTooltip.querySelector('.tooltip-arabic');
  const tooltipTranslation = ayahTooltip.querySelector('.tooltip-translation');
  
  if (tooltipArabic) tooltipArabic.innerHTML = arabic;
  if (tooltipTranslation) tooltipTranslation.innerHTML = translation;
  
  // Position tooltip
  const rect = targetElement.getBoundingClientRect();
  const tooltipHeight = 150;
  const tooltipWidth = 280;
  
  let top = rect.top - tooltipHeight - 10;
  let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
  
  // Adjust if tooltip goes out of viewport
  if (top < 10) {
    top = rect.bottom + 10;
  }
  if (left < 10) {
    left = 10;
  }
  if (left + tooltipWidth > window.innerWidth - 10) {
    left = window.innerWidth - tooltipWidth - 10;
  }
  
  ayahTooltip.style.top = `${top}px`;
  ayahTooltip.style.left = `${left}px`;
  ayahTooltip.style.display = 'block';
  
  // Auto hide after 3 seconds in touch mode
  if (touchMode) {
    setTimeout(() => {
      hideTooltip();
    }, 3000);
  }
}

function hideTooltip() {
  if (ayahTooltip) {
    ayahTooltip.style.display = 'none';
  }
}

// Close tooltip when clicking elsewhere
document.addEventListener('click', (e) => {
  if (!e.target.classList.contains('ayah-arabic')) {
    hideTooltip();
  }
});

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
  const newTouchMode = touchModeToggle.checked;
  
  localStorage.setItem('quran_reciter', currentReciter);
  localStorage.setItem('quran_show_translation', showTranslation);
  localStorage.setItem('quran_touch_mode', newTouchMode);
  
  if (newTouchMode !== touchMode) {
    touchMode = newTouchMode;
    if (currentAyahs.length) {
      renderAyahs();
    }
  } else if (currentAyahs.length) {
    renderAyahs();
  }
}

function loadSettings() {
  const savedReciter = localStorage.getItem('quran_reciter');
  const savedTranslation = localStorage.getItem('quran_show_translation');
  const savedTouchMode = localStorage.getItem('quran_touch_mode');
  
  if (savedReciter) {
    currentReciter = savedReciter;
    reciterSelect.value = savedReciter;
  }
  if (savedTranslation !== null) {
    showTranslation = savedTranslation === 'true';
    showTranslationToggle.checked = showTranslation;
  }
  if (savedTouchMode !== null) {
    touchMode = savedTouchMode === 'true';
    if (touchModeToggle) touchModeToggle.checked = touchMode;
  } else {
    touchMode = true;
    if (touchModeToggle) touchModeToggle.checked = true;
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
  if (touchModeToggle) touchModeToggle.addEventListener('change', saveSettings);
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
  
  // Search functionality
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterSurahList(e.target.value);
    });
  }
  
  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', clearSearch);
  }
  
  // Tooltip close on scroll
  window.addEventListener('scroll', hideTooltip);
  window.addEventListener('resize', hideTooltip);
});