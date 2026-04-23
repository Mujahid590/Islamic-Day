// ========== HADITH DATABASE ==========
const hadithDatabase = [
  { id: 1, category: "iman", source: "সহীহ মুসলিম", ref: "হাদিস নং: ২৬৯৭", arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ", translation: "নিশ্চয় আমলসমূহ নিয়তের উপর নির্ভরশীল।", explanation: "প্রত্যেক কাজের ফলাফল নির্ভর করে তার নিয়তের উপর। ভালো নিয়তে করা কাজের সওয়াবও বেশি।" },
  { id: 2, category: "ibadah", source: "সহীহ বুখারী", ref: "হাদিস নং: ৫০", arabic: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", translation: "যে ব্যক্তি ঈমান ও সওয়াবের আশায় রমজান মাসে রোজা রাখে, তার পূর্ববর্তী গুনাহ ক্ষমা করে দেওয়া হয়।", explanation: "রমজানের রোজা আল্লাহর সন্তুষ্টির জন্য রাখলে গুনাহ মাফ হয়।" },
  { id: 3, category: "akhlaq", source: "সহীহ বুখারী", ref: "হাদিস নং: ৬০১৮", arabic: "خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ", translation: "তোমাদের মধ্যে সেই সর্বোত্তম যে তার পরিবারের জন্য সর্বোত্তম।", explanation: "পরিবারের সাথে সদ্ব্যবহার করা একজন মুমিনের গুরুত্বপূর্ণ গুণ।" },
  { id: 4, category: "iman", source: "সহীহ মুসলিম", ref: "হাদিস নং: ২৫৬", arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", translation: "তোমাদের কেউ ততক্ষণ পর্যন্ত প্রকৃত মুমিন হতে পারবে না, যতক্ষণ না সে নিজের জন্য যা পছন্দ করে তার ভাইয়ের জন্যও তা পছন্দ করে।", explanation: "পরোপকারী ও অন্যের কল্যাণকামী হওয়া ঈমানের অংশ।" },
  { id: 5, category: "ibadah", source: "তিরমিযী", ref: "হাদিস নং: ২৬১০", arabic: "الدُّعَاءُ هُوَ الْعِبَادَةُ", translation: "দোয়া ইবাদতের মগজ।", explanation: "দোয়া একটি গুরুত্বপূর্ণ ইবাদত যা আল্লাহর সাথে সরাসরি সংযোগ স্থাপন করে।" },
  { id: 6, category: "akhlaq", source: "সহীহ বুখারী", ref: "হাদিস নং: ১৩", arabic: "لاَ يَزَالُ الْعَبْدُ فِي فَجْوَةٍ مَا دَامَ عَلَى الْحَيَاءِ", translation: "যতক্ষণ লজ্জা থাকে ততক্ষণ কল্যাণ থাকে।", explanation: "লজ্জা একটি গুরুত্বপূর্ণ নৈতিক গুণ যা মানুষকে পাপ থেকে বিরত রাখে।" },
  { id: 7, category: "iman", source: "সহীহ মুসলিম", ref: "হাদিস নং: ১৩৫", arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ", translation: "যে ব্যক্তি আল্লাহ ও শেষ দিনের প্রতি ঈমান রাখে, সে যেন ভালো কথা বলে অথবা চুপ থাকে।", explanation: "অপ্রয়োজনীয় ও খারাপ কথা বলা থেকে বিরত থাকা উচিত।" },
  { id: 8, category: "ibadah", source: "সহীহ বুখারী", ref: "হাদিস নং: ৫৭১", arabic: "الصَّلَاةُ نُورٌ", translation: "নামাজ হলো আলো।", explanation: "নামাজ মানুষকে পাপের অন্ধকার থেকে বের করে আনে এবং হেদায়েতের আলো দান করে।" },
  { id: 9, category: "akhlaq", source: "মুয়াত্তা মালিক", ref: "হাদিস নং: ১৬", arabic: "إِنَّمَا بُعِثْتُ لِأُتَمِّمَ مَكَارِمَ الْأَخْلَاقِ", translation: "আমাকে উত্তম চরিত্র পরিপূর্ণ করার জন্য প্রেরণ করা হয়েছে।", explanation: "নবীজির আগমনের মূল উদ্দেশ্য ছিল চরিত্রের উন্নয়ন।" },
  { id: 10, category: "iman", source: "সহীহ বুখারী", ref: "হাদিস নং: ১২", arabic: "مَنْ لَا يَرْحَمُ لَا يُرْحَمُ", translation: "যে দয়া করে না, তার প্রতি দয়া করা হয় না।", explanation: "অন্যদের প্রতি দয়া দেখানো ঈমানের পরিচয়।" }
];

let currentHadithIndex = 0;
let currentCategory = "all";
let favorites = JSON.parse(localStorage.getItem('hadith_favorites') || '[]');

function filterHadiths() {
  if (currentCategory === "all") return hadithDatabase;
  return hadithDatabase.filter(h => h.category === currentCategory);
}

function getCurrentFilteredHadiths() {
  return filterHadiths();
}

function displayHadith(index) {
  const filtered = getCurrentFilteredHadiths();
  if (filtered.length === 0) return;
  
  const hadith = filtered[index % filtered.length];
  document.getElementById('hadithSource').textContent = hadith.source;
  document.getElementById('hadithRef').textContent = hadith.ref;
  document.getElementById('hadithArabic').textContent = hadith.arabic;
  document.getElementById('hadithTranslation').textContent = hadith.translation;
  document.getElementById('hadithExplanation').textContent = hadith.explanation;
}

function nextHadith() {
  const filtered = getCurrentFilteredHadiths();
  currentHadithIndex = (currentHadithIndex + 1) % filtered.length;
  displayHadith(currentHadithIndex);
}

function addToFavorites() {
  const filtered = getCurrentFilteredHadiths();
  const hadith = filtered[currentHadithIndex];
  
  if (!favorites.some(f => f.id === hadith.id)) {
    favorites.push(hadith);
    localStorage.setItem('hadith_favorites', JSON.stringify(favorites));
    showToast("⭐ হাদিসটি ফেভারিটে যোগ করা হয়েছে");
    renderFavorites();
  } else {
    showToast("এই হাদিসটি ইতিমধ্যে ফেভারিটে আছে");
  }
}

function removeFromFavorites(id) {
  favorites = favorites.filter(f => f.id !== id);
  localStorage.setItem('hadith_favorites', JSON.stringify(favorites));
  renderFavorites();
  showToast("ফেভারিট থেকে সরানো হয়েছে");
}

function renderFavorites() {
  const favList = document.getElementById('favList');
  if (favorites.length === 0) {
    favList.innerHTML = '<div class="empty-fav">⭐ কোন হাদিস ফেভারিটে নেই</div>';
    return;
  }
  
  favList.innerHTML = favorites.map(fav => `
    <div class="fav-item" data-id="${fav.id}">
      <div class="fav-item-text">${fav.translation.substring(0, 60)}...</div>
      <div style="display: flex; justify-content: flex-end; margin-top: 6px;">
        <button class="remove-fav" data-id="${fav.id}" style="background:none; border:none; color:var(--red); font-size:0.7rem;">✖ সরান</button>
      </div>
    </div>
  `).join('');
  
  document.querySelectorAll('.fav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-fav')) return;
      const id = parseInt(item.dataset.id);
      const hadith = hadithDatabase.find(h => h.id === id);
      if (hadith) {
        const filtered = getCurrentFilteredHadiths();
        const newIndex = filtered.findIndex(h => h.id === id);
        if (newIndex !== -1) {
          currentHadithIndex = newIndex;
          displayHadith(currentHadithIndex);
        }
      }
    });
  });
  
  document.querySelectorAll('.remove-fav').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeFromFavorites(parseInt(btn.dataset.id));
    });
  });
}

