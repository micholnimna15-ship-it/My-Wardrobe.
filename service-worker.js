const CACHE_NAME = "my-wardrobe-v6";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];


/* =========================================================
   INSTALL
========================================================= */

self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
  );
});


/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener("activate", event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});


/* =========================================================
   OFFLINE / PWA CACHE
========================================================= */

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  /*
    Only cache files from the
    My Wardrobe GitHub Pages website.

    Supabase and external services
    continue using the network.
  */

  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {

        /*
          Only cache successful responses.
        */
        if (
          response &&
          response.status === 200 &&
          response.type === "basic"
        ) {
          const copy = response.clone();

          caches
            .open(CACHE_NAME)
            .then(cache => cache.put(request, copy));
        }

        return response;
      })

      .catch(async () => {
        const cached = await caches.match(request);

        if (cached) {
          return cached;
        }

        /*
          If a page navigation fails while offline,
          fall back to the cached app.
        */
        if (request.mode === "navigate") {
          return caches.match("./index.html");
        }

        return Response.error();
      })
  );
});


/* =========================================================
   PHONE PUSH NOTIFICATIONS
========================================================= */

self.addEventListener("push", event => {
  let data = {};

  try {
    data = event.data
      ? event.data.json()
      : {};
  } catch (error) {
    data = {
      body: event.data
        ? event.data.text()
        : "You have a new My Wardrobe notification."
    };
  }

  const title =
    data.title ||
    "My Wardrobe";

  const options = {
    body:
      data.body ||
      "You have a new notification.",

    icon:
      "./icons/icon-192.png",

    badge:
      "./icons/icon-192.png",

    tag:
      data.data?.notificationId ||
      undefined,

    renotify: false,

    data: {
      ...(data.data || {}),

      url:
        data.data?.url ||
        "./"
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      title,
      options
    )
  );
});


/* =========================================================
   WHEN USER TAPS PHONE NOTIFICATION
========================================================= */

self.addEventListener("notificationclick", event => {
  event.notification.close();

  const targetUrl =
    event.notification.data?.url ||
    "./";

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true
      })

      .then(async windowClients => {

        /*
          If My Wardrobe is already open,
          use the existing window.
        */

        for (const client of windowClients) {
          if ("focus" in client) {
            try {
              await client.navigate(targetUrl);
            } catch (error) {
              console.log(
                "Could not navigate existing window."
              );
            }

            return client.focus();
          }
        }

        /*
          Otherwise open My Wardrobe.
        */

        if (self.clients.openWindow) {
          return self.clients.openWindow(
            targetUrl
          );
        }
      })
  );
});
