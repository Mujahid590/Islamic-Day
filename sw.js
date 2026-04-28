// ============================================
// ইসলামিক প্রার্থনা ট্র্যাকার - সার্ভিস ওয়ার্কার
// সংস্করণ: 1.0.0
// ============================================

const CACHE_NAME = 'islamic-prayer-v1';

// অফলাইনের জন্য ক্যাশ করতে হবে এমন ফাইলগুলোর তালিকা
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/quran.html',
  '/salah.html',
  '/hadith.html',
  '/qibla.html',
  '/tasbih.html',
  '/asmaul-husna.html',
  '/oju.html',
  '/masjid.html',
  
  // CSS ফাইল
  '/css/style.css',
  '/css/quran.css',
  '/css/salah.css',
  '/css/hadith.css',
  '/css/qibla.css',
  '/css/tasbih.css',
  '/css/asmaul-husna.css',
  '/css/oju.css',
  '/css/masjid.css',
  
  // JavaScript ফাইল
  '/js/main.js',
  '/js/quran.js',
  '/js/salah.js',
  '/js/hadith.js',
  '/js/qibla.js',
  '/js/tasbih.js',
  '/js/asmaul-husna.js',
  '/js/oju.js',
  '/js/masjid.js',
  
  // ইমেজ ফাইল (প্রধান আইকনগুলো)
  '/image/Logo.png',
  '/image/home.png',
  '/image/quran.png',
  '/image/salah.png',
  '/image/hadith.png',
  '/image/compass.png',
  '/image/tasbih.png',
  '/image/asmaul_husna.png',
  '/image/oju.png',
  '/image/mosjid.png',
  '/image/profile.png',
  '/image/fozor.png',
  '/image/zohor.png',
  '/image/asor.png',
  '/image/magrib.png',
  '/image/isa.png',
  '/image/calendar.png',
  '/image/Clock.png'
];

// ============================================
// ইনস্টল ইভেন্ট - সব গুরুত্বপূর্ণ ফাইল ক্যাশ করা
// ============================================
self.addEventListener('install', (event) => {
  console.log('[সার্ভিস ওয়ার্কার] ইনস্টল করা হচ্ছে...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[সার্ভিস ওয়ার্কার] ফাইল ক্যাশ করা হচ্ছে...');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => {
        console.log('[সার্ভিস ওয়ার্কার] ইনস্টল সম্পূর্ণ!');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[সার্ভিস ওয়ার্কার] ক্যাশ ব্যর্থ:', error);
      })
  );
});

// ============================================
// অ্যাক্টিভেট ইভেন্ট - পুরনো ক্যাশ পরিষ্কার করা
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[সার্ভিস ওয়ার্কার] অ্যাক্টিভেট করা হচ্ছে...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[সার্ভিস ওয়ার্কার] পুরনো ক্যাশ মুছে ফেলা হচ্ছে:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[সার্ভিস ওয়ার্কার] এখন ফেচ হ্যান্ডেল করতে প্রস্তুত!');
      return self.clients.claim();
    })
  );
});

// ============================================
// ফেচ ইভেন্ট - প্রথমে ক্যাশ থেকে পরিবেশন, তারপর নেটওয়ার্ক
// ============================================
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // শুধু GET রিকোয়েস্ট প্রসেস করা
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // ব্রাউজারের অভ্যন্তরীণ রিকোয়েস্ট স্কিপ করা
  if (event.request.url.includes('chrome-extension') || 
      event.request.url.includes('firefox-extension')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // HTML পেজের জন্য: প্রথমে নেটওয়ার্ক, তারপর ক্যাশ
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return caches.match('/index.html');
            });
        })
    );
    return;
  }
  
  // CSS, JS, ইমেজের জন্য: প্রথমে ক্যাশ, তারপর নেটওয়ার্ক
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
              return caches.match('/image/Logo.png');
            }
            
            return new Response('অফলাইন - কন্টেন্ট উপলব্ধ নয়', {
              status: 404,
              statusText: 'Offline'
            });
          });
      })
  );
});

// ============================================
// মেসেজ ইভেন্ট - আপডেট রিকোয়েস্ট হ্যান্ডেল করা
// ============================================
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});