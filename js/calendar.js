let hijriYear = 1447, hijriMonth = 11, hijriDay = 1;
let gregDate = new Date();
const hijriMonths = ["মুহাররম","সফর","রবিউল আউয়াল","রবিউস সানি","জমাদিউল আউয়াল","জমাদিউস সানি","রজব","শা'বান","রমজান","শাওওয়াল","জিলকদ","জিলহজ"];
const hijriMonthsAr = ["محرم","صفر","ربيع الأول","ربيع الثاني","جمادى الأولى","جمادى الثانية","رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة"];

function renderHijri() {
    let monthName = `${hijriMonths[hijriMonth]} ${hijriYear}`;
    document.getElementById('hijriMonthYear').innerHTML = `${monthName} <span class="hijri-month-name">(${hijriMonthsAr[hijriMonth]})</span>`;
    document.getElementById('hijriCurrentDate').innerHTML = `📅 বর্তমান: ${hijriDay} ${hijriMonths[hijriMonth]} ${hijriYear} হিজরি`;
    
    let firstDay = new Date(hijriYear, hijriMonth, 1).getDay();
    let grid = document.getElementById('hijriDaysGrid');
    if (!grid) return;
    grid.innerHTML = '';
    for (let i = 0; i < firstDay; i++) grid.innerHTML += '<div class="calendar-day other-month"></div>';
    for (let i = 1; i <= 30; i++) {
        grid.innerHTML += `<div class="calendar-day ${i === hijriDay ? 'today' : ''}">${i}</div>`;
    }
}

function renderGreg() {
    let months = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];
    let m = gregDate.getMonth(), y = gregDate.getFullYear();
    document.getElementById('gregMonthYear').innerHTML = `${months[m]} ${y}`;
    document.getElementById('gregorianCurrentDate').innerHTML = `📅 বর্তমান: ${months[m]} ${y}`;
    
    let firstDay = new Date(y, m, 1).getDay();
    let daysInMonth = new Date(y, m + 1, 0).getDate();
    let grid = document.getElementById('gregDaysGrid');
    if (!grid) return;
    grid.innerHTML = '';
    for (let i = 0; i < firstDay; i++) grid.innerHTML += '<div class="calendar-day other-month"></div>';
    for (let i = 1; i <= daysInMonth; i++) {
        grid.innerHTML += `<div class="calendar-day ${i === gregDate.getDate() ? 'today' : ''}">${i}</div>`;
    }
}

document.getElementById('prevHijriMonth')?.addEventListener('click', () => {
    if (hijriMonth === 0) { hijriMonth = 11; hijriYear--; } else hijriMonth--;
    renderHijri();
});
document.getElementById('nextHijriMonth')?.addEventListener('click', () => {
    if (hijriMonth === 11) { hijriMonth = 0; hijriYear++; } else hijriMonth++;
    renderHijri();
});
document.getElementById('prevGregMonth')?.addEventListener('click', () => {
    gregDate.setMonth(gregDate.getMonth() - 1);
    renderGreg();
});
document.getElementById('nextGregMonth')?.addEventListener('click', () => {
    gregDate.setMonth(gregDate.getMonth() + 1);
    renderGreg();
});

document.querySelectorAll('.cal-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.cal-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('hijriCalendarPage')?.classList.toggle('active', btn.dataset.tab === 'hijri');
        document.getElementById('gregorianCalendarPage')?.classList.toggle('active', btn.dataset.tab === 'gregorian');
    });
});

renderHijri();
renderGreg();