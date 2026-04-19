// js/main.js
let prayerTimesData = null;
let touchStartX = 0;
let touchEndX = 0;

const prayers = [
    { id: "Fajr", nameBn: "ফজর" },
    { id: "Dhuhr", nameBn: "যোহর" },
    { id: "Asr", nameBn: "আসর" },
    { id: "Maghrib", nameBn: "মাগরিব" },
    { id: "Isha", nameBn: "এশা" }
];

function navigateToPage(url) {
    window.location.href = url;
}

function handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) < swipeThreshold) return;
    
    if (swipeDistance > 0) {
        navigateToPage('tasbih.html');
    } else {
        navigateToPage('quran.html');
    }
}

function getCurrentTimeFormatted() {
    const now = new Date();
    let hours = now.getHours(), minutes = now.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

function getCurrentDateFormatted() {
    return new Date().toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function timeToMinutes(timeStr) {
    let clean = timeStr.split(' ')[0];
    let [h, m] = clean.split(':').map(Number);
    if (timeStr.includes('PM') && h !== 12) h += 12;
    if (timeStr.includes('AM') && h === 12) h = 0;
    return h * 60 + m;
}

function getCurrentMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
}

async function fetchPrayerTimes() {
    const today = new Date();
    const lat = 23.8103, lon = 90.4125;
    const url = `https://api.aladhan.com/v1/calendar/${today.getFullYear()}/${today.getMonth() + 1}?latitude=${lat}&longitude=${lon}&method=2`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.data) {
            prayerTimesData = data.data[today.getDate() - 1].timings;
            updateNamazInfo();
            return true;
        }
    } catch (e) {
        console.error(e);
        const prayerNameElem = document.getElementById('currentPrayerName');
        const prayerInfoElem = document.getElementById('prayerTimeInfo');
        if (prayerNameElem) prayerNameElem.innerText = 'নামাজ';
        if (prayerInfoElem) prayerInfoElem.innerHTML = 'সময় লোড করা যায়নি';
    }
    return false;
}

function updateNamazInfo() {
    if (!prayerTimesData) return;
    const nowMins = getCurrentMinutes();
    const times = [];
    
    const prayerOrder = [
        { id: "Fajr", name: "ফজর" },
        { id: "Dhuhr", name: "যোহর" },
        { id: "Asr", name: "আসর" },
        { id: "Maghrib", name: "মাগরিব" },
        { id: "Isha", name: "এশা" }
    ];
    
    for (let p of prayerOrder) {
        if (prayerTimesData[p.id]) {
            times.push({ name: p.name, mins: timeToMinutes(prayerTimesData[p.id]) });
        }
    }
    times.sort((a, b) => a.mins - b.mins);

    let current = null;
    let next = null;
    
    for (let i = 0; i < times.length; i++) {
        if (nowMins < times[i].mins) {
            next = times[i];
            current = i > 0 ? times[i - 1] : times[times.length - 1];
            break;
        }
    }
    if (!next) {
        current = times[times.length - 1];
        next = times[0];
    }

    const prayerNameElem = document.getElementById('currentPrayerName');
    const prayerInfoElem = document.getElementById('prayerTimeInfo');
    
    if (prayerNameElem) prayerNameElem.innerText = current ? current.name : 'নামাজ';
    
    if (next && prayerInfoElem) {
        let diffToNext = next.mins - nowMins;
        if (diffToNext < 0) diffToNext += 24 * 60;
        let hoursToNext = Math.floor(diffToNext / 60);
        let minutesToNext = diffToNext % 60;
        
        if (current && current.mins) {
            let currentEndDiff = current.mins - nowMins;
            if (currentEndDiff < 0) currentEndDiff += 24 * 60;
            
            // চলমান নামাজ শেষ হতে যত সময় বাকি
            if (currentEndDiff > 0 && currentEndDiff <= 60) {
                prayerInfoElem.innerHTML = `${current.name} শেষ হতে ${currentEndDiff} মিনিট বাকি`;
            } else if (currentEndDiff > 0 && currentEndDiff <= 120) {
                let ch = Math.floor(currentEndDiff / 60);
                let cm = currentEndDiff % 60;
                prayerInfoElem.innerHTML = `${current.name} শেষ হতে ${ch} ঘণ্টা ${cm} মিনিট বাকি`;
            } else {
                prayerInfoElem.innerHTML = `${next.name} শুরু হতে ${hoursToNext > 0 ? hoursToNext + ' ঘণ্টা ' : ''}${minutesToNext} মিনিট বাকি`;
            }
        } else {
            prayerInfoElem.innerHTML = `${next.name} শুরু হতে ${hoursToNext > 0 ? hoursToNext + ' ঘণ্টা ' : ''}${minutesToNext} মিনিট বাকি`;
        }
    }
}

function updateCurrentTime() {
    const timeDisplay = document.getElementById('currentTimeDisplay');
    const dateDisplay = document.getElementById('currentDate');
    if (timeDisplay) timeDisplay.innerHTML = getCurrentTimeFormatted();
    if (dateDisplay) dateDisplay.innerHTML = getCurrentDateFormatted();
}

function initTheme() {
    const saved = localStorage.getItem('islamicAppTheme');
    if (saved === 'dark') document.body.classList.add('dark-mode');
    const themeBtns = document.querySelectorAll('.theme-btn');
    themeBtns.forEach(btn => {
        const isDark = btn.dataset.theme === 'dark';
        const shouldBeActive = (isDark && saved === 'dark') || (!isDark && saved !== 'dark');
        if (shouldBeActive) btn.classList.add('active');
        else btn.classList.remove('active');
        
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            if (theme === 'dark') document.body.classList.add('dark-mode');
            else document.body.classList.remove('dark-mode');
            localStorage.setItem('islamicAppTheme', theme);
            themeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function togglePanel(panelId, show) {
    const panel = document.getElementById(panelId);
    const overlay = document.getElementById('overlay');
    if (!panel || !overlay) return;
    if (show) {
        panel.classList.add('open');
        overlay.classList.add('active');
    } else {
        panel.classList.remove('open');
        overlay.classList.remove('active');
    }
}

function setActiveNavItem() {
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.bottom-nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && href !== '#') {
            if (currentPath.includes(href)) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    await fetchPrayerTimes();
    setInterval(() => { if (prayerTimesData) updateNamazInfo(); }, 60000);
    
    setActiveNavItem();

    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    if (settingsBtn) settingsBtn.addEventListener('click', () => togglePanel('settingsPanel', true));
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', () => togglePanel('settingsPanel', false));

    const mobileSettingsBtn = document.getElementById('mobileSettingsBtn');
    if (mobileSettingsBtn) mobileSettingsBtn.addEventListener('click', () => togglePanel('settingsPanel', true));

    const mobileMoreBtn = document.getElementById('mobileMoreBtn');
    const desktopMoreBtn = document.getElementById('desktopMoreBtn');
    const closeMoreMenuBtn = document.getElementById('closeMoreMenuBtn');
    
    if (mobileMoreBtn) {
        mobileMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            togglePanel('moreMenuPanel', true);
        });
    }
    if (desktopMoreBtn) {
        desktopMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            togglePanel('moreMenuPanel', true);
        });
    }
    if (closeMoreMenuBtn) closeMoreMenuBtn.addEventListener('click', () => togglePanel('moreMenuPanel', false));

    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.addEventListener('click', () => {
            togglePanel('settingsPanel', false);
            togglePanel('moreMenuPanel', false);
        });
    }

    const container = document.querySelector('.mobile-container');
    if (container && window.innerWidth <= 768) {
        container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
    }

    initTheme();
});