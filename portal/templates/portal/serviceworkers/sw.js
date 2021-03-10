// //Start service workers
// const cacheNameS = "v1-static-cache"
// const cacheNameD = "v1-dinamic-cache"
//
// const cacheUrls = [
//     // '/static/portal/js/app.js'
// ]
//
// self.addEventListener("install", async event => {
//     const cache = await caches.open(cacheNameS)
//     await cache.addAll(cacheUrls)
//
//     console.log("Service worker installed")
// })
//
//
// self.addEventListener("activate", async event => {
//     const cacheNames = await caches.keys()
//     await Promise.all(
//         cacheNames
//             .filter(name => name != cacheNameS || name != cacheNameD)
//             .map(name => caches.delete(name))
//     )
//     console.log("Service worker active")
// })
//
// self.addEventListener("fetch", event =>{
//     const {request} = event
//     const url = new URL(request.url)
//     if (url.origin === location.origin){
//             event.respondWith(cacheFirst(request))
//     }
//     else {
//         event.respondWith(networkFirst(request))
//     }
//
// })
//
// //First load from cache, then from network
// async function cacheFirst(request){
//    const cached = await caches.match(request)
//     return cached ?? await fetch(request)
// }
//
// //first load from network, then from cache
// async function networkFirst(request) {
//     const cache = await caches.open(cacheNameD)
//     try{
//         const response = await fetch(request)
//         await cache.put(request, response.clone())
//         return response
//     }catch (e) {
//         const cached = await cache.match(request)
//         return cached ?? caches.match('offline.html')
//     }
// }
