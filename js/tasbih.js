// js/tasbih.js
let currentCount = 0;
let stepCounts = { step1: 0, step2: 0, step3: 0 };
let currentStep = 1;
const stepLimits = { step1: 33, step2: 33, step3: 34 };

let touchStartX = 0, touchEndX = 0;

function navigateToPage(url) { window.location.href = url; }

function handleSwipe() {
    const dist = touchEndX - touchStartX;
    if (Math.abs(dist) < 50) return;
    navigateToPage(dist > 0 ? 'profile.html' : 'index.html');
}

const counterElement = document.getElementById('counter');
const countBtn = document.getElementById('countBtn');
const resetBtn = document.getElementById('resetBtn');

function updateDisplay() {
    if (!counterElement) return;
    counterElement.textContent = currentCount;
    const s1 = document.getElementById('step1Count');
    const s2 = document.getElementById('step2Count');
    const s3 = document.getElementById('step3Count');
    if (s1) s1.textContent = stepCounts.step1;
    if (s2) s2.textContent = stepCounts.step2;
    if (s3) s3.textContent = stepCounts.step3;

    ['step1','step2','step3'].forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        const key = id;
        if (stepCounts[key] >= stepLimits[key]) {
            el.classList.add('completed');
            el.classList.remove('active-step');
        } else {
            el.classList.remove('completed');
        }
        el.classList.toggle('active-step', currentStep === i + 1 && stepCounts[key] < stepLimits[key]);
    });
}

function saveToLocalStorage() {
    localStorage.setItem('tasbihCurrentCount', currentCount);
    localStorage.setItem('tasbihStep1Count', stepCounts.step1);
    localStorage.setItem('tasbihStep2Count', stepCounts.step2);
    localStorage.setItem('tasbihStep3Count', stepCounts.step3);
    localStorage.setItem('tasbihCurrentStep', currentStep);
}

function loadFromLocalStorage() {
    currentCount = parseInt(localStorage.getItem('tasbihCurrentCount') || '0');
    stepCounts.step1 = parseInt(localStorage.getItem('tasbihStep1Count') || '0');
    stepCounts.step2 = parseInt(localStorage.getItem('tasbihStep2Count') || '0');
    stepCounts.step3 = parseInt(localStorage.getItem('tasbihStep3Count') || '0');
    currentStep = parseInt(localStorage.getItem('tasbihCurrentStep') || '1');
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
            showToast('সুবহানাল্লাহ সম্পূর্ণ! এখন আলহামদুলিল্লাহ ✨');
        }
    } else if (currentStep === 2) {
        stepCounts.step2++;
        if (stepCounts.step2 >= stepLimits.step2) {
            currentStep = 3;
            showToast('আলহামদুলিল্লাহ সম্পূর্ণ! এখন আল্লাহু আকবার ✨');
        }
    } else if (currentStep === 3) {
        stepCounts.step3++;
        if (stepCounts.step3 >= stepLimits.step3) {
            showToast('মাশাআল্লাহ! তাসবিহ সম্পূর্ণ হয়েছে 🎉');
            setTimeout(() => {
                if (confirm('তাসবিহ সম্পূর্ণ হয়েছে! নতুন করে শুরু করবেন?')) resetAll();
            }, 500);
        }
    }

    updateDisplay();
    saveToLocalStorage();

    // বাম্প অ্যানিমেশন
    if (counterElement) {
        counterElement.classList.remove('bump');
        void counterElement.offsetWidth;
        counterElement.classList.add('bump');
        setTimeout(() => counterElement.classList.remove('bump'), 350);
    }
}

function showToast(message) {
    let t = document.querySelector('.toast');
    if (t) t.remove();
    t = document.createElement('div');
    t.className = 'toast';
    t.textContent = message;
    document.body.appendChild(t);
    setTimeout(() => { if (t.parentNode) t.remove(); }, 2200);
}

function initTheme() {
    const saved = localStorage.getItem('islamicAppTheme');
    if (saved === 'dark') document.body.classList.add('dark-mode');
    document.querySelectorAll('.theme-btn').forEach(btn => {
        const isDark = btn.dataset.theme === 'dark';
        btn.classList.toggle('active', (isDark && saved === 'dark') || (!isDark && saved !== 'dark'));
        btn.addEventListener('click', () => {
            const dark = btn.dataset.theme === 'dark';
            document.body.classList.toggle('dark-mode', dark);
            localStorage.setItem('islamicAppTheme', btn.dataset.theme);
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function togglePanel(id, show) {
    const p = document.getElementById(id);
    const o = document.getElementById('overlay');
    if (!p || !o) return;
    p.classList.toggle('open', show);
    o.classList.toggle('active', show);
}

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();

    if (countBtn) countBtn.addEventListener('click', incrementCount);
    if (resetBtn) resetBtn.addEventListener('click', resetAll);

    // কীবোর্ড সাপোর্ট (স্পেসবার / এন্টার)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            incrementCount();
        }
    });

    // সোয়াইপ
    const container = document.getElementById('mobileContainer');
    if (container && window.innerWidth <= 768) {
        container.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, {passive:true});
        container.addEventListener('touchend', e => { touchEndX = e.changedTouches[0].screenX; handleSwipe(); }, {passive:true});
    }

    ['settingsBtn','mobileSettingsBtn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', () => togglePanel('settingsPanel', true));
    });
    const closeS = document.getElementById('closeSettingsBtn');
    if (closeS) closeS.addEventListener('click', () => togglePanel('settingsPanel', false));

    ['mobileMoreBtn','desktopMoreBtn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', e => { e.preventDefault(); togglePanel('moreMenuPanel', true); });
    });
    const closeM = document.getElementById('closeMoreMenuBtn');
    if (closeM) closeM.addEventListener('click', () => togglePanel('moreMenuPanel', false));

    const overlay = document.getElementById('overlay');
    if (overlay) overlay.addEventListener('click', () => {
        togglePanel('settingsPanel', false);
        togglePanel('moreMenuPanel', false);
    });

    initTheme();
});