function shareHadith() {
  const filtered = getCurrentFilteredHadiths();
  const hadith = filtered[currentHadithIndex];
  const shareText = `📚 হাদিস শরীফ\n\n${hadith.translation}\n\n${hadith.source} - ${hadith.ref}\n\nদ্বীন টাইম অ্যাপ থেকে শেয়ার করা হয়েছে।`;
  
  if (navigator.share) {
    navigator.share({ title: 'হাদিস শরীফ', text: shareText });
  } else {
    navigator.clipboard.writeText(shareText);
    showToast("📋 হাদিস কপি করা হয়েছে");
  }
}

function showToast(msg) {
  const existing = document.querySelector('.toast-msg');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function initCategoryTabs() {
  const tabs = document.querySelectorAll('.cat-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.cat;
      currentHadithIndex = 0;
      displayHadith(0);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCategoryTabs();
  displayHadith(0);
  renderFavorites();
  
  document.getElementById('nextHadithBtn').addEventListener('click', nextHadith);
  document.getElementById('shareHadithBtn').addEventListener('click', shareHadith);
  
  document.getElementById('clearFavBtn').addEventListener('click', () => {
    if (confirm('সব ফেভারিট হাদিস মুছে ফেলতে চান?')) {
      favorites = [];
      localStorage.setItem('hadith_favorites', JSON.stringify(favorites));
      renderFavorites();
      showToast("সব ফেভারিট সরানো হয়েছে");
    }
  });
});