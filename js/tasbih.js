// js/tasbih.js
// তাসবিহ কাউন্টার লজিক
let currentCount = 0;
let stepCounts = {
    step1: 0,
    step2: 0,
    step3: 0
};
let currentStep = 1;
const stepLimits = { step1: 33, step2: 33, step3: 34 };

// সোয়াইপ নেভিগেশন
let touchStartX = 0;
let touchEndX = 0;

function navigateToPage(url) {
    window.location.href = url;
}

function handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) < swipeThreshold) return;
    
    if (swipeDistance > 0) {
        // বাম থেকে ডানে সোয়াইপ (ডান দিকে swipe) - প্রোফাইল পেজ
        navigateToPage('profile.html');
    } else {
        // ডান থেকে বামে সোয়াইপ (বাম দিকে swipe) - হোম পেজ
        navigateToPage('index.html');
    }
}

const counterElement = document.getElementById('counter');
const countBtn = document.getElementById('countBtn');
const resetBtn = document.getElementById('resetBtn');
const step1Count = document.getElementById('step1Count');
const step2Count = document.getElementById('step2Count');
const step3Count = document.getElementById('step3Count');

function updateDisplay() {
    counterElement.textContent = currentCount;
    step1Count.textContent = stepCounts.step1;
    step2Count.textContent = stepCounts.step2;
    step3Count.textContent = stepCounts.step3;
    
    // স্টেপ কমপ্লিটেড স্টাইল
    const step1El = document.getElementById('step1');
    const step2El = document.getElementById('step2');
    const step3El = document.getElementById('step3');
    
    if (stepCounts.step1 >= stepLimits.step1) step1El.classList.add('completed');
    else step1El.classList.remove('completed');
    
    if (stepCounts.step2 >= stepLimits.step2) step2El.classList.add('completed');
    else step2El.classList.remove('completed');
    
    if (stepCounts.step3 >= stepLimits.step3) step3El.classList.add('completed');
    else step3El.classList.remove('completed');
}

function saveToLocalStorage() {
    localStorage.setItem('tasbihCurrentCount', currentCount);
    localStorage.setItem('tasbihStep1Count', stepCounts.step1);
    localStorage.setItem('tasbihStep2Count', stepCounts.step2);
    localStorage.setItem('tasbihStep3Count', stepCounts.step3);
    localStorage.setItem('tasbihCurrentStep', currentStep);
}

function loadFromLocalStorage() {
    const savedCurrentCount = localStorage.getItem('tasbihCurrentCount');
    const savedStep1 = localStorage.getItem('tasbihStep1Count');
    const savedStep2 = localStorage.getItem('tasbihStep2Count');
    const savedStep3 = localStorage.getItem('tasbihStep3Count');
    const savedStep = localStorage.getItem('tasbihCurrentStep');

    if (savedCurrentCount !== null) currentCount = parseInt(savedCurrentCount);
    if (savedStep1 !== null) stepCounts.step1 = parseInt(savedStep1);
    if (savedStep2 !== null) stepCounts.step2 = parseInt(savedStep2);
    if (savedStep3 !== null) stepCounts.step3 = parseInt(savedStep3);
    if (savedStep !== null) currentStep = parseInt(savedStep);

    updateDisplay();
}

function resetAll() {
    if (confirm('সকল তাসবিহ রিসেট করতে চান?')) {
        currentCount = 0;
        stepCounts = { step1: 0, step2: 0, step3: 0 };
        currentStep = 1;
        updateDisplay();
        saveToLocalStorage();
        showToast('সকল তাসবিহ রিসেট করা হয়েছে');
    }
}

function incrementCount() {
    currentCount++;
    
    if (currentStep === 1) {
        stepCounts.step1++;
        if (stepCounts.step1 >= stepLimits.step1) {
            currentStep = 2;
            showToast('সুবহানাল্লাহ সম্পূর্ণ! এখন আলহামদুলিল্লাহ');
        }
    } else if (currentStep === 2) {
        stepCounts.step2++;
        if (stepCounts.step2 >= stepLimits.step2) {
            currentStep = 3;
            showToast('আলহামদুলিল্লাহ সম্পূর্ণ! এখন আল্লাহু আকবার');
        }
    } else if (currentStep === 3) {
        stepCounts.step3++;
        if (stepCounts.step3 >= stepLimits.step3) {
            showToast('আলহামদুলিল্লাহ! আপনার তাসবিহ সম্পূর্ণ হয়েছে 🎉');
            setTimeout(() => {
                if (confirm('তাসবিহ সম্পূর্ণ হয়েছে! নতুন করে শুরু করবেন?')) {
                    resetAll();
                }
            }, 500);
        }
    }
    
    updateDisplay();
    saveToLocalStorage();
    
    // অ্যানিমেশন
    counterElement.style.transform = 'scale(1.1)';
    setTimeout(() => {
        counterElement.style.transform = 'scale(1)';
    }, 200);
}

function showToast(message) {
    let toast = document.querySelector('.toast');
    if (toast) toast.remove();
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// ডার্ক/লাইট থিম ফাংশন
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

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    
    countBtn.addEventListener('click', incrementCount);
    resetBtn.addEventListener('click', resetAll);
    
    setActiveNavItem();

    // সোয়াইপ নেভিগেশন ইভেন্ট লিসেনার
    const container = document.getElementById('mobileContainer');
    if (container && window.innerWidth <= 768) {
        container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
    }

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

    initTheme();
});