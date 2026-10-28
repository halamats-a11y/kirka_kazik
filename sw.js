// Офлайн-режим Кирки. Создан make-iphone.py — руками не править.
const CACHE = 'kirka-7da59afff1';
const FILES = ['./', './index.html', './manifest.webmanifest', './apple-touch-icon.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './favicon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('kirka-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  if (r.mode === 'navigate') {
    // Страница игры: сначала сеть (чтобы обновления приходили сразу), нет сети за 4 с — из кэша.
    const net = fetch(r.url, { cache: 'no-cache', credentials: 'same-origin' }).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); } return res; });
    const slow = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000));
    e.respondWith(Promise.race([net, slow]).catch(() => caches.match('./index.html').then(m => m || net)));
    return;
  }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(m => m || fetch(r)));
});
