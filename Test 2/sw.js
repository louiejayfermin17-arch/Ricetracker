/* RiceTracker service worker — makes the app installable and usable offline. */
const CACHE = 'ricetrack-shell-v1';
const SHELL = [
  'login.html','ricetrack-cashier.html','ricetrack-owner.html','calculator.html',
  'reset-cashier-password.html','reset-owner-password.html','ricetrack.css','manifest.webmanifest',
  'icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png','icons/favicon-32.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(()=>{})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* Network first (so edits you upload show up), fall back to the cache when offline. */
self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  e.respondWith(
    fetch(req).then(res => {
      if(res && (res.ok || res.type === 'opaque')){
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
      }
      return res;
    }).catch(() => caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match('login.html') : undefined)))
  );
});
