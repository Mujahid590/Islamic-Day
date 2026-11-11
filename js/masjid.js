// ========== LIVE GPS & GOOGLE MAPS ROUTE INTEGRATION ==========
document.addEventListener('DOMContentLoaded', () => {
  // ১. সেটিংসের থিম, রঙ ও ভাষা সিঙ্ক করা (অন্যান্য পেজের মতো)
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
  const fullMapBtn = document.getElementById('fullMapBtn');

  // ইউজার লোকেশন ম্যাপে সেট করা এবং ডিরেকশন লিংক তৈরি করা
  function updateMapWithLocation(lat, lng) {
    locStatusBadge.textContent = "সক্রিয়";
    locStatusBadge.style.color = "var(--done)";

    // গুগল ম্যাপ এমবেড ভিউ যেখানে আপনার লোকেশন কেন্দ্র করে আশপাশের সব মসজিদ পিন দেখাবে
    mapFrame.src = `https://maps.google.com/maps?q=mosque&sll=${lat},${lng}&sspn=0.05,0.05&t=m&z=15&output=embed`;
    
    // বড় ম্যাপে সরাসরি ওপেন করার লিংক
    fullMapBtn.href = `https://www.google.com/maps/search/mosque/@${lat},${lng},15z`;

    // নিচের তালিকা ও ডিরেকশন বাটন আপডেট
    masjidListContainer.innerHTML = `
      <div class="masjid-card">
        <div class="masjid-icon">🕌</div>
        <div class="masjid-info">
          <div class="masjid-name">আপনার আশপাশের সকল মসজিদ</div>
          <div class="masjid-address">📍 আপনার জিপিএস পিন (${lat.toFixed(4)}, ${lng.toFixed(4)})</div>
        </div>
        <a href="https://www.google.com/maps/search/mosque/@${lat},${lng},15z" target="_blank" class="map-btn">🗺 ম্যাপে দেখুন</a>
      </div>
      <div class="masjid-card">
        <div class="masjid-icon">🧭</div>
        <div class="masjid-info">
          <div class="masjid-name">নিকটস্থ মসজিদে যাওয়ার জিপিএস রুট</div>
          <div class="masjid-address">গুগল ম্যাপের মাধ্যমে লাইভ নেভিগেশন</div>
        </div>
        <a href="https://www.google.com/maps/dir/?api=1&destination=mosque&travelmode=walking" target="_blank" class="map-btn">🚶‍♂️ রুট দেখুন</a>
      </div>
    `;
  }

  // জিপিএস লোকেশন রিড করা
  function getLiveLocation() {
    if (navigator.geolocation) {
      locStatusBadge.textContent = "খোঁজা হচ্ছে...";
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          updateMapWithLocation(lat, lng);
        },
        () => {
          locStatusBadge.textContent = "ব্যর্থ";
          // লোকেشن না পেলে ডিফল্ট ঢাকা (বায়তুল মোকাররম) পিন দেখাবে
          updateMapWithLocation(23.7312, 90.4146);
          masjidListContainer.innerHTML = `<div class="info-message">⚠️ জিপিএস অনুমতি পাওয়া যায়নি। ঢাকার ডিফল্ট ম্যাপ এলাকা দেখানো হচ্ছে।</div>`;
        },
        { enableHighAccuracy: true }
      );
    } else {
      locStatusBadge.textContent = "অসমর্থিত";
      updateMapWithLocation(23.7312, 90.4146);
    }
  }

  locateBtn.addEventListener('click', getLiveLocation);
  getLiveLocation(); // পেজ ওপেন হওয়ার সাথে সাথেই লাইভ লোকেশন নিয়ে ম্যাপ লোড হবে
});
