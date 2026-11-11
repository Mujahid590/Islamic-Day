document.addEventListener('DOMContentLoaded', () => {
  // ১. সেটিংসের থিম, রঙ ও ভাষা সিঙ্ক করার জন্য লোকাল স্টোরেজ থেকে ডেটা লোড করা
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

  const compassDisc = document.getElementById('compassDisc');
  const kiblaMarker = document.getElementById('kiblaMarker');
  const currentDirection = document.getElementById('currentDirection');
  const kiblaDegrees = document.getElementById('kiblaDegrees');
  const locationCoords = document.getElementById('locationCoords');
  const locateBtn = document.getElementById('locateBtn');
  const locStatusBadge = document.getElementById('locStatusBadge');

  const kaabaLat = 21.4225;
  const kaabaLng = 39.8262;
  let kiblaAngle = 280; // ডিফল্ট কোণ (বাংলাদেশ এর জন্য)
  let userLat = 23.8103; // ডিফল্ট ঢাকা
  let userLng = 90.4125;

  // নিখুঁত কিবলা কোণ (Bearing) গণনার সঠিক স্ফেরিক্যাল ফর্মুলা
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

  // কিবলা মার্কার পজিশন আপডেট করা
  function updateKiblaMarkerPosition() {
    if (kiblaMarker) {
      // কম্পাসের ভেতরের উত্তর (0°) সাপেক্ষে কিবলার সঠিক কোণে মার্কার বসানো
      kiblaMarker.style.transform = `translate(-50%, -50%) rotate(${kiblaAngle}deg) translateY(-92px)`;
    }
  }

  // লোকেশন প্রাপ্তি
  function getLocation() {
    if (navigator.geolocation) {
      locationCoords.textContent = "লোকেশন খোঁজা হচ্ছে...";
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLat = position.coords.latitude;
          userLng = position.coords.longitude;
          locationCoords.textContent = `Lat: ${userLat.toFixed(4)}, Lng: ${userLng.toFixed(4)}`;
          locStatusBadge.textContent = "সক্রিয়";
          locStatusBadge.style.color = "var(--done)";
          
          kiblaAngle = calculateQibla(userLat, userLng);
          kiblaDegrees.textContent = kiblaAngle.toFixed(1);
          updateKiblaMarkerPosition();
        },
        () => {
          locationCoords.textContent = "লোকেশন পাওয়া যায়নি। ডিফল্ট (ঢাকা) ব্যবহৃত হচ্ছে।";
          locStatusBadge.textContent = "ডিফল্ট";
          kiblaAngle = calculateQibla(userLat, userLng);
          kiblaDegrees.textContent = kiblaAngle.toFixed(1);
          updateKiblaMarkerPosition();
        },
        { enableHighAccuracy: true }
      );
    } else {
      locationCoords.textContent = "আপনার ডিভাইসে জিপিএস সমর্থিত নয়।";
      kiblaAngle = calculateQibla(userLat, userLng);
      kiblaDegrees.textContent = kiblaAngle.toFixed(1);
      updateKiblaMarkerPosition();
    }
  }

  locateBtn.addEventListener('click', getLocation);
  getLocation();

  // ডিভাইস ওরিয়েন্টেশন হ্যান্ডেল (সঠিক দিক নির্দেশনার মূল লজিক)
  function handleOrientation(event) {
    let heading = null;

    if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
      heading = event.webkitCompassHeading; // iOS ডিভাইসের জন্য সঠিক নর্থ হেডিং
    } else if (event.alpha !== null) {
      heading = 360 - event.alpha; // অ্যান্ড্রয়েড ডিভাইসের জন্য
    }

    if (heading !== null && !isNaN(heading)) {
      const roundedHeading = Math.round(heading);
      currentDirection.textContent = `${roundedHeading}°`;
      
      // কম্পাস ডিস্ক ঘোরানো যাতে 'N' সবসময় উত্তর দিক নির্দেশ করে
      if (compassDisc) {
        compassDisc.style.transform = `rotate(${-heading}deg)`;
      }
    }
  }

  // ডিভাইস সেন্সর পারমিশন এবং ইভেন্ট বাইন্ডিং
  if (window.DeviceOrientationEvent) {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS 13+ পারমিশন রিকোয়েস্ট বাটন বা ইউজার ইন্টারেকশন
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
      // সাধারণ অ্যান্ড্রয়েড বা ব্রাউজার
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
  }
});
