/* js/theme-init.js — সব পেজে সেভ করা থিম (লাইট/ডার্ক/সিস্টেম) ও রঙ প্রয়োগ করে।
   <head> বা <body> যেকোনো জায়গায় বসানো যায়। যে পেজে main.js আছে সেখানে এটা না দিলেও চলবে। */
(function () {
  'use strict';
  var HEX = { teal: '#0d9488', green: '#16a34a', blue: '#0284c7', peach: '#ea580c' };
  function get(k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } }
  function prefersDark() { try { return matchMedia('(prefers-color-scheme:dark)').matches; } catch (e) { return false; } }

  function apply() {
    var theme = get('deen_theme', 'dark');            /* main.js এর ডিফল্টও dark */
    var color = get('deen_color', 'teal');
    if (!HEX[color]) color = 'teal';
    var dark = theme === 'dark' || (theme === 'system' && prefersDark());

    /* html এর ব্যাকগ্রাউন্ড style.css এ :root (লাইট) থেকে আসে — ডার্কে সাদা ঝলক/সাদা কোণা এড়াতে এটা আলাদা সেট করা হলো */
    document.documentElement.style.backgroundColor = dark ? '#101a24' : '#f6fbfa';

    var b = document.body;
    if (!b) return;
    b.classList.toggle('dark', dark);
    b.dataset.color = color;
    var m = document.querySelector('meta[name=theme-color]');
    if (m) m.setAttribute('content', dark ? '#0b2428' : HEX[color]);
  }

  apply();                                             /* body থাকলে এখনই */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  window.addEventListener('load', apply);

  window.addEventListener('storage', function (e) { if (e.key === 'deen_theme' || e.key === 'deen_color') apply(); });
  window.addEventListener('pageshow', function (e) { if (e.persisted) apply(); });
  try {
    var mq = matchMedia('(prefers-color-scheme:dark)');
    var on = function () { if (get('deen_theme', 'dark') === 'system') apply(); };
    mq.addEventListener ? mq.addEventListener('change', on) : mq.addListener(on);
  } catch (e) {}
})();
