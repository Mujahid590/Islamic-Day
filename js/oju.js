// ========== OJU STEPS DATA ==========
const ojuSteps = [
  { number: 1, title: "নিয়ত করা", description: "অজুর নিয়ত করা (মনে মনে সংকল্প করা) - 'আমি নামাজের জন্য অজু করছি'" },
  { number: 2, title: "বিসমিল্লাহ বলা", description: "بِسْمِ اللَّهِ (আল্লাহর নামে শুরু করছি) বলে শুরু করা" },
  { number: 3, title: "হাত ধোয়া", description: "দুই হাত কব্জি পর্যন্ত ৩ বার ধোয়া" },
  { number: 4, title: "কুলি করা", description: "মুখে পানি নিয়ে ৩ বার কুলি করা" },
  { number: 5, title: "নাকে পানি দেওয়া", description: "ডান হাতে পানি নিয়ে নাকে ৩ বার দেওয়া" },
  { number: 6, title: "মুখ ধোয়া", description: "সম্পূর্ণ মুখমণ্ডল ৩ বার ধোয়া" },
  { number: 7, title: "হাত ধোয়া (কনুইসহ)", description: "ডান হাত পরে বাম হাত কনুইসহ ৩ বার করে ধোয়া" },
  { number: 8, title: "মাথা মসেহ করা", description: "ভেজা হাতে মাথার সম্মুখভাগ থেকে পেছন দিকে মসেহ করা" },
  { number: 9, title: "কান মসেহ করা", description: "দুই কানের ভিতর ও বাইরে মসেহ করা" },
  { number: 10, title: "পা ধোয়া", description: "ডান পা পরে বাম পা টাখনু পর্যন্ত ৩ বার করে ধোয়া" },
  { number: 11, title: "তারতিব রক্ষা করা", description: "উপরের ধাপগুলো সঠিক ক্রমে সম্পন্ন করা" },
  { number: 12, title: "মুওয়ালাত", description: "একটানা ধারাবাহিকভাবে অজুর ধাপগুলো সম্পন্ন করা" }
];

function loadStepStatus() {
  const saved = localStorage.getItem('oju_steps_completed');
  if (saved) {
    return JSON.parse(saved);
  }
  return new Array(ojuSteps.length).fill(false);
}

function saveStepStatus(status) {
  localStorage.setItem('oju_steps_completed', JSON.stringify(status));
}

function toggleStep(index) {
  const status = loadStepStatus();
  status[index] = !status[index];
  saveStepStatus(status);
  renderSteps();
}

function renderSteps() {
  const status = loadStepStatus();
  const container = document.getElementById('stepsList');
  
  container.innerHTML = ojuSteps.map((step, idx) => `
    <div class="step-card ${status[idx] ? 'completed' : ''}">
      <div class="step-number">${step.number}</div>
      <div class="step-content">
        <div class="step-title">${step.title}</div>
        <div class="step-desc">${step.description}</div>
      </div>
      <button class="step-check ${status[idx] ? 'checked' : ''}" data-index="${idx}"></button>
    </div>
  `).join('');
  
  document.querySelectorAll('.step-check').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      toggleStep(index);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderSteps();
});