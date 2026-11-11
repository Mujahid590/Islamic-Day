// ========== INTERACTIVE GOOGLE MAPS & LIVE ROUTE SCRIPT ==========
document.addEventListener('DOMContentLoaded', () => {
  // ১. সেটিংসের থিম, রঙ ও ভাষা সিঙ্ক করা
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

  const locStatusBadge = document.getElementById('locStatusBadge');
  const mapFrame = document.getElementById('mapFrame');
  const masjidListContainer = document.getElementById('masjidList');
  const locateBtn = document.getElementById('locateMasjidBtn');
  const openGoogleMapsApp = document.getElementById('openGoogleMapsApp');

  // ম্যাপ ও ডিরেকশন আপডেট করার ফাংশন
  function updateInteractiveMap(lat, lng) {
    locStatusBadge.textContent = "সক্রিয়";
    locStatusBadge.style.color = "var(--done)";

    // সঠিক জুম লেভেল (z=16) এবং সার্চ কুয়েরি 'mosque' ব্যবহার করা হয়েছে যাতে আপনার এলাকার ছোট-বড় সব মসজিদ গুগল ম্যাপে পিন আকারে ভেসে ওঠে।
    // এই ম্যাপটি ব্যবহারকারী যেকোনো দিকে (ডানে, বামে, ওপরে, নিচে) স্লাইড করতে পারবেন এবং জুম করতে পারবেন।
    mapFrame.src = `https://www.google.com/maps/embed/v1/search?key=&q=mosque&center=${lat},${lng}&zoom=16`;

    // সরাসরি গুগল ম্যাপ অ্যাপে বা ব্রাউজারে ফুল স্ক্রিনে ওপেন করার লিংক
    openGoogleMapsApp.href = `https://www.google.com/maps/search/mosque/@${lat},${lng},16z`;

    // নিচে ডিরেকশন এবং রুট কার্ড জেনারেট করা
    masjidListContainer.innerHTML = `
      <div class="masjid-card">
        <div class="masjid-icon">🕌</div>
        <div class="masjid-info">
          <div class="masjid-name">আপনার বর্তমান এলাকার সকল মসজিদ</div>
          <div class="masjid-address">📍 জিপিএস পিন: (${lat.toFixed(4)}, ${lng.toFixed(4)})</div>
        </div>
        <a href="https://www.google.com/maps/search/mosque/@${lat},${lng},16z" target="_blank" class="map-btn">🗺 ম্যাপ দেখুন</a>
      </div>
      <div class="masjid-card">
        <div class="masjid-icon">🧭</div>
        <div class="masjid-info">
          <div class="masjid-name">নিকটস্থ মসজিদে যাওয়ার জিপিএস রুট</div>
          <div class="masjid-address">টার্ন-বাই-টার্ন নেভিগেশন চালু করুন</div>
        </div>
        <a href="https://www.google.com/maps/dir/?api=1&destination=mosque&travelmode=walking" target="_blank" class="map-btn">🚶‍♂️ রুট ও রাস্তা</a>
      </div>
    `;
  }

  // জিপিএস লোকেশন রিড করার ফাংশন
  function getLiveLocation() {
    if (navigator.geolocation) {
      locStatusBadge.textContent = "খোঁজা হচ্ছে...";
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          updateInteractiveMap(lat, lng);
        },
        () => {
          locStatusBadge.textContent = "ব্যর্থ";
          // লোকেশন না পেলে ঢাকার ডিফল্ট পিন (বায়তুল মোকাররম এলাকা) দেখাবে
          updateInteractiveMap(23.7312, 90.4146);
          masjidListContainer.innerHTML = `<div class="info-message">⚠️ জিপিএস অনুমতি পাওয়া যায়নি। ঢাকার ডিফল্ট এলাকার ম্যাপ দেখানো হচ্ছে।</div>`;
        },
        { enableHighAccuracy: true }
      );
    } else {
      locStatusBadge.textContent = "অসমর্থিত";
      updateInteractiveMap(23.7312, 90.4146);
    }
  }

  locateBtn.addEventListener('click', getLiveLocation);
  getLiveLocation(); // পেজ ওপেন হওয়ার সাথে সাথেই ইউজার লোকেশন নিয়ে ম্যাপ লোড হবে
});
