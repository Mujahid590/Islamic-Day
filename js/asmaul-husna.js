// ========== ASMAUL HUSNA DATABASE ==========
const asmaulHusna = [
  { number: 1, arabic: "الرَّحْمَٰنُ", bangla: "আর-রাহমান", meaning: "পরম করুণাময়", benefit: "যে ব্যক্তি বেশি বেশি আর-রাহমান পড়বে, আল্লাহ তাকে দয়া ও করুণার অধিকারী করবেন।" },
  { number: 2, arabic: "الرَّحِيمُ", bangla: "আর-রাহিম", meaning: "অতি দয়ালু", benefit: "আর-রাহিম পাঠ করলে আল্লাহর বিশেষ দয়া লাভ হয়।" },
  { number: 3, arabic: "الْمَلِكُ", bangla: "আল-মালিক", meaning: "সার্বভৌম রাজা", benefit: "আল-মালিক পাঠ করলে আত্মমর্যাদা বৃদ্ধি পায়।" },
  { number: 4, arabic: "الْقُدُّوسُ", bangla: "আল-কুদ্দুস", meaning: "পবিত্র ও মহান", benefit: "আল-কুদ্দুস পাঠ করলে অন্তর পবিত্র হয়।" },
  { number: 5, arabic: "السَّلَامُ", bangla: "আস-সালাম", meaning: "শান্তিদাতা", benefit: "আস-সালাম পাঠ করলে মানসিক প্রশান্তি লাভ হয়।" },
  { number: 6, arabic: "الْمُؤْمِنُ", bangla: "আল-মু'মিন", meaning: "নিরাপত্তাদাতা", benefit: "আল-মু'মিন পাঠ করলে নিরাপত্তা লাভ হয়।" },
  { number: 7, arabic: "الْمُهَيْمِنُ", bangla: "আল-মুহাইমিন", meaning: "রক্ষণাবেক্ষণকারী", benefit: "আল-মুহাইমিন পাঠ করলে আল্লাহর হিফাজত লাভ হয়।" },
  { number: 8, arabic: "الْعَزِيزُ", bangla: "আল-আজিজ", meaning: "পরাক্রমশালী", benefit: "আল-আজিজ পাঠ করলে সম্মান ও মর্যাদা বৃদ্ধি পায়।" },
  { number: 9, arabic: "الْجَبَّارُ", bangla: "আল-জাব্বার", meaning: "শক্তিশালী", benefit: "আল-জাব্বার পাঠ করলে শত্রুর ভয় দূর হয়।" },
  { number: 10, arabic: "الْمُتَكَبِّرُ", bangla: "আল-মুতাকাব্বির", meaning: "মহিমান্বিত", benefit: "আল-মুতাকাব্বির পাঠ করলে অহংকার দূর হয়।" },
  { number: 11, arabic: "الْخَالِقُ", bangla: "আল-খালিক", meaning: "সৃষ্টিকর্তা", benefit: "আল-খালিক পাঠ করলে সৃষ্টির রহস্য বুঝতে সাহায্য করে।" },
  { number: 12, arabic: "الْبَارِئُ", bangla: "আল-বারি", meaning: "সৃষ্টিকারী", benefit: "আল-বারি পাঠ করলে রোগমুক্তি লাভ হয়।" },
  { number: 13, arabic: "الْمُصَوِّرُ", bangla: "আল-মুসাওয়ির", meaning: "আকারদাতা", benefit: "আল-মুসাওয়ির পাঠ করলে সন্তান লাভে সহায়ক।" },
  { number: 14, arabic: "الْغَفَّارُ", bangla: "আল-গাফফার", meaning: "ক্ষমাশীল", benefit: "আল-গাফফার পাঠ করলে গুনাহ মাফ হয়।" },
  { number: 15, arabic: "الْقَهَّارُ", bangla: "আল-কাহহার", meaning: "প্রভাবশালী", benefit: "আল-কাহহার পাঠ করলে কুপ্রবৃত্তি দমন হয়।" }
];

let filteredNames = [...asmaulHusna];

function renderNames(names) {
  const grid = document.getElementById('namesGrid');
  grid.innerHTML = names.map(name => `
    <div class="name-card" data-number="${name.number}">
      <div class="name-number">${name.number}</div>
      <div class="name-arabic">${name.arabic}</div>
      <div class="name-bangla">${name.bangla}</div>
      <div class="name-meaning">${name.meaning}</div>
    </div>
  `).join('');
  
  document.querySelectorAll('.name-card').forEach(card => {
    card.addEventListener('click', () => {
      const number = parseInt(card.dataset.number);
      const selected = asmaulHusna.find(n => n.number === number);
      showSelected(selected);
    });
  });
}

function showSelected(name) {
  const card = document.getElementById('selectedCard');
  document.getElementById('selectedArabic').textContent = name.arabic;
  document.getElementById('selectedName').textContent = name.bangla;
  document.getElementById('selectedMeaning').textContent = name.meaning;
  document.getElementById('selectedBenefit').textContent = name.benefit;
  card.style.display = 'block';
}

function hideSelected() {
  document.getElementById('selectedCard').style.display = 'none';
}

function searchNames() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  filteredNames = asmaulHusna.filter(name => 
    name.bangla.toLowerCase().includes(query) || 
    name.meaning.toLowerCase().includes(query) ||
    name.arabic.includes(query)
  );
  renderNames(filteredNames);
}

document.addEventListener('DOMContentLoaded', () => {
  renderNames(asmaulHusna);
  document.getElementById('searchInput').addEventListener('input', searchNames);
  document.getElementById('closeSelectedBtn').addEventListener('click', hideSelected);
  document.getElementById('selectedCard').addEventListener('click', (e) => {
    if (e.target === document.getElementById('selectedCard')) hideSelected();
  });
});