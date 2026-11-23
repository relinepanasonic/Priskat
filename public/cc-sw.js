// Service worker of the Community Center app. It makes the site installable as a real app (not only a shortcut).
// Pages always come from the network; only when there is no connection a short notice is shown.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(
      () => new Response("<!doctype html><meta name=viewport content='width=device-width,initial-scale=1'><body style='font-family:sans-serif;background:#1c1c1c;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center'><div><h2>Tidak ada koneksi</h2><p>Sambungkan internet, lalu buka lagi Community Center.</p></div>", { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }),
    ),
  );
});
