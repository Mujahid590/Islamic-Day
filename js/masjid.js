// ========== MASJID LOCATOR SCRIPT ==========
document.addEventListener('DOMContentLoaded', () => {
  // ১. সেটিংসের থিম ও কালার সিঙ্ক করা
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

  const dhakaMosques = [
    { name: "বায়তুল মোকাররম জাতীয় মসজিদ", lat: 23.7312, lng: 90.4146, address: "পল্টন, ঢাকা" },
    { name: "স্টার মসজিদ", lat: 23.7229, lng: 90.3979, address: "আবুল খায়েরাত রোড, ঢাকা" },
    { name: "চকবাজার শাহী মসজিদ", lat: 23.7146, lng: 90.3979, address: "চকবাজার, ঢাকা" },
    { name: "খান মোহাম্মদ মৃধা মসজিদ", lat: 23.7237, lng: 90.3874, address: "লালবাগ, ঢাকা" },
    { name: "সাত গম্বুজ মসজিদ", lat: 23.7185, lng: 90.3892, address: "মোহাম্মদপুর, ঢাকা" },
    { name: "বিনত বিবির মসজিদ", lat: 23.7262, lng: 90.3934, address: "নারিন্দা, ঢাকা" },
    { name: "হোসেনি দালান", lat: 23.7218, lng: 90.3996, address: "বকশীবাজার, ঢাকা" }
  ];

  let userLat = null;
  let userLng = null;
  const locStatusBadge = document.getElementById('locStatusBadge');

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  function getNearbyMosques() {
    if (!userLat || !userLng) return dhakaMosques;
    
    const withDistance = dhakaMosques.map(mosque => ({
      ...mosque,
      distance: calculateDistance(userLat, userLng, mosque.lat, mosque.lng)
    }));
    
    return withDistance.sort((a, b) => a.distance - b.distance);
  }

  function renderMosques() {
    const container = document.getElementById('masjidList');
    const mosques = getNearbyMosques();
    
    container.innerHTML = mosques.map(mosque => `
      <div class="masjid-card">
        <div class="masjid-icon">🕌</div>
        <div class="masjid-info">
          <div class="masjid-name">${mosque.name}</div>
          <div class="masjid-address">📍 ${mosque.address}</div>
          ${mosque.distance !== undefined ? `<div class="masjid-distance">📏 ${mosque.distance.toFixed(2)} কিমি দূরে</div>` : ''}
        </div>
        <button class="map-btn" data-lat="${mosque.lat}" data-lng="${mosque.lng}">🗺 ম্যাপ</button>
      </div>
    `).join('');
    
    document.querySelectorAll('.map-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lat = parseFloat(btn.dataset.lat);
        const lng = parseFloat(btn.dataset.lng);
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        window.open(url, '_blank');
      });
    });
  }

  function getUserLocation() {
    const spinner = document.getElementById('loadingSpinner');
    spinner.style.display = 'block';
    
    if (!navigator.geolocation) {
      spinner.style.display = 'none';
      locStatusBadge.textContent = "ব্যর্থ";
      renderMosques();
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLat = position.coords.latitude;
        userLng = position.coords.longitude;
        spinner.style.display = 'none';
        locStatusBadge.textContent = "সক্রিয়";
        locStatusBadge.style.color = "var(--done)";
        renderMosques();
      },
      () => {
        spinner.style.display = 'none';
        locStatusBadge.textContent = "ডিফল্ট";
        renderMosques();
      },
      { enableHighAccuracy: true }
    );
  }

  renderMosques();
  document.getElementById('locateMasjidBtn').addEventListener('click', getUserLocation);
});
