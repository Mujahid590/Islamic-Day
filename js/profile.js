// ========== PROFILE MANAGEMENT SCRIPT ==========
let html5QrCode = null;
let scannedProfileData = null;

// Profile Data Structure
const defaultProfile = {
  fullName: "",
  gender: "",
  birthDate: "",
  phone: "",
  email: "",
  address: "",
  mazhab: "",
  quranStyle: "",
  photo: null
};

// Load profile from localStorage
function loadProfile() {
  const saved = localStorage.getItem('user_profile');
  if (saved) {
    try {
      const profile = JSON.parse(saved);
      document.getElementById('fullName').value = profile.fullName || '';
      document.getElementById('gender').value = profile.gender || '';
      document.getElementById('birthDate').value = profile.birthDate || '';
      document.getElementById('phone').value = profile.phone || '';
      document.getElementById('email').value = profile.email || '';
      document.getElementById('address').value = profile.address || '';
      document.getElementById('mazhab').value = profile.mazhab || '';
      document.getElementById('quranStyle').value = profile.quranStyle || '';
      
      if (profile.photo) {
        document.getElementById('profileImage').src = profile.photo;
      }
    } catch(e) {
      console.error('Error loading profile:', e);
    }
  }
}

// Save profile to localStorage
function saveProfile() {
  const profile = {
    fullName: document.getElementById('fullName').value,
    gender: document.getElementById('gender').value,
    birthDate: document.getElementById('birthDate').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    address: document.getElementById('address').value,
    mazhab: document.getElementById('mazhab').value,
    quranStyle: document.getElementById('quranStyle').value,
    photo: document.getElementById('profileImage').src
  };
  
  localStorage.setItem('user_profile', JSON.stringify(profile));
  generateQRCode();
  showToast("✅ প্রোফাইল সংরক্ষণ করা হয়েছে");
  return profile;
}

// Get profile data as JSON string for sharing
function getProfileDataString() {
  const profile = {
    fullName: document.getElementById('fullName').value,
    gender: document.getElementById('gender').value,
    birthDate: document.getElementById('birthDate').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    address: document.getElementById('address').value,
    mazhab: document.getElementById('mazhab').value,
    quranStyle: document.getElementById('quranStyle').value,
    version: "1.0",
    timestamp: new Date().toISOString()
  };
  return JSON.stringify(profile);
}

// Generate QR Code
function generateQRCode() {
  const data = getProfileDataString();
  const canvas = document.getElementById('qrCanvas');
  const placeholder = document.getElementById('qrPlaceholder');
  
  if (!canvas) return;
  
  canvas.style.display = 'block';
  placeholder.style.display = 'none';
  
  const qrSize = 180;
  canvas.width = qrSize;
  canvas.height = qrSize;
  
  // Simple QR code generation using canvas (fallback method)
  // For production, use a proper QR library. Here's a simple implementation
  importQRCodeLibrary().then(() => {
    QRCode.toCanvas(canvas, data, {
      width: qrSize,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }, function(error) {
      if (error) {
        console.error('QR Error:', error);
        placeholder.style.display = 'flex';
        canvas.style.display = 'none';
        placeholder.innerHTML = '⚠️ QR তৈরি ব্যর্থ';
      }
    });
  }).catch(() => {
    placeholder.style.display = 'flex';
    canvas.style.display = 'none';
    placeholder.innerHTML = '📱 QR কোড তৈরি করা যাচ্ছে';
  });
}

