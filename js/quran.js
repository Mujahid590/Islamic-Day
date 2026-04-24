// ========== QURAN API AND FUNCTIONALITY ==========

// Global Variables
let surahList = [];
let filteredSurahList = [];
let currentSurah = null;
let currentAyahs = [];
let showTranslation = true;
let touchMode = true;
let currentReciter = 'ar.alafasy';
let isLoading = false;
let currentTooltip = null;
let tooltipTimeout = null;
let sajdahSurahs = {}; // Store sajdah info per surah

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

// ========== LOAD SURAH LIST FROM JSON ==========
async function loadSurahList() {
  try {
    const response = await fetch('surah data/surah-list.json');
    const data = await response.json();
    
    if (data && data.length) {
      surahList = data;
      
      // Build sajdah info map
      surahList.forEach(surah => {
        if (surah.sajdahAyah) {
          sajdahSurahs[surah.number] = {
            ayah: surah.sajdahAyah,
            symbol: surah.sajdahSymbol || '۩'
          };
        }
      });
      
      filteredSurahList = [...surahList];
      renderSurahList();
      updateSurahCount();
      
      // Auto-load first surah (Fatiha)
      if (surahList.length > 0) {
        loadSurah(surahList[0].number);
      }
    } else {
      throw new Error('Failed to load surah list');
    }
  } catch (error) {
    console.error('Error loading surah list:', error);
    showToast('সূরা তালিকা লোড করতে ব্যর্থ হয়েছে');
  }
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
  
  surahListContainer.innerHTML = filteredSurahList.map(surah => {
    const hasSajdah = surah.sajdahAyah ? true : false;
    return `
      <div class="surah-item" data-surah="${surah.number}">
        <span class="surah-number">${surah.number}</span>
        <div class="surah-name-info">
          <div class="surah-name">
            ${surah.name}
            ${hasSajdah ? `<span class="sajdah-badge">۩ সিজদা ${surah.sajdahAyah}</span>` : ''}
          </div>
          <div class="surah-name-ar">${surah.nameArabic || ''}</div>
        </div>
        <span class="ayah-count">${surah.numberOfAyahs} আয়াত</span>
      </div>
    `;
  }).join('');
  
  document.querySelectorAll('.surah-item').forEach(item => {
    item.addEventListener('click', () => {
      const surahNum = parseInt(item.dataset.surah);
      loadSurah(surahNum);
      closeSidebar();
    });
  });
}

// ========== LOAD SURAH FROM JSON FILE ==========
async function loadSurah(surahNumber) {
  showLoading(true);
  
  try {
    const response = await fetch(`surah data/surah-${surahNumber}.json`);
    if (!response.ok) {
      throw new Error(`Surah ${surahNumber} not found`);
    }
    
    const data = await response.json();
    currentSurah = data;
    currentAyahs = data.ayahs || [];
    
    // Get surah info from list
    const surahInfo = surahList.find(s => s.number === surahNumber);
    const revelationText = surahInfo?.revelationType || data.revelationType || '';
    const ayahCount = surahInfo?.numberOfAyahs || data.numberOfAyahs || currentAyahs.length;
    
    // Build details text
    let detailsText = `${revelationText} · ${ayahCount} আয়াত`;
    
    // Add sajdah info if exists
    const sajdahInfo = sajdahSurahs[surahNumber];
    if (sajdahInfo) {
      detailsText += ` · <span class="sajdah-info-badge"><span class="sajdah-symbol">${sajdahInfo.symbol}</span> সিজদা (আয়াত ${sajdahInfo.ayah})</span>`;
    }
    
    // Update header
    surahNameEl.textContent = data.name || surahInfo?.name;
    surahNameArabicEl.textContent = data.nameArabic || surahInfo?.nameArabic;
    surahMeaningEl.textContent = data.meaning || surahInfo?.meaning || '';
    surahDetailsEl.innerHTML = detailsText;
    
    renderAyahs(surahNumber);
    updateActiveSurahInList(surahNumber);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
  } catch (error) {
    console.error('Error loading surah:', error);
    showToast(`সূরা ${surahNumber} লোড করতে ব্যর্থ হয়েছে`);
    
    // Show error in container
    if (ayahContainer) {
      ayahContainer.innerHTML = `
        <div class="no-results">
          <p>⚠️ সূরা টি লোড করা সম্ভব হয়নি</p>
          <p style="font-size:0.8rem; margin-top:10px;">surah data/surah-${surahNumber}.json ফাইলটি বিদ্যমান নেই</p>
        </div>
      `;
    }
  }
  
  showLoading(false);
}

