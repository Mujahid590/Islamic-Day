document.addEventListener('DOMContentLoaded', () => {
  const compass = document.getElementById('compass');
  const needle = document.getElementById('needle');
  const kiblaMarker = document.getElementById('kiblaMarker');
  const currentDirection = document.getElementById('currentDirection');
  const kiblaDegrees = document.getElementById('kiblaDegrees');
  const locationCoords = document.getElementById('locationCoords');
  const locateBtn = document.getElementById('locateBtn');
  const locStatusBadge = document.getElementById('locStatusBadge');

  let kaabaLat = 21.4225;
  let kaabaLng = 39.8262;
  let kiblaAngle = 280; // বাংলাদেশের জন্য ডিফল্ট আনুমানিক কিবলার দিক

  // ইউজার লোকেশন হিসাব করা
  function calculateQibla(lat, lng) {
    const phiK = (kaabaLat * Math.PI) / 180;
    const lambdaK = (kaabaLng * Math.PI) / 180;
    const phi = (lat * Math.PI) / 180;
    const lambda = (lng * Math.PI) / 180;

    const y = Math.sin(lambdaK - lambda);
    const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);
    let qibla = Math.atan2(y, x) * (180 / Math.PI);
    qibla = (qibla + 360) % 360;
    return qibla;
  }

  // জিপিএস লোকেশন নেওয়া
  function getLocation() {
    if (navigator.geolocation) {
      locationCoords.textContent = "লোকেশন খোঁজা হচ্ছে...";
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          locationCoords.textContent = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
          locStatusBadge.textContent = "সক্রিয়";
          locStatusBadge.style.color = "var(--done)";
          
          kiblaAngle = calculateQibla(lat, lng);
          kiblaDegrees.textContent = kiblaAngle.toFixed(1);
          updateCompass(0);
        },
        (error) => {
          locationCoords.textContent = "লোকেশন পাওয়া যায়নি। ডিফল্ট ব্যবহার করা হচ্ছে।";
          locStatusBadge.textContent = "ব্যর্থ";
          kiblaDegrees.textContent = kiblaAngle.toFixed(1);
        },
        { enableHighAccuracy: true }
      );
    } else {
      locationCoords.textContent = "আপনার ব্রাউজার জিপিএস সমর্থন করে না।";
    }
  }

  locateBtn.addEventListener('click', getLocation);
  getLocation();

  // কম্পাস সেন্সর হ্যান্ডেল (মোবাইল ওরিয়েন্টেশন)
  function handleOrientation(event) {
    let heading = event.alpha; // iOS বা Android এর কম্পাস ডাটা
    if (event.webkitCompassHeading) {
      heading = event.webkitCompassHeading; // iOS এর জন্য
    }

    if (heading !== null && heading !== undefined) {
      updateCompass(heading);
    }
  }

  function updateCompass(heading) {
    const rotation = 360 - heading;
    compass.style.transform = `rotate(${rotation}deg)`;
    
    // কিবলার সুনির্দিষ্ট দিকে আইকন ও নিডেল সেট করা
    const needleRotation = heading;
    if (needle) needle.style.transform = `translate(-50%, -50%) rotate(${needleRotation}deg)`;
    
    const markerRotation = kiblaAngle;
    if (kiblaMarker) {
      kiblaMarker.style.transform = `translate(-50%, -50%) rotate(${markerRotation}deg) translateY(-100px)`;
    }

    currentDirection.textContent = `${Math.round(heading)}°`;
  }

  // ডিভাইস ওরিয়েন্টেশন পারমিশন চেক
  if (window.DeviceOrientationEvent) {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      locateBtn.addEventListener('click', () => {
        DeviceOrientationEvent.requestPermission()
          .then(response => {
            if (response === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation, true);
            }
          }).catch(console.error);
      });
    } else {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
  }
});
