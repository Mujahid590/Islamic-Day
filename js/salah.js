// নামাজের সময়সূচি
const prayerSchedule = [
    { id: "fajr", nameBn: "ফজর", nameAr: "صلاة الفجر", icon: "fa-cloud-moon", start: "05:00 AM", end: "06:15 AM" },
    { id: "dhuhr", nameBn: "যোহর", nameAr: "صلاة الظهر", icon: "fa-sun", start: "12:30 PM", end: "03:45 PM" },
    { id: "asr", nameBn: "আসর", nameAr: "صلاة العصر", icon: "fa-cloud-sun", start: "04:00 PM", end: "05:45 PM" },
    { id: "maghrib", nameBn: "মাগরিব", nameAr: "صلاة المغرب", icon: "fa-moon", start: "06:15 PM", end: "07:15 PM" },
    { id: "isha", nameBn: "এশা", nameAr: "صلاة العشاء", icon: "fa-stars", start: "07:45 PM", end: "11:59 PM" }
];

// স্টার স্ট্যাটাস লোড ও সেভ
let prayerStars = {};

function loadStars() {
    const saved = localStorage.getItem('namazStars');
    if (saved) {
        prayerStars = JSON.parse(saved);
    } else {
        prayerSchedule.forEach(p => { prayerStars[p.id] = false; });
    }
    updateAchievement();
}

function saveStars() {
    localStorage.setItem('namazStars', JSON.stringify(prayerStars));
    updateAchievement();
}

function toggleStar(prayerId) {
    prayerStars[prayerId] = !prayerStars[prayerId];
    saveStars();
    renderPrayers();
    showToast(prayerStars[prayerId] ? '⭐ নামাজ সম্পন্ন হিসেবে চিহ্নিত করা হয়েছে!' : '⭐ স্টার সরানো হয়েছে', 'success');
}

function getCompletedCount() {
    return Object.values(prayerStars).filter(v => v === true).length;
}

function updateAchievement() {
    const completed = getCompletedCount();
    const total = prayerSchedule.length;
    const achievementDiv = document.getElementById('achievementSection');
    const progressBar = document.getElementById('progressBar');
    const completedSpan = document.getElementById('completedCount');
    
    if (completedSpan) completedSpan.innerText = completed;
    if (progressBar) progressBar.style.width = `${(completed / total) * 100}%`;
    
    if (completed === total) {
        if (achievementDiv) achievementDiv.style.display = 'block';
        // গিফট/ট্রফি দেখানোর পর একটি টোস্ট
        if (!localStorage.getItem('achievementShownToday')) {
            showToast('🎉 অভিনন্দন! আজকের সব নামাজ সম্পন্ন করেছেন! আল্লাহ আপনার ইবাদত কবুল করুন!', 'success');
            localStorage.setItem('achievementShownToday', new Date().toDateString());
        }
    } else {
        if (achievementDiv) achievementDiv.style.display = 'none';
    }
}

function resetAllStars() {
    if (confirm('সব নামাজের স্টার রিসেট করতে চান?')) {
        prayerSchedule.forEach(p => { prayerStars[p.id] = false; });
        saveStars();
        renderPrayers();
        showToast('সব স্টার রিসেট করা হয়েছে', 'info');
    }
}

function timeToMinutes(timeStr) {
    let [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    else if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
}

function getCurrentMinutes() {
    let now = new Date();
    return now.getHours() * 60 + now.getMinutes();
}

function getStatus(prayerStart, prayerEnd, currentMins, prayerId) {
    if (prayerStars[prayerId]) return "completed";
    let startMins = timeToMinutes(prayerStart);
    let endMins = timeToMinutes(prayerEnd);
    if (currentMins >= startMins && currentMins < endMins) return "active";
    else if (currentMins >= endMins) return "ended";
    else return "upcoming";
}

function getNextPrayer() {
    let currentMins = getCurrentMinutes();
    for (let prayer of prayerSchedule) {
        if (currentMins < timeToMinutes(prayer.start)) return prayer;
    }
    return prayerSchedule[0];
}

function renderPrayers() {
    let currentMins = getCurrentMinutes();
    let container = document.getElementById("prayerTimesList");
    if (!container) return;
    container.innerHTML = "";
    
    prayerSchedule.forEach(p => {
        let status = getStatus(p.start, p.end, currentMins, p.id);
        let statusText = "", statusClass = "";
        if (status === "active") { statusText = "চলমান"; statusClass = "status-active"; }
        else if (status === "ended") { statusText = "সময় শেষ"; statusClass = "status-ended"; }
        else if (status === "completed") { statusText = "সম্পন্ন"; statusClass = "status-completed"; }
        else { statusText = "বাকি"; statusClass = "status-upcoming"; }
        
        const isStarred = prayerStars[p.id];
        
        container.innerHTML += `
            <div class="prayer-card ${p.id}">
                <div class="prayer-info">
                    <div class="prayer-icon">
                        <i class="fas ${p.icon}"></i>
                    </div>
                    <div class="prayer-details">
                        <div class="prayer-name">
                            <span class="prayer-name-bn">${p.nameBn}</span>
                            <span class="prayer-name-ar">${p.nameAr}</span>
                        </div>
                        <div class="prayer-times">
                            <span><i class="fas fa-play-circle"></i> শুরু: ${p.start}</span>
                            <span><i class="fas fa-stop-circle"></i> শেষ: ${p.end}</span>
                        </div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <button class="star-btn ${isStarred ? 'active' : ''}" data-id="${p.id}">
                        <i class="fas ${isStarred ? 'fa-star' : 'fa-star-o'}"></i>
                    </button>
                    <div class="status-badge ${statusClass}">${statusText}</div>
                </div>
            </div>
        `;
    });
    
    document.querySelectorAll('.star-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const prayerId = btn.dataset.id;
            toggleStar(prayerId);
        });
    });
}

