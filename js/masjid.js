// ========== INTERACTIVE GOOGLE MAPS & LIVE ROUTE SCRIPT (No API Key Required) ==========
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
  const openGoogleMapsApp = document.getElementById('openGoogleMapsApp');

  // ম্যাপ ও ডিরেকশন আপডেট করার ফাংশন (কোনো এপিআই কি ছাড়াই কাজ করবে)
  function updateInteractiveMap(lat, lng) {
    locStatusBadge.textContent = "সক্রিয়";
    locStatusBadge.style.color = "var(--done)";

    // এপিআই কি ছাড়াই গুগল ম্যাপের অফিশিয়াল ভিউ লোড করার নিরাপদ লিংক
    mapFrame.src = `https://maps.google.com/maps?q=mosque&sll=${lat},${lng}&sspn=0.05,0.05&t=m&z=16&output=embed`;

    // ফুল স্ক্রিন বা গুগল ম্যাপ অ্যাপে ওপেন করার লিংক
    if (openGoogleMapsApp) {
      openGoogleMapsApp.href = `https://www.google.com/maps/search/mosque/@${lat},${lng},16z`;
    }

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
          updateInteractiveMap(23.7312, 90.4146); // লোকেশন না পেলে ডিফল্ট ঢাকা
          masjidListContainer.innerHTML = `<div class="info-message">⚠️ জিপিএস অনুমতি পাওয়া যায়নি। ঢাকার ডিফল্ট এলাকার ম্যাপ দেখানো হচ্ছে।</div>`;
        },
        { enableHighAccuracy: true }
      );
    } else {
      locStatusBadge.textContent = "অসমর্থিত";
      updateInteractiveMap(23.7312, 90.4146);
    }
  }

  if (locateBtn) {
    locateBtn.addEventListener('click', getLiveLocation);
  }
  getLiveLocation();
});
