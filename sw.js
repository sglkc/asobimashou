const CACHE_NAME = 'offline-inku-v1';
const toCache = [
  './',
  './index.html',
  './favicon.ico',
  './assets/inku.webp',
  './assets/js/bootstrap.bundle.min.js',
  './assets/js/script.js',
  './assets/js/cards.js',
  './assets/js/jquery-3.6.0.min.js',
  './assets/js/wanakana.min.js',
  './assets/css/bootstrap.min.css',
  './assets/css/style.css',
  './assets/css/icons.css',
  './assets/css/fonts.css',
  './assets/fonts/bootstrap-icons.woff2',
  './assets/fonts/klee-one.woff2',
  './assets/fonts/noto-serif-jp.woff2',
  './assets/fonts/yuji-syuku.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(toCache))
  );
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((res) => {
        if (res) return res;
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      )
    })
  );
})
