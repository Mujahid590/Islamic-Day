document.addEventListener('DOMContentLoaded', () => {
  const compassDisc = document.getElementById('compassDisc');
  const kiblaMarker = document.getElementById('kiblaMarker');
  const currentDirection = document.getElementById('currentDirection');
  const kiblaDegrees = document.getElementById('kiblaDegrees');
  const locationCoords = document.getElementById('locationCoords');
  const locateBtn = document.getElementById('locateBtn');
  const locStatusBadge = document.getElementById('locStatusBadge');

  const kaabaLat = 21.4225;
  const kaabaLng = 39.8262;
  let kiblaAngle = 280; // বাংলাদেশে আনুমানিক ডিফল্ট কিবলা কোণ

  // কিবলা কোণ গণনা
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

  // কিবলা মার্কার পজিশন সেটআপ
  function positionKiblaMarker() {
    if (kiblaMarker) {
      kiblaMarker.style.transform = `translate(-50%, -50%) rotate(${kiblaAngle}deg) translateY(-100px)`;
    }
  }

  // লোকেশন প্রাপ্তি
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
          positionKiblaMarker();
        },
        () => {
          locationCoords.textContent = "লোকেশন পাওয়া যায়নি। ডিফল্ট ব্যবহার করা হচ্ছে।";
          locStatusBadge.textContent = "অফলাইন";
          kiblaDegrees.textContent = kiblaAngle.toFixed(1);
          positionKiblaMarker();
        },
        { enableHighAccuracy: true }
      );
    } else {
      locationCoords.textContent = "আপনার ডিভাইসে জিপিএস সমর্থিত নয়।";
      kiblaDegrees.textContent = kiblaAngle.toFixed(1);
      positionKiblaMarker();
    }
  }

  locateBtn.addEventListener('click', getLocation);
  getLocation();

  // ডিভাইস ঘোরালে পুরো কম্পাস ডিস্ক ঘোরানো (Dynamic Compass Handling)
  function handleOrientation(event) {
    let heading = event.alpha;

    if (event.webkitCompassHeading) {
      heading = event.webkitCompassHeading; // iOS-এর জন্য
    } else if (event.alpha !== null) {
      // Android-এর জন্য (Absolute Orientation fallback)
      heading = 360 - event.alpha;
    }

    if (heading !== null && heading !== undefined) {
      const roundedHeading = Math.round(heading);
      currentDirection.textContent = `${roundedHeading}°`;
      
      // ডাইনামিক কম্পাস ঘূর্ণন: ফোন ঘোরালে ডায়াল্টি উল্টো দিকে ঘুরে উত্তর দিক নির্দেশ করবে
      if (compassDisc) {
        compassDisc.style.transform = `rotate(${-heading}deg)`;
      }
    }
  }

  // সেন্সরের অনুভূতি পারমিশন পরীক্ষা (বিশেষ করে iOS-এর জন্য)
  if (window.DeviceOrientationEvent) {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      locateBtn.addEventListener('click', () => {
        DeviceOrientationEvent.requestPermission()
          .then(response => {
            if (response === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation, true);
            }
          })
          .catch(console.error);
      });
    } else {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
  }
});