function startCountdown() {
    setInterval(() => {
        const nextPrayer = getNextPrayer();
        if (nextPrayer) {
            document.getElementById('nextPrayerName').innerHTML = `${nextPrayer.nameBn} <span style="font-family:'Uthman Taha Naskh';">(${nextPrayer.nameAr})</span>`;
            let now = new Date();
            let [time, modifier] = nextPrayer.start.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier === 'PM' && hours !== 12) hours += 12;
            else if (modifier === 'AM' && hours === 12) hours = 0;
            let prayerTime = new Date();
            prayerTime.setHours(hours, minutes, 0, 0);
            if (prayerTime < now) prayerTime.setDate(prayerTime.getDate() + 1);
            let diff = prayerTime - now;
            let hoursLeft = Math.floor(diff / (1000 * 60 * 60));
            let minutesLeft = Math.floor((diff % 3600000) / 60000);
            let secondsLeft = Math.floor((diff % 60000) / 1000);
            document.getElementById('countdownTimer').innerHTML = `${hoursLeft.toString().padStart(2,'0')}:${minutesLeft.toString().padStart(2,'0')}:${secondsLeft.toString().padStart(2,'0')}`;
        }
        renderPrayers();
    }, 1000);
}

function updateClock() {
    let now = new Date();
    let clockDiv = document.getElementById("liveClock");
    if (clockDiv) {
        let hours = now.getHours();
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        clockDiv.innerHTML = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')} ${ampm}`;
    }
}

function updateDate() {
    let dateDiv = document.getElementById("todayDate");
    if (dateDiv) {
        let now = new Date();
        let banglaDate = now.toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        dateDiv.innerHTML = `<i class="fas fa-calendar-alt"></i> ${banglaDate}`;
    }
}

function showToast(message, type = 'info') {
    const oldToasts = document.querySelectorAll('.toast');
    oldToasts.forEach(toast => toast.remove());
    let toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 2500);
}

function initSettingsPanel() {
    let settingsBtn = document.getElementById('settingsNavBtn');
    let settingsPanel = document.getElementById('settingsPanel');
    let closeSettings = document.getElementById('closeSettingsBtn');
    let reminderBtn = document.getElementById('enableReminderBtn');
    let resetStarsBtn = document.getElementById('resetStarsBtn');
    
    if (settingsBtn && settingsPanel) {
        settingsBtn.addEventListener('click', (e) => { e.stopPropagation(); settingsPanel.classList.toggle('open'); });
    }
    if (closeSettings && settingsPanel) {
        closeSettings.addEventListener('click', () => { settingsPanel.classList.remove('open'); });
    }
    if (reminderBtn) {
        reminderBtn.addEventListener('click', () => {
            if (Notification.permission === 'granted') showToast('রিমাইন্ডার সক্রিয় আছে!', 'success');
            else if (Notification.permission !== 'denied') Notification.requestPermission();
        });
    }
    if (resetStarsBtn) {
        resetStarsBtn.addEventListener('click', resetAllStars);
    }
    document.addEventListener('click', (e) => {
        if (settingsPanel && settingsPanel.classList.contains('open')) {
            if (!settingsPanel.contains(e.target) && e.target !== settingsBtn && !settingsBtn?.contains(e.target)) {
                settingsPanel.classList.remove('open');
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadStars();
    renderPrayers();
    startCountdown();
    updateClock();
    updateDate();
    initSettingsPanel();
    setInterval(updateClock, 1000);
    if (Notification.permission === 'default') setTimeout(() => Notification.requestPermission(), 5000);
});