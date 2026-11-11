document.addEventListener('DOMContentLoaded', () => {
  // ১. প্রথমে একটি ডিফল্ট লোকেশন (যেমন ঢাকা) দিয়ে ম্যাপ ইনিশিয়ালাইজ করুন
  const map = L.map('map').setView([23.8103, 90.4125], 14);

  // ২. OpenStreetMap এর ফ্রি টাইল লেয়ার যোগ করা (কোনো API Key লাগবে না)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // ৩. ইউজারের জিপিএস লাইভ লোকেশন নেওয়া
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // ম্যাপের ভিউ ইউজারের লোকেশনে নিয়ে যাওয়া
        map.setView([lat, lng], 15);

        // ইউজারের নিজস্ব লোকেশনে নীল পিন/মার্কার যোগ করা
        L.marker([lat, lng]).addTo(map)
          .bindPopup("<b>আপনি এখানে আছেন</b>")
          .openPopup();

        // উদাহরণস্বরূপ: আশপাশের কিছু মসজিদের ডামি বা লাইভ পিন যোগ করা (আপনার পছন্দমতো বাড়াতে পারেন)
        const nearbyMosques = [
          { name: "বায়তুল মোকাররম মসজিদ", lat: lat + 0.002, lng: lng + 0.002 },
          { name: "এলাকার জামে মসজিদ", lat: lat - 0.003, lng: lng - 0.001 }
        ];

        nearbyMosques.forEach(mosque => {
          L.marker([mosque.lat, mosque.lng]).addTo(map)
            .bindPopup(`<b>${mosque.name}</b><br><a href="https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lng}" target="_blank">🧭 রাস্তা দেখুন</a>`);
        });

      },
      () => {
        alert("জিপিএস লোকেشن পাওয়া যায়নি, ডিফল্ট লোকেশন দেখানো হচ্ছে।");
      },
      { enableHighAccuracy: true }
    );
  }
});
