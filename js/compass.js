let currentAlpha = 0, qiblaDirection = 0, userLat = null, userLng = null;
let compassActive = false;
const KAABA_LAT = 21.4225, KAABA_LNG = 39.8262;

// কিবলার দিক নির্ণয়
function calculateQibla(lat, lng) {
    let lat1 = lat * Math.PI / 180;
    let lng1 = lng * Math.PI / 180;
    let lat2 = KAABA_LAT * Math.PI / 180;
    let lng2 = KAABA_LNG * Math.PI / 180;
    let deltaLng = lng2 - lng1;
    let x = Math.sin(deltaLng) * Math.cos(lat2);
    let y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
    let bearing = Math.atan2(x, y) * 180 / Math.PI;
    return (bearing + 360) % 360;
}

// ইউজারের লোকেশন নেওয়া
function getUserLocationForQibla() {
    let statusSpan = document.getElementById('statusText');
    if (statusSpan) statusSpan.innerHTML = 'লোকেশন সংগ্রহ করা হচ্ছে...';
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLat = position.coords.latitude;
                userLng = position.coords.longitude;
                qiblaDirection = calculateQibla(userLat, userLng);
                
                let qiblaSpan = document.getElementById('qiblaDirection');
                let locationSpan = document.getElementById('userLocationInfo');
                
                if (qiblaSpan) qiblaSpan.innerHTML = `${Math.round(qiblaDirection)}° (${getDirectionText(qiblaDirection)})`;
                if (locationSpan) locationSpan.innerHTML = `${userLat.toFixed(4)}°, ${userLng.toFixed(4)}°`;
                
                startCompass();
            },
            (error) => {
                console.error('Location error:', error);
                let statusSpan = document.getElementById('statusText');
                if (statusSpan) {
                    if (error.code === 1) {
                        statusSpan.innerHTML = 'লোকেশন অনুমতি দিন';
                    } else {
                        statusSpan.innerHTML = 'লোকেশন পাওয়া যায়নি';
                    }
                }
                // ডিফল্ট অবস্থান (ঢাকা)
                userLat = 23.8103;
                userLng = 90.4125;
                qiblaDirection = calculateQibla(userLat, userLng);
                let qiblaSpan = document.getElementById('qiblaDirection');
                if (qiblaSpan) qiblaSpan.innerHTML = `${Math.round(qiblaDirection)}° (${getDirectionText(qiblaDirection)})`;
                startCompass();
            }
        );
    } else {
        let statusSpan = document.getElementById('statusText');
        if (statusSpan) statusSpan.innerHTML = 'জিওলোকেশন সাপোর্টেড নয়';
        userLat = 23.8103;
        userLng = 90.4125;
        qiblaDirection = calculateQibla(userLat, userLng);
        let qiblaSpan = document.getElementById('qiblaDirection');
        if (qiblaSpan) qiblaSpan.innerHTML = `${Math.round(qiblaDirection)}° (${getDirectionText(qiblaDirection)})`;
        startCompass();
    }
}

// ডিগ্রী থেকে দিকের নাম
function getDirectionText(degree) {
    const directions = ['উত্তর', 'উত্তর-পূর্ব', 'পূর্ব', 'দক্ষিণ-পূর্ব', 'দক্ষিণ', 'দক্ষিণ-পশ্চিম', 'পশ্চিম', 'উত্তর-পশ্চিম'];
    const index = Math.round(((degree + 22.5) % 360) / 45);
    return directions[index % 8];
}

// কম্পাস চালু করা
function startCompass() {
    if (window.DeviceOrientationEvent) {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            let statusSpan = document.getElementById('statusText');
            if (statusSpan) statusSpan.innerHTML = 'কম্পাস চালু করতে স্ক্রিনে ক্লিক করুন';
            
            // iOS এর জন্য পারমিশন নেওয়া
            const requestPermission = () => {
                DeviceOrientationEvent.requestPermission()
                    .then(response => {
                        if (response === 'granted') {
                            window.addEventListener('deviceorientation', handleOrientation);
                            compassActive = true;
                            let statusSpan = document.getElementById('statusText');
                            if (statusSpan) statusSpan.innerHTML = 'কম্পাস সক্রিয়';
                        }
                    })
                    .catch(console.error);
                document.body.removeEventListener('click', requestPermission);
            };
            document.body.addEventListener('click', requestPermission);
        } else {
            // অ্যান্ড্রয়েডের জন্য সরাসরি
            window.addEventListener('deviceorientation', handleOrientation);
            compassActive = true;
            let statusSpan = document.getElementById('statusText');
            if (statusSpan) statusSpan.innerHTML = 'কম্পাস সক্রিয়';
        }
    } else {
        let statusSpan = document.getElementById('statusText');
        if (statusSpan) statusSpan.innerHTML = 'কম্পাস সাপোর্টেড নয়';
    }
}

