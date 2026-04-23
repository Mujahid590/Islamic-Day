// ========== MASJID LOCATOR SCRIPT ==========
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
        ${mosque.distance ? `<div class="masjid-distance">📏 ${mosque.distance.toFixed(2)} কিমি দূরে</div>` : ''}
      </div>
      <div class="masjid-actions">
        <button class="map-btn" data-lat="${mosque.lat}" data-lng="${mosque.lng}" data-name="${mosque.name}">🗺 ম্যাপ</button>
      </div>
    </div>
  `).join('');
  
  document.querySelectorAll('.map-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lat = parseFloat(btn.dataset.lat);
      const lng = parseFloat(btn.dataset.lng);
      const name = btn.dataset.name;
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
    document.getElementById('masjidList').innerHTML = '<div class="info-message">⚠️ জিওলোকেশন সাপোর্ট করে না</div>';
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLat = position.coords.latitude;
      userLng = position.coords.longitude;
      spinner.style.display = 'none';
      renderMosques();
      showToast("✅ আপনার অবস্থান অনুযায়ী মসজিদ দেখানো হচ্ছে");
    },
    (error) => {
      spinner.style.display = 'none';
      renderMosques();
      showToast("📍 অবস্থান অনুমতি না থাকায় ঢাকার মসজিদ দেখানো হচ্ছে");
    }
  );
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

document.addEventListener('DOMContentLoaded', () => {
  renderMosques();
  document.getElementById('locateMasjidBtn').addEventListener('click', getUserLocation);
});