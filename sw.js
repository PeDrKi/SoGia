const CACHE_NAME = 'so-gia-shell-v2';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Chỉ can thiệp app shell (GET, same-origin). Dữ liệu Supabase luôn lấy từ mạng, không qua đây.
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  // Network-first: luôn cố lấy bản mới nhất khi có mạng, chỉ dùng cache khi mất mạng.
  // Nhờ vậy mỗi lần deploy bản mới, điện thoại sẽ tự thấy ngay lần mở app kế tiếp.
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
