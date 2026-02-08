// coi-serviceworker.js
// Minimal Cross-Origin Isolation service worker
// Enables SharedArrayBuffer + WebGPU for web-llm

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
    return;
  }

  // Add required COOP/COEP headers to all responses
  event.respondWith(
    fetch(event.request).then((response) => {
      if (!response.ok) return response;

      const newHeaders = new Headers(response.headers);
      newHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
      newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

      // Only apply to same-origin requests or when needed
      if (event.request.url.startsWith(self.location.origin)) {
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders
        });
      }

      return response;
    }).catch(() => {
      // Fallback in case fetch fails (rare)
      return new Response('Offline', { status: 503 });
    })
  );
});
