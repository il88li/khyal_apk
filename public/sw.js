/* ============================================================
   خَيال — Service Worker
   استراتيجية خفيفة: لا نخزّن بيانات المستخدم الخاصة،
   فقط أصول البناء الثابتة + صفحة غير متصل احتياطية.
   ============================================================ */

const VERSION = 'khayal-v1';
const STATIC_CACHE = `${VERSION}-static`;
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll([OFFLINE_URL, '/manifest.json', '/icon.svg']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // لا نخزّن واجهات الـ API ولا طلبات المصادقة أبداً
  if (url.pathname.startsWith('/api/')) return;

  // أصول البناء: من الكاش أولاً مع تحديث في الخلفية
  if (url.pathname.startsWith('/_next/static/') || /\.(css|js|woff2|svg|png|jpg|webp|avif)$/.test(url.pathname)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // التنقّل: الشبكة أولاً، وعند الفشل صفحة غير متصل
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
  }
});
