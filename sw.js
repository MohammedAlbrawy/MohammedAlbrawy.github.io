// بيخلي الصفحة تفتح حتى لو النت ضعيف أو مقطوع، وبيجيب أحدث نسخة لما النت يبقى متاح.
// طلبات السيرفر (script.google.com) مبتتخزنش أبدًا.
const CACHE = 'cb-shell-v3';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/logo.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // السيرفر والخطوط والـ QR تعدّي عادي

  // الصفحة نفسها: من النت الأول، ولو مفيش نت من النسخة المحفوظة
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); return res; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  // الأيقونات وباقي الملفات: المحفوظ الأول
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
