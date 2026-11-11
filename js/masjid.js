// ========== LIVE GPS & GOOGLE MAPS MASJID LOCATOR ==========
document.addEventListener('DOMContentLoaded', () => {
  // ১. সেটিংসের থিম, রঙ ও ভাষা সিঙ্ক করা (কিবলা ও অন্যান্য পেজের মতো)
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

  // ইউজার লোকেশন দিয়ে গুগল ম্যাপ ও ডাইনামিক মসজিদ সার্চ আপডেট করা
  function updateLiveMapAndList(lat, lng) {
    locStatusBadge.textContent = "সক্রিয়";
    locStatusBadge.style.color = "var(--done)";

    // ১. Google Maps Embed URL আপডেট (ইউজারের লাইভ পজিশন কেন্দ্র করে আশপাশের মসজিদ সার্চ করবে)
    mapFrame.src = `https://www.google.com/maps/embed/v1/search?key=&q=mosque+near+${lat},${lng}&center=${lat},${lng}&zoom=15`;

    // ২. নিচে লাইভ তালিকা দেখানোর জন্য Google Maps Directions / Search লিঙ্ক সহ কার্ড জেনারেট করা
    // যেহেতু ব্রাউজারে সরাসরি Places API কি ছাড়া নিখুঁত লিস্ট ফেচ করা যায় না, তাই Google Maps Search URL দিয়ে ডাইনামিক লিস্ট ও ডিরেকশন বাটন তৈরি করা হলো:
    masjidListContainer.innerHTML = `
      <div class="masjid-card">
        <div class="masjid-icon">🕌</div>
        <div class="masjid-info">
          <div class="masjid-name">আপনার আশপাশের সকল মসজিদ</div>
          <div class="masjid-address">📍 বর্তমান জিপিএস অবস্থান (${lat.toFixed(4)}, ${lng.toFixed(4)})</div>
        </div>
        <a href="https://www.google.com/maps/search/mosque/@${lat},${lng},15z" target="_blank" class="map-btn">🗺 ম্যাপে দেখুন</a>
      </div>
      <div class="masjid-card">
        <div class="masjid-icon">🧭</div>
        <div class="masjid-info">
          <div class="masjid-name">নিকটস্থ মসজিদে যাওয়ার রাস্তা</div>
          <div class="masjid-address">টার্ন-বাই-টার্ন নেভিগেশন ও রুট</div>
        </div>
        <a href="https://www.google.com/maps/dir/?api=1&destination=mosque&travelmode=walking" target="_blank" class="map-btn">🚶‍♂️ রাস্তা দেখুন</a>
      </div>
    `;
  }

  // জিপিএস লোকেশন নেওয়া
  function getLiveLocation() {
    if (navigator.geolocation) {
      locStatusBadge.textContent = "খোঁজা হচ্ছে...";
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          updateLiveMapAndList(lat, lng);
        },
        () => {
          locStatusBadge.textContent = "ব্যর্থ";
          // ফেইল করলে ডিফল্ট ঢাকা (বায়তুল মোকাররম) লোকেشن দেখাবে
          updateLiveMapAndList(23.7312, 90.4146);
          masjidListContainer.innerHTML = `<div class="info-message">⚠️ জিপিএস অনুমতি পাওয়া যায়নি। ঢাকার ডিফল্ট ম্যাপ দেখানো হচ্ছে।</div>`;
        },
        { enableHighAccuracy: true }
      );
    } else {
      locStatusBadge.textContent = "অসমর্থিত";
      updateLiveMapAndList(23.7312, 90.4146);
    }
  }

  locateBtn.addEventListener('click', getLiveLocation);
  getLiveLocation(); // পেজ লোড হওয়ার সাথেই অটো কল হবে
});
