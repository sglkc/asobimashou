const CACHE_NAME = 'offline-v1';
const toCache = [
  'js/bootstrap.bundle.min.js',
  'js/script.js',
  'js/cards.js',
  'js/jquery-3.6.0.min.js',
  'js/wanakana.min.js',
  'css/bootstrap.min.css',
  'css/style.css',
  'css/icons.css',
  'css/fonts.css',
  'fonts/bootstrap-icons.woff2',
  'fonts/klee-one.woff2',
  'fonts/noto-serif-jp.woff2',
  'fonts/yuji-syuku.woff2',
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
