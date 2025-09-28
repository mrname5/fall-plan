let cacheName = 'fall-plan-cache'
let precachedResources = ['/', '/logo-180.png', '/logo-192.png', '/logo-512.png', '/index.html', '/style.css', '/test.js']

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
    event.respondWith(networkFirst(event.request));
});


async function precache() {
  const cache = await caches.open(cacheName);
  return cache.addAll(precachedResources);
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache());
});

/** helpful sources:
 * https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching
 * https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation
 * https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register
 * https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 * https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
 * https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/CycleTracker/Manifest_file#app_presentation
 */
