// ========== QURAN API AND FUNCTIONALITY ==========
// অফলাইন ও অনলাইন উভয় মোডে কাজ করবে

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
let sajdahSurahs = {};

// Audio Player Variables
let isPlaying = false;
let currentSurahNumber = null;
let audioUpdateInterval = null;

// DOM Elements
const surahListContainer = document.getElementById('surahList');
const ayahContainer = document.getElementById('ayahContainer');
const surahNameEl = document.getElementById('surahName');
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
const playPauseBtn = document.getElementById('playPauseBtn');
const stopBtn = document.getElementById('stopBtn');
const closeAudioBtn = document.getElementById('closeAudioBtn');
const audioProgress = document.getElementById('audioProgress');
const currentTimeSpan = document.getElementById('currentTime');
const durationSpan = document.getElementById('duration');
const toggleSurahBtn = document.getElementById('toggleSurahBtn');
const surahSidebar = document.getElementById('surahSidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const searchInput = document.getElementById('surahSearchInput');
const searchClearBtn = document.getElementById('searchClearBtn');
const surahCountSpan = document.getElementById('surahCount');
const ayahTooltip = document.getElementById('ayahTooltip');

// Icons
const playIcon = document.querySelector('.play-icon');
const pauseIcon = document.querySelector('.pause-icon');

// Theme buttons
const themeBtns = document.querySelectorAll('.theme-btn-small');

// ========== ইনলাইন ফলব্যাক ডাটা (অফলাইনের জন্য) ==========
const INLINE_SURAH_LIST = [
  { number: 1, name: "সূরা আল-ফাতিহা", nameArabic: "الفاتحة", nameEnglish: "Al-Fatiha", numberOfAyahs: 7, revelationType: "মক্কী" },
  { number: 2, name: "সূরা আল-বাকারা", nameArabic: "البقرة", nameEnglish: "Al-Baqarah", numberOfAyahs: 286, revelationType: "মাদানী" },
  { number: 3, name: "সূরা আল-ইমরান", nameArabic: "آل عمران", nameEnglish: "Aal-E-Imran", numberOfAyahs: 200, revelationType: "মাদানী" },
  { number: 4, name: "সূরা আন-নিসা", nameArabic: "النساء", nameEnglish: "An-Nisa", numberOfAyahs: 176, revelationType: "মাদানী" },
  { number: 5, name: "সূরা আল-মায়িদাহ", nameArabic: "المائدة", nameEnglish: "Al-Ma'idah", numberOfAyahs: 120, revelationType: "মাদানী" },
  { number: 6, name: "সূরা আল-আনআম", nameArabic: "الأنعام", nameEnglish: "Al-An'am", numberOfAyahs: 165, revelationType: "মক্কী" },
  { number: 7, name: "সূরা আল-আরাফ", nameArabic: "الأعراف", nameEnglish: "Al-A'raf", numberOfAyahs: 206, revelationType: "মক্কী", sajdahAyah: 206, sajdahSymbol: "۩" },
  { number: 13, name: "সূরা আর-রাদ", nameArabic: "الرعد", nameEnglish: "Ar-Ra'd", numberOfAyahs: 43, revelationType: "মাদানী", sajdahAyah: 15, sajdahSymbol: "۩" }
];

const INLINE_SURAH_DATA = {
  1: {
    number: 1,
    name: "সূরা আল-ফাতিহা",
    nameArabic: "الفاتحة",
    meaning: "উদ্বোধন",
    revelationType: "মক্কী",
    numberOfAyahs: 7,
    ayahs: [
      { number: 1, arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translation: "শুরু করছি আল্লাহর নামে যিনি পরম করুণাময় ও অতি দয়ালু।" },
      { number: 2, arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", translation: "সমস্ত প্রশংসা আল্লাহর জন্য, যিনি সমস্ত সৃষ্টিকুলের রব।" },
      { number: 3, arabic: "الرَّحْمَٰنِ الرَّحِيمِ", translation: "যিনি পরম করুণাময় ও অতি দয়ালু।" },
      { number: 4, arabic: "مَالِكِ يَوْمِ الدِّينِ", translation: "যিনি বিচার দিনের মালিক।" },
      { number: 5, arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", translation: "আমরা শুধুমাত্র তোমারই ইবাদত করি এবং শুধুমাত্র তোমারই কাছে সাহায্য চাই।" },
      { number: 6, arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", translation: "আমাদের সরল পথ দেখাও।" },
      { number: 7, arabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", translation: "তাদের পথ, যাদেরকে তুমি নেয়ামত দান করেছ, তাদের পথ নয় যাদের প্রতি তোমার ক্রোধ নাযিল হয়েছে এবং তারা পথভ্রষ্টও নয়।" }
    ]
  }
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

// ========== SIDEBAR FUNCTIONS ==========
function toggleSidebar() {
  surahSidebar.classList.toggle('open');
  sidebarOverlay.classList.toggle('show');
}

function closeSidebar() {
  surahSidebar.classList.remove('open');
  sidebarOverlay.classList.remove('show');
}

// ========== SEARCH FUNCTIONS ==========
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
      
      return banglaName.includes(term) || arabicName.includes(term) || numberMatch || englishName.includes(term);
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

// ========== LOAD SURAH LIST (অফলাইন + অনলাইন) ==========
async function loadSurahList() {
  showLoading(true);
  try {
    console.log('Loading surah list from surah-data/surah-list.json');
    const response = await fetch('surah-data/surah-list.json');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    
    if (data && data.length) {
      surahList = data;
    } else {
      throw new Error('No data');
    }
  } catch (error) {
    console.warn('Online JSON not available, using inline data');
    showToast('অফলাইনে সূরা তালিকা লোড করা হচ্ছে');
    surahList = INLINE_SURAH_LIST;
  }
  
  // Store sajdah info
  surahList.forEach(surah => {
    if (surah.sajdahAyah) {
      sajdahSurahs[surah.number] = {
        ayah: surah.sajdahAyah,
        symbol: surah.sajdahSymbol || '۩'
      };
      if (surah.sajdahAyah2) {
        sajdahSurahs[surah.number].ayah2 = surah.sajdahAyah2;
      }
    }
  });
  
  filteredSurahList = [...surahList];
  renderSurahList();
  updateSurahCount();
  
  // Load first surah
  if (surahList.length > 0) {
    loadSurah(surahList[0].number);
  }
  
  showLoading(false);
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
    let sajdahText = '';
    if (hasSajdah) {
      if (surah.sajdahAyah2) {
        sajdahText = `۩ সিজদা ${surah.sajdahAyah}, ${surah.sajdahAyah2}`;
      } else {
        sajdahText = `۩ সিজদা ${surah.sajdahAyah}`;
      }
    }
    
    return `
      <div class="surah-item" data-surah="${surah.number}">
        <span class="surah-number">${surah.number}</span>
        <div class="surah-name-info">
          <div class="surah-name">${surah.name}</div>
          ${hasSajdah ? `<div class="sajdah-badge">${sajdahText}</div>` : ''}
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

// ========== LOAD SURAH (অফলাইন + অনলাইন) ==========
async function loadSurah(surahNumber) {
  showLoading(true);
  stopAudio();
  
  try {
    console.log(`Loading surah ${surahNumber} from surah-data/surah-${surahNumber}.json`);
    const response = await fetch(`surah-data/surah-${surahNumber}.json`);
    if (!response.ok) {
      throw new Error(`Surah ${surahNumber} not found`);
    }
    const data = await response.json();
    currentSurah = data;
    currentAyahs = data.ayahs || [];
  } catch (error) {
    console.warn(`Online JSON for surah ${surahNumber} not available, using inline data`);
    if (INLINE_SURAH_DATA[surahNumber]) {
      currentSurah = INLINE_SURAH_DATA[surahNumber];
      currentAyahs = currentSurah.ayahs || [];
    } else {
      // Create placeholder data
      const surahInfo = surahList.find(s => s.number === surahNumber);
      currentAyahs = [];
      const ayahCount = surahInfo?.numberOfAyahs || 7;
      for (let i = 1; i <= Math.min(ayahCount, 10); i++) {
        currentAyahs.push({
          number: i,
          arabic: `آيَة ${i}`,
          translation: `আয়াত ${i}`
        });
      }
      currentSurah = {
        number: surahNumber,
        name: surahInfo?.name || `সূরা ${surahNumber}`,
        nameArabic: surahInfo?.nameArabic || '',
        revelationType: surahInfo?.revelationType || 'মক্কী',
        numberOfAyahs: ayahCount,
        ayahs: currentAyahs
      };
    }
    showToast(`সূরা ${surahNumber} অফলাইনে লোড করা হচ্ছে`);
  }
  
  currentSurahNumber = surahNumber;
  const surahInfo = surahList.find(s => s.number === surahNumber);
  const revelationText = surahInfo?.revelationType || currentSurah?.revelationType || '';
  const ayahCount = surahInfo?.numberOfAyahs || currentSurah?.numberOfAyahs || currentAyahs.length;
  
  let detailsText = `${revelationText} · ${ayahCount} আয়াত`;
  
  const sajdahInfo = sajdahSurahs[surahNumber];
  if (sajdahInfo) {
    detailsText += ` · <span class="sajdah-info-badge"><span class="sajdah-symbol">${sajdahInfo.symbol}</span> সিজদা (আয়াত ${sajdahInfo.ayah})</span>`;
    if (sajdahInfo.ayah2) {
      detailsText += `, ${sajdahInfo.ayah2}`;
    }
  }
  
  surahNameEl.textContent = currentSurah.name || surahInfo?.name || `সূরা ${surahNumber}`;
  surahDetailsEl.innerHTML = detailsText;
  
  renderAyahs(surahNumber);
  updateActiveSurahInList(surahNumber);
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showLoading(false);
}

function renderAyahs(surahNumber) {
  if (!ayahContainer) return;
  
  if (!currentAyahs || currentAyahs.length === 0) {
    ayahContainer.innerHTML = '<div class="no-results"><p>কোন আয়াত পাওয়া যায়নি</p></div>';
    return;
  }
  
  const showBismillah = surahNumber !== 9 && surahNumber !== 1;
  
  let bismillahHtml = '';
  if (showBismillah && currentAyahs.length > 0) {
    bismillahHtml = `
      <div class="bismillah-container">
        <div class="bismillah-text">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
      </div>
    `;
  }
  
  const ayahsHtml = currentAyahs.map(ayah => {
    const isSajdahAyah = (sajdahSurahs[surahNumber] && 
      (sajdahSurahs[surahNumber].ayah === ayah.number || 
       (sajdahSurahs[surahNumber].ayah2 === ayah.number)));
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

// ========== AUDIO PLAYER FUNCTIONS (অনলাইন অডিও) ==========
function getAudioUrl(surahNumber) {
  return `https://cdn.islamic.network/quran/audio/128/${currentReciter}/${surahNumber}.mp3`;
}

function playSurahAudio() {
  if (!currentSurahNumber) {
    showToast('প্রথমে একটি সূরা নির্বাচন করুন');
    return;
  }
  
  const audioUrl = getAudioUrl(currentSurahNumber);
  console.log('Playing audio:', audioUrl);
  
  if (quranAudio.src !== audioUrl) {
    quranAudio.src = audioUrl;
    quranAudio.load();
  }
  
  quranAudio.play()
    .then(() => {
      isPlaying = true;
      audioPlayer.style.display = 'block';
      updatePlayPauseButtons(true);
      startAudioProgressUpdate();
      showToast(`🔊 ${surahNameEl.innerText} শুরু হচ্ছে...`);
    })
    .catch(e => {
      console.error('Audio play error:', e);
      showToast('অডিও প্লে করতে ব্যর্থ হয়েছে। ইন্টারনেট কানেকশন চেক করুন।');
      updatePlayPauseButtons(false);
    });
}

function pauseAudio() {
  if (quranAudio) {
    quranAudio.pause();
    isPlaying = false;
    updatePlayPauseButtons(false);
    stopAudioProgressUpdate();
  }
}

function stopAudio() {
  if (quranAudio) {
    quranAudio.pause();
    quranAudio.currentTime = 0;
    isPlaying = false;
    updatePlayPauseButtons(false);
    if (audioProgress) audioProgress.value = 0;
    if (currentTimeSpan) currentTimeSpan.textContent = '00:00';
    if (durationSpan) durationSpan.textContent = '00:00';
    stopAudioProgressUpdate();
  }
}

function togglePlayPause() {
  if (isPlaying) {
    pauseAudio();
  } else {
    playSurahAudio();
  }
}

function updatePlayPauseButtons(playing) {
  if (playIcon && pauseIcon) {
    if (playing) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
    } else {
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
    }
  }
}

function startAudioProgressUpdate() {
  if (audioUpdateInterval) clearInterval(audioUpdateInterval);
  audioUpdateInterval = setInterval(updateAudioProgress, 500);
}

function stopAudioProgressUpdate() {
  if (audioUpdateInterval) {
    clearInterval(audioUpdateInterval);
    audioUpdateInterval = null;
  }
}

function updateAudioProgress() {
  if (!quranAudio || !audioProgress) return;
  
  const duration = quranAudio.duration;
  const currentTime = quranAudio.currentTime;
  
  if (!isNaN(duration) && duration > 0 && duration !== Infinity) {
    audioProgress.value = (currentTime / duration) * 100;
    currentTimeSpan.textContent = formatTime(currentTime);
    durationSpan.textContent = formatTime(duration);
  }
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds === Infinity) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function seekAudio(e) {
  if (!quranAudio) return;
  const duration = quranAudio.duration;
  if (!isNaN(duration) && duration > 0 && duration !== Infinity) {
    const seekTime = (e.target.value / 100) * duration;
    quranAudio.currentTime = seekTime;
  }
}

function closeAudio() {
  stopAudio();
  audioPlayer.style.display = 'none';
  quranAudio.src = '';
}

// Audio event listeners
function setupAudioListeners() {
  if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlayPause);
  if (stopBtn) stopBtn.addEventListener('click', stopAudio);
  if (closeAudioBtn) closeAudioBtn.addEventListener('click', closeAudio);
  if (audioProgress) audioProgress.addEventListener('input', seekAudio);
  
  if (quranAudio) {
    quranAudio.addEventListener('ended', () => {
      isPlaying = false;
      updatePlayPauseButtons(false);
      stopAudioProgressUpdate();
      showToast('সূরা শেষ হয়েছে');
    });
    
    quranAudio.addEventListener('loadedmetadata', () => {
      if (audioProgress) audioProgress.value = 0;
      if (durationSpan) durationSpan.textContent = formatTime(quranAudio.duration);
    });
    
    quranAudio.addEventListener('error', () => {
      showToast('অডিও লোড করতে ব্যর্থ হয়েছে');
    });
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
  
  stopAudio();
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
  console.log('DOM loaded, initializing Quran page...');
  initTheme();
  loadSettings();
  loadSurahList();
  setupAudioListeners();
  
  if (settingsHeaderBtn) settingsHeaderBtn.addEventListener('click', openSettings);
  if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettings);
  if (reciterSelect) reciterSelect.addEventListener('change', saveSettings);
  if (showTranslationToggle) showTranslationToggle.addEventListener('change', saveSettings);
  if (touchModeToggle) touchModeToggle.addEventListener('change', saveSettings);
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