function renderAyahs(surahNumber) {
  if (!ayahContainer) return;
  
  if (!currentAyahs || currentAyahs.length === 0) {
    ayahContainer.innerHTML = '<div class="no-results"><p>কোন আয়াত পাওয়া যায়নি</p></div>';
    return;
  }
  
  // Check if we should show Bismillah (except Surah At-Tawbah - number 9)
  const showBismillah = surahNumber !== 9;
  const sajdahInfo = sajdahSurahs[surahNumber];
  const sajdahAyah = sajdahInfo ? sajdahInfo.ayah : null;
  
  let bismillahHtml = '';
  if (showBismillah && surahNumber !== 1) { // Fatiha doesn't have Bismillah as separate ayah
    bismillahHtml = `
      <div class="bismillah-container">
        <div class="bismillah-text">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
      </div>
    `;
  }
  
  const ayahsHtml = currentAyahs.map(ayah => {
    const isSajdahAyah = sajdahAyah === ayah.number;
    const sajdahIndicator = isSajdahAyah ? 
      `<span class="sajdah-indicator"><span class="sajdah-symbol">۩</span> সিজদার আয়াত</span>` : '';
    
    return `
      <div class="ayah-item ${isSajdahAyah ? 'sajdah-ayah' : ''}" data-ayah="${ayah.number}">
        <div class="ayah-number">${ayah.number} ${sajdahIndicator}</div>
        <div class="ayah-arabic" data-arabic="${encodeURIComponent(ayah.arabic)}" data-translation="${encodeURIComponent(ayah.translation)}">${ayah.arabic}</div>
        ${showTranslation ? `<div class="ayah-translation">${ayah.translation}</div>` : ''}
      </div>
    `;
  }).join('');
  
  ayahContainer.innerHTML = bismillahHtml + ayahsHtml;
  attachAyahListeners();
}

function attachAyahListeners() {
  const arabicElements = document.querySelectorAll('.ayah-arabic');
  
  arabicElements.forEach(el => {
    el.removeEventListener('click', handleAyahClick);
    el.removeEventListener('mouseenter', handleAyahMouseEnter);
    el.removeEventListener('mouseleave', handleAyahMouseLeave);
    
    if (touchMode) {
      el.addEventListener('click', handleAyahClick);
    } else {
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
  tooltipTimeout = setTimeout(() => hideTooltip(), 200);
}

function showTooltip(targetElement, arabic, translation) {
  if (!ayahTooltip) return;
  
  const tooltipArabic = ayahTooltip.querySelector('.tooltip-arabic');
  const tooltipTranslation = ayahTooltip.querySelector('.tooltip-translation');
  
  if (tooltipArabic) tooltipArabic.innerHTML = arabic;
  if (tooltipTranslation) tooltipTranslation.innerHTML = translation;
  
  const rect = targetElement.getBoundingClientRect();
  const tooltipHeight = 150;
  const tooltipWidth = 280;
  
  let top = rect.top - tooltipHeight - 10;
  let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
  
  if (top < 10) top = rect.bottom + 10;
  if (left < 10) left = 10;
  if (left + tooltipWidth > window.innerWidth - 10) left = window.innerWidth - tooltipWidth - 10;
  
  ayahTooltip.style.top = `${top}px`;
  ayahTooltip.style.left = `${left}px`;
  ayahTooltip.style.display = 'block';
  
  if (touchMode) {
    setTimeout(() => hideTooltip(), 3000);
  }
}

function hideTooltip() {
  if (ayahTooltip) ayahTooltip.style.display = 'none';
}

document.addEventListener('click', (e) => {
  if (!e.target.classList?.contains('ayah-arabic')) hideTooltip();
});

function updateActiveSurahInList(surahNumber) {
  document.querySelectorAll('.surah-item').forEach(item => {
    const num = parseInt(item.dataset.surah);
    item.classList.toggle('active', num === surahNumber);
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
    if (currentSurah) {
      renderAyahs(currentSurah.number);
    }
  } else if (currentSurah) {
    renderAyahs(currentSurah.number);
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
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => filterSurahList(e.target.value));
  }
  
  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', clearSearch);
  }
  
  window.addEventListener('scroll', hideTooltip);
  window.addEventListener('resize', hideTooltip);
});