function importQRCodeLibrary() {
  return new Promise((resolve, reject) => {
    if (typeof QRCode !== 'undefined') {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
    script.onload = () => {
      setTimeout(() => {
        if (typeof QRCode !== 'undefined') resolve();
        else reject();
      }, 100);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Alternative QR generation using canvas
function generateSimpleQR(text, canvas) {
  const size = 180;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000000';
  ctx.font = '12px monospace';
  ctx.fillText('📱 প্রোফাইল ডেটা', size/2 - 60, size/2);
  ctx.font = '10px monospace';
  ctx.fillText('স্ক্যান করুন', size/2 - 40, size/2 + 20);
}

// Share via WhatsApp
function shareViaWhatsApp() {
  const profile = getProfileDataString();
  const encodedData = encodeURIComponent(profile);
  const whatsappUrl = `https://wa.me/?text=${encodedData}`;
  window.open(whatsappUrl, '_blank');
  showToast("📱 ওয়াটসঅ্যাপ খোলা হচ্ছে...");
}

// Copy data to clipboard
function copyProfileData() {
  const data = getProfileDataString();
  navigator.clipboard.writeText(data).then(() => {
    showToast("📋 প্রোফাইল ডেটা কপি করা হয়েছে");
  }).catch(() => {
    showToast("কপি করতে ব্যর্থ হয়েছে");
  });
}

// Start QR Scanner
function startScanner() {
  const scannerContainer = document.getElementById('scannerContainer');
  const video = document.getElementById('scannerVideo');
  
  scannerContainer.style.display = 'block';
  
  if (html5QrCode) {
    html5QrCode.stop().catch(() => {});
  }
  
  html5QrCode = new Html5Qrcode("scannerVideo");
  
  const qrCodeSuccessCallback = (decodedText, decodedResult) => {
    try {
      const profileData = JSON.parse(decodedText);
      if (profileData.fullName !== undefined || profileData.phone !== undefined) {
        scannedProfileData = profileData;
        stopScanner();
        displayScannedData(profileData);
        showToast("✅ প্রোফাইল স্ক্যান সম্পন্ন!");
      } else {
        showToast("❌ সঠিক প্রোফাইল ডেটা নয়");
      }
    } catch (e) {
      showToast("❌ সঠিক QR কোড নয়");
    }
  };
  
  const config = { fps: 10, qrbox: { width: 250, height: 250 } };
  
  html5QrCode.start(
    { facingMode: "environment" },
    config,
    qrCodeSuccessCallback,
    (errorMessage) => { console.log("QR Scan error:", errorMessage); }
  ).catch((err) => {
    console.error("Unable to start scanning:", err);
    showToast("📷 ক্যামেরা অ্যাক্সেস প্রয়োজন");
    scannerContainer.style.display = 'none';
  });
}

function stopScanner() {
  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      document.getElementById('scannerContainer').style.display = 'none';
    }).catch(() => {});
  }
}

function displayScannedData(data) {
  const container = document.getElementById('scannedData');
  const content = document.getElementById('scannedContent');
  
  content.innerHTML = `
    <div><strong>নাম:</strong> ${data.fullName || '—'}</div>
    <div><strong>লিঙ্গ:</strong> ${data.gender || '—'}</div>
    <div><strong>জন্ম:</strong> ${data.birthDate || '—'}</div>
    <div><strong>মোবাইল:</strong> ${data.phone || '—'}</div>
    <div><strong>ইমেইল:</strong> ${data.email || '—'}</div>
    <div><strong>ঠিকানা:</strong> ${data.address || '—'}</div>
    <div><strong>মাজহাব:</strong> ${data.mazhab || '—'}</div>
    <div><strong>কুরআন স্টাইল:</strong> ${data.quranStyle || '—'}</div>
  `;
  
  container.style.display = 'block';
}

function importScannedData() {
  if (scannedProfileData) {
    document.getElementById('fullName').value = scannedProfileData.fullName || '';
    document.getElementById('gender').value = scannedProfileData.gender || '';
    document.getElementById('birthDate').value = scannedProfileData.birthDate || '';
    document.getElementById('phone').value = scannedProfileData.phone || '';
    document.getElementById('email').value = scannedProfileData.email || '';
    document.getElementById('address').value = scannedProfileData.address || '';
    document.getElementById('mazhab').value = scannedProfileData.mazhab || '';
    document.getElementById('quranStyle').value = scannedProfileData.quranStyle || '';
    
    saveProfile();
    document.getElementById('scannedData').style.display = 'none';
    scannedProfileData = null;
    showToast("✅ প্রোফাইল ইম্পোর্ট সম্পন্ন!");
  }
}

// Photo upload handling
function setupPhotoUpload() {
  const changeBtn = document.getElementById('changePhotoBtn');
  const photoInput = document.getElementById('photoInput');
  const profileImage = document.getElementById('profileImage');
  
  changeBtn.addEventListener('click', () => {
    photoInput.click();
  });
  
  photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        profileImage.src = event.target.result;
        saveProfile();
      };
      reader.readAsDataURL(file);
    }
  });
}

function showToast(msg) {
  const existing = document.querySelector('.toast-msg');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  setupPhotoUpload();
  
  document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
  document.getElementById('shareWhatsAppBtn').addEventListener('click', shareViaWhatsApp);
  document.getElementById('copyDataBtn').addEventListener('click', copyProfileData);
  document.getElementById('startScanBtn').addEventListener('click', startScanner);
  document.getElementById('closeScannerBtn').addEventListener('click', stopScanner);
  document.getElementById('importDataBtn').addEventListener('click', importScannedData);
  
  // Generate QR after loading
  setTimeout(() => {
    generateQRCode();
  }, 500);
});