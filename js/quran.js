let currentSurahId = 1;
let allSurahs = [];
let currentFontSize = 16;

const demoFatiha = {
    id: 1, name_ar: "الفاتحة", name_bn: "আল-ফাতিহা", ayat_count: 7,
    ayahs: [
        {number:1, arabic:"بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translation:"শুরু করছি আল্লাহর নামে যিনি পরম করুণাময় ও অতি দয়ালু।"},
        {number:2, arabic:"الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", translation:"সমস্ত প্রশংসা আল্লাহর জন্য, যিনি সমস্ত জগতের পালনকর্তা।"},
        {number:3, arabic:"الرَّحْمَٰنِ الرَّحِيمِ", translation:"যিনি পরম করুণাময় ও অতি দয়ালু।"},
        {number:4, arabic:"مَالِكِ يَوْمِ الدِّينِ", translation:"যিনি বিচার দিনের মালিক।"},
        {number:5, arabic:"إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", translation:"আমরা শুধুমাত্র তোমারই ইবাদত করি এবং শুধুমাত্র তোমারই সাহায্য প্রার্থনা করি।"},
        {number:6, arabic:"اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", translation:"আমাদেরকে সরল পথ দেখাও।"},
        {number:7, arabic:"صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ", translation:"তাদের পথ, যাদেরকে তুমি নেয়ামত দান করেছ।"}
    ]
};

function showDemoFatiha() {
    let viewer = document.getElementById('ayahViewer');
    let ayahsHtml = `<div class="surah-header"><h2>${demoFatiha.name_ar}</h2><p>${demoFatiha.name_bn} • ${demoFatiha.ayat_count} আয়াত</p></div>`;
    demoFatiha.ayahs.forEach(ayah => {
        ayahsHtml += `<div class="ayah-card" data-ayah="${ayah.number}">
            <div class="ayah-number">আয়াত: ${ayah.number}</div>
            <div class="ayah-arabic">${ayah.arabic}</div>
            <div class="ayah-translation">${ayah.translation}</div>
        </div>`;
    });
    viewer.innerHTML = ayahsHtml;
    updateFontSizeDisplay();
}

function renderSurahList(surahs) {
    let container = document.getElementById('surahList');
    if (!container) return;
    container.innerHTML = '';
    surahs.forEach(surah => {
        let div = document.createElement('div');
        div.className = 'surah-item';
        if (currentSurahId === surah.id) div.classList.add('active');
        div.setAttribute('data-surah-id', surah.id);
        div.innerHTML = `<div class="surah-number">${surah.id}</div>
            <div class="surah-name">
                <div class="surah-name-ar">${surah.name_ar}</div>
                <div class="surah-name-bn">${surah.name_bn}</div>
            </div>
            <div class="surah-ayat">${surah.ayat_count}</div>`;
        div.addEventListener('click', () => loadSurah(surah.id));
        container.appendChild(div);
    });
}

function loadSurah(surahId) {
    currentSurahId = surahId;
    document.querySelectorAll('.surah-item').forEach(item => {
        item.classList.remove('active');
        if (parseInt(item.dataset.surahId) === surahId) item.classList.add('active');
    });
    
    let viewer = document.getElementById('ayahViewer');
    viewer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-pulse"></i> লোড হচ্ছে...</div>';
    
    if (surahId === 1) {
        showDemoFatiha();
    } else {
        let surah = allSurahs.find(s => s.id === surahId);
        let ayahsHtml = `<div class="surah-header"><h2>${surah?.name_ar || 'সূরা'}</h2><p>${surah?.name_bn || 'সূরা'} • আয়াত সমূহ</p></div>`;
        ayahsHtml += `<div class="empty-view"><i class="fas fa-info-circle"></i><p>সম্পূর্ণ কুরআনের জন্য API সংযোগ প্রয়োজন</p><p>বর্তমানে শুধু আল-ফাতিহা উপলব্ধ</p></div>`;
        viewer.innerHTML = ayahsHtml;
    }
    updateFontSizeDisplay();
    saveReadingProgress(surahId, surahId === 1 ? 'আল-ফাতিহা' : 'সূরা', 1);
}

function updateFontSizeDisplay() {
    document.querySelectorAll('.ayah-arabic').forEach(el => el.style.fontSize = currentFontSize + 'px');
    document.querySelectorAll('.ayah-translation').forEach(el => el.style.fontSize = (currentFontSize * 0.65) + 'px');
}

function saveReadingProgress(surahId, surahName, ayahNumber) {
    localStorage.setItem('lastReadQuran', JSON.stringify({ surahId, surahName, ayahNumber }));
    document.getElementById('lastReadInfo').innerHTML = `${surahName}, আয়াত ${ayahNumber}`;
}

function loadReadingProgress() {
    let saved = localStorage.getItem('lastReadQuran');
    if (saved) {
        let p = JSON.parse(saved);
        document.getElementById('lastReadInfo').innerHTML = `${p.surahName}, আয়াত ${p.ayahNumber}`;
        document.getElementById('continueReadingBtn').onclick = () => loadSurah(p.surahId);
    }
}

function initFontSizeControl() {
    let savedSize = localStorage.getItem('ayahFontSize');
    if (savedSize) currentFontSize = parseInt(savedSize);
    
    let decreaseBtn = document.getElementById('decreaseFont');
    let increaseBtn = document.getElementById('increaseFont');
    let fontSizeValue = document.getElementById('fontSizeValue');
    
    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', () => {
            if (currentFontSize > 10) { 
                currentFontSize--; 
                updateFontSizeDisplay(); 
                localStorage.setItem('ayahFontSize', currentFontSize);
                if (fontSizeValue) fontSizeValue.innerText = currentFontSize;
            }
        });
    }
    if (increaseBtn) {
        increaseBtn.addEventListener('click', () => {
            if (currentFontSize < 28) { 
                currentFontSize++; 
                updateFontSizeDisplay(); 
                localStorage.setItem('ayahFontSize', currentFontSize);
                if (fontSizeValue) fontSizeValue.innerText = currentFontSize;
            }
        });
    }
    if (fontSizeValue) fontSizeValue.innerText = currentFontSize;
}

function loadSurahList() {
    let container = document.getElementById('surahList');
    for (let i = 1; i <= 114; i++) {
        allSurahs.push({
            id: i,
            name_ar: i === 1 ? "الفاتحة" : `سورة ${i}`,
            name_bn: i === 1 ? "আল-ফাতিহা" : `সূরা ${i}`,
            ayat_count: i === 1 ? 7 : 100
        });
    }
    renderSurahList(allSurahs);
    let totalSpan = document.getElementById('totalSurahCount');
    let searchSpan = document.getElementById('searchCount');
    if (totalSpan) totalSpan.innerText = allSurahs.length;
    if (searchSpan) searchSpan.innerText = `${allSurahs.length} টি সূরা`;
}

function initSearch() {
    let searchInput = document.getElementById('surahSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            let term = e.target.value.toLowerCase();
            let filtered = allSurahs.filter(s => s.name_bn.toLowerCase().includes(term) || s.name_ar.toLowerCase().includes(term) || s.id.toString().includes(term));
            renderSurahList(filtered);
            let searchSpan = document.getElementById('searchCount');
            if (searchSpan) searchSpan.innerText = `${filtered.length} টি সূরা`;
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadSurahList();
    initSearch();
    loadReadingProgress();
    initFontSizeControl();
    showDemoFatiha();
});