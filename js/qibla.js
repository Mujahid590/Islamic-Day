// ========== QIBLA DIRECTION SCRIPT ==========
let currentHeading = 0;
let currentLat = null;
let currentLng = null;
let kiblaBearing = null;

// Kaaba coordinates (Mecca, Saudi Arabia)
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

function calculateBearing(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => deg * Math.PI / 180;
  const toDeg = (rad) => rad * 180 / Math.PI;
  
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);
  
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  let θ = Math.atan2(y, x);
  let bearing = toDeg(θ);
  return (bearing + 360) % 360;
}

function updateCompass() {
  const needle = document.getElementById('needle');
  const kiblaMarker = document.getElementById('kiblaMarker');
  const directionSpan = document.getElementById('currentDirection');
  const kiblaDegreesSpan = document.getElementById('kiblaDegrees');
  
  if (needle) {
    needle.style.transform = `translate(-50%, -50%) rotate(${currentHeading}deg)`;
  }
  
  if (kiblaMarker && kiblaBearing !== null) {
    const relativeKibla = (kiblaBearing - currentHeading + 360) % 360;
    kiblaMarker.style.transform = `translate(-50%, -50%) rotate(${relativeKibla}deg) translateY(-130px)`;
  }
  
  if (directionSpan) {
    directionSpan.textContent = `${Math.round(currentHeading)}°`;
  }
  
  if (kiblaDegreesSpan && kiblaBearing !== null) {
    kiblaDegreesSpan.textContent = Math.round(kiblaBearing);
  }
}

function startCompass() {
  if (!window.DeviceOrientationEvent) {
    document.getElementById('directionBadge').innerHTML = '<span>কম্পাস সাপোর্ট করে না</span>';
    return;
  }
  
  function handleOrientation(event) {
    if (event.webkitCompassHeading !== undefined) {
      currentHeading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
      currentHeading = 360 - event.alpha;
    }
    updateCompass();
  }
  
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    document.getElementById('locateBtn').addEventListener('click', async () => {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
          showToast("🧭 কম্পাস সক্রিয় হয়েছে");
        }
      } catch (e) {
        showToast("অনুমতি প্রয়োজন");
      }
    });
  } else {
    window.addEventListener('deviceorientation', handleOrientation);
  }
}

function getLocation() {
  if (!navigator.geolocation) {
    document.getElementById('locationCoords').textContent = 'জিওলোকেশন সাপোর্ট করে না';
    return;
  }
  
  document.getElementById('locationCoords').textContent = 'অবস্থান নির্ণয় করা হচ্ছে...';
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      currentLat = position.coords.latitude;
      currentLng = position.coords.longitude;
      
      kiblaBearing = calculateBearing(currentLat, currentLng, KAABA_LAT, KAABA_LNG);
      
      document.getElementById('locationCoords').innerHTML = `অক্ষাংশ: ${currentLat.toFixed(4)}°, দ্রাঘিমাংশ: ${currentLng.toFixed(4)}°`;
      document.getElementById('kiblaAngle').innerHTML = `কিবলা দিক: <span>${Math.round(kiblaBearing)}</span>°`;
      
      showToast("✅ অবস্থান নিশ্চিত করা হয়েছে");
      updateCompass();
    },
    (error) => {
      console.error('Geolocation error:', error);
      document.getElementById('locationCoords').textContent = 'অবস্থান পাওয়া যায়নি';
      showToast("অবস্থান অনুমতি প্রয়োজন");
      
      kiblaBearing = 278;
      document.getElementById('kiblaAngle').innerHTML = `কিবলা দিক: <span>${Math.round(kiblaBearing)}</span>°`;
      updateCompass();
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
  startCompass();
  getLocation();
  
  document.getElementById('locateBtn').addEventListener('click', getLocation);
});