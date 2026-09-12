const CACHE_NAME = "my-wardrobe-v4";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", event => {

  self.skipWaiting();

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))

  );

});


self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(keys => {

        return Promise.all(

          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))

        );

      })
      .then(() => self.clients.claim())

  );

});


self.addEventListener("fetch", event => {

  const request = event.request;

  if (request.method !== "GET") {
    return;
  }


  const url =
    new URL(request.url);


  /*
    Only cache files belonging to
    your GitHub Pages website.

    Supabase and external CDNs stay on network.
  */

  if (
    url.origin !== location.origin
  ) {
    return;
  }


  event.respondWith(

    fetch(request)
      .then(response => {

        const copy =
          response.clone();

        caches.open(CACHE_NAME)
          .then(cache => {

            cache.put(
              request,
              copy
            );

          });

        return response;

      })
      .catch(() => {

        return caches.match(
          request
        );

      })

  );

});
