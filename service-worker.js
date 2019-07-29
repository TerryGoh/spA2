self.addEventListener("install",function(event){
    console.log("Service worker Installing") ;
    self.skipWaiting();
});

self.addEventListener("activate",function(event){
    console.log("Service worker Activating") ;
});