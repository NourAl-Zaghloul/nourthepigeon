const custom_offline_page = "index.html"

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('LillyCache').then((cache) => {
            return cache.addAll([
                "/", "../Images", custom_offline_page
            ])
        })
    )
})

self.addEventListener('activate', (event) => {
    // Stuff
    event.respondWith(
        (async() => {
            try {
                const networkResponse = await fetch(event.request)
                return networkResponse
            } catch (error) {
                const cache = await caches.open('LillyCache')
                const cachedResponse = await cache.match(custom_offline_page)
                return cachedResponse
            }
        })
    )
})

self.addEventListener("fetch", function(event) {
    event.respondWith(checkResponse(event.request).catch(function() {
      return returnFromCache(event.request);
    }));
    event.waitUntil(addToCache(event.request));
});
  
var checkResponse = function(request){
  return new Promise(function(fulfill, reject) {
    fetch(request).then(function(response){
      if(response.status !== 404) {
        fulfill(response);
      } else {
        reject();
      }
    }, reject);
  });
};
  
var addToCache = function(request){
  return caches.open("LillyCache").then(function (cache) {
    return fetch(request).then(function (response) {
      console.log(response.url + " was cached");
      return cache.put(request, response);
    });
  });
};
  
var returnFromCache = function(request){
  return caches.open("LillyCache").then(function (cache) {
    return cache.match(request).then(function (matching) {
     if(!matching || matching.status == 404) {
       return cache.match("offline.html");
     } else {
       return matching;
     }
    });
  });
};