// ওরিয়েন্টেশন হ্যান্ডলার
function handleOrientation(event) {
    if (!compassActive) return;
    
    // alpha = যন্ত্রের ঘূর্ণন (0-360 ডিগ্রী)
    currentAlpha = event.alpha || 0;
    
    // কিবলার সাথে বর্তমান দিকের পার্থক্য
    let diff = qiblaDirection - currentAlpha;
    let normalizedDiff = ((diff % 360) + 360) % 360;
    
    // কম্পাস আঁকা
    drawCompass(currentAlpha);
    
    // বর্তমান দিক দেখানো
    let currentDirSpan = document.getElementById('currentDirection');
    if (currentDirSpan) {
        let currentDirText = getDirectionText(currentAlpha);
        currentDirSpan.innerHTML = `${Math.round(currentAlpha)}° (${currentDirText})`;
    }
    
    // কিবলার দিকে আছে কিনা চেক করা
    let statusSpan = document.getElementById('statusText');
    if (statusSpan) {
        if (Math.abs(normalizedDiff) <= 5 || Math.abs(normalizedDiff - 360) <= 5) {
            statusSpan.innerHTML = '✓ কিবলার দিকে মুখ করে আছেন!';
            statusSpan.style.color = '#2a9d6e';
        } else if (Math.abs(normalizedDiff) <= 15 || Math.abs(normalizedDiff - 360) <= 15) {
            statusSpan.innerHTML = `প্রায় কিবলার দিকে (${Math.round(normalizedDiff)}° বাকি)`;
            statusSpan.style.color = '#e6b800';
        } else {
            statusSpan.innerHTML = `কিবলার দিকে ঘুরুন (${Math.round(normalizedDiff)}° বাকি)`;
            statusSpan.style.color = '#e53e3e';
        }
    }
}

// কম্পাস আঁকা
function drawCompass(alpha) {
    let canvas = document.getElementById('compassCanvas');
    if (!canvas) return;
    
    let ctx = canvas.getContext('2d');
    let width = canvas.width, height = canvas.height;
    let centerX = width / 2, centerY = height / 2;
    let radius = width / 2 - 10;
    
    ctx.clearRect(0, 0, width, height);
    
    // বাইরের বৃত্ত
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // ডিগ্রী মার্কার (প্রতি 30 ডিগ্রীতে)
    for (let i = 0; i < 360; i += 30) {
        let rad = (i - alpha) * Math.PI / 180;
        let x1 = centerX + (radius - 15) * Math.sin(rad);
        let y1 = centerY - (radius - 15) * Math.cos(rad);
        let x2 = centerX + (radius - 5) * Math.sin(rad);
        let y2 = centerY - (radius - 5) * Math.cos(rad);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#666';
        ctx.stroke();
    }
    
    // দিক নির্দেশক (N, E, S, W)
    let dirs = ['N', 'E', 'S', 'W'];
    let angles = [0, 90, 180, 270];
    ctx.font = 'bold 14px Arial';
    
    for (let i = 0; i < 4; i++) {
        let rad = (angles[i] - alpha) * Math.PI / 180;
        let x = centerX + (radius - 25) * Math.sin(rad);
        let y = centerY - (radius - 25) * Math.cos(rad);
        ctx.fillStyle = '#333';
        ctx.fillText(dirs[i], x - 5, y + 5);
    }
    
    // কিবলা পয়েন্টার (সবুজ বৃত্ত)
    let qiblaRad = (qiblaDirection - alpha) * Math.PI / 180;
    let qiblaX = centerX + (radius - 10) * Math.sin(qiblaRad);
    let qiblaY = centerY - (radius - 10) * Math.cos(qiblaRad);
    
    ctx.beginPath();
    ctx.arc(qiblaX, qiblaY, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#2a9d6e';
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('🕋', qiblaX - 6, qiblaY + 5);
    
    // কিবলা লাইন
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(qiblaX, qiblaY);
    ctx.strokeStyle = '#2a9d6e';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // সূঁচ (লাল তীর)
    let needleRad = (0 - alpha) * Math.PI / 180;
    let needleX = centerX + (radius - 20) * Math.sin(needleRad);
    let needleY = centerY - (radius - 20) * Math.cos(needleRad);
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(needleX, needleY);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // সূঁচের মাথা
    let arrowRad = needleRad;
    let arrowX = needleX + 8 * Math.sin(arrowRad);
    let arrowY = needleY - 8 * Math.cos(arrowRad);
    
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(needleX - 5 * Math.sin(arrowRad + 0.5), needleY + 5 * Math.cos(arrowRad + 0.5));
    ctx.lineTo(needleX - 5 * Math.sin(arrowRad - 0.5), needleY + 5 * Math.cos(arrowRad - 0.5));
    ctx.fillStyle = 'red';
    ctx.fill();
    
    // কেন্দ্রের বৃত্ত
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
}

// রিক্যালিব্রেট
function calibrate() {
    let statusSpan = document.getElementById('statusText');
    if (statusSpan) {
        statusSpan.innerHTML = 'ক্যালিব্রেটিং... ফোনটি ৮ এর মত ঘোরান';
        statusSpan.style.color = '#e6b800';
    }
    
    // কম্পাস রিসেট
    if (window.DeviceOrientationEvent) {
        if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
            window.removeEventListener('deviceorientation', handleOrientation);
            window.addEventListener('deviceorientation', handleOrientation);
        }
    }
    
    // লোকেশন রিফ্রেশ
    getUserLocationForQibla();
    
    setTimeout(() => {
        let statusSpan = document.getElementById('statusText');
        if (statusSpan && statusSpan.innerHTML.includes('ক্যালিব্রেটিং')) {
            statusSpan.innerHTML = 'কম্পাস সক্রিয়';
            statusSpan.style.color = '';
        }
    }, 3000);
}

// পেজ লোড হলে
let calibrateBtn = document.getElementById('calibrateBtn');
if (calibrateBtn) calibrateBtn.addEventListener('click', calibrate);

// পেজ লোড হলে শুরু
getUserLocationForQibla();