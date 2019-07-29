const cacheName = 'v1';

const cacheAssets =
    ["index.html",
        "js/app.js",
        "index.css",
        "manifest.json",
        "img/back_white.png",
        "images/icons/icon-72x72.png",
        "images/icons/icon-96x96.png",
        "images/icons/icon-128x128.png",
        "images/icons/icon-144x144.png",
        "images/icons/icon-152x152.png",
        "images/icons/icon-192x192.png",
        "images/icons/icon-384x384.png",
        "images/icons/icon-512x512.png"
    ];


if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register("service-worker.js")
            .then(reg => console.log("Service Worker : Registered"))
            .catch(err => console.log(`Service Worker : Error : ${err}`));
    });
}

// Install Service Worker
self.addEventListener("install", e => {
    console.log('Service Worker: Installed')
    e.waitUntil(
        caches
            .open(cacheName)
            .then(cache => {
                console.log('Service Worker: Caching Files')
                cache.addAll(cacheAssets);
            })
            .then( ()=>self.skipWaiting() )
    );
});


// Activate Service Worker
self.addEventListener("activate", function (e) {
    console.log("Service worker Activated");
    // remove unwanted caches
    e.waitUntil(
        caches.keys().then(cacheNames=>{
            return Promise.all(
                cacheNames.map(cache =>{
                    if(cache !== cacheName) {
                        console.log('Service Worker: Clearing Old Cache');
                        return caches.delete(cache) ;
                    }
                })
            )
        })
    )
});

// Call Fetch Event
self.addEventListener('fetch',e => {
    console.log('Service Worker: Fetching');
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request))) ;    
});



