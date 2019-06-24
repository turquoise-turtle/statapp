var CACHE = 'cache-and-update-statapp';

// run this function when the service worker is being installed
self.addEventListener('install', function(evt) {
	console.log('The service worker is being installed.');

	// Ask the service worker to keep wait until all the resources have been pre-cached using the precache function
	evt.waitUntil(precache());
});


function precache() {
	//it opens the cache with the statapp name
	return caches.open(CACHE).then(function (cache) {
		//it adds all the pages and resources to the cache
		return cache.addAll([
			'/statapp/index.html'
		]);
	});
}

// when the website requests a resource, it will respond with the cached version, but will update the resource from the server in the background, for the next visit
self.addEventListener('fetch', function(evt) {
	console.log('The service worker is serving the asset.');
	//we have a doNotCache function that we can use to bypass the cache
	if (doNotCache(evt.request)) {
		//console.log(evt.request);
		//fetch is the default function which gets the resource from the internet
		evt.respondWith(fetch(evt.request))
	} else {
		//this will use the cached version of the resource
		evt.respondWith(fromCache(evt.request));
	}
	// the cached version of the resource will be updated in the background
	evt.waitUntil(update(evt.request));
});

//the exclusion tester will return true or false which determines whether it bypasses the cache or not
function doNotCache(request) {
	var result = true;
	/*
	var url = request.url;
	var doNotCacheList = [
		'https://makerwidget.com'
	]
	for (var doNotCacheItem of doNotCacheList) {
		if (url.indexOf(doNotCacheItem) > -1) {
			result = true;
		}
	}
	console.log(request.url, result);
	*/
	return result;
}

// get the resource from the cache
function fromCache(request) {
	return caches.open(CACHE).then(function (cache) {
		// match the resource request with the cache version
		return cache.match(request).then(function (matching) {
			console.log('fromcache request', request);
			// return the cache version
			return matching || Promise.reject('no-match');
		});
	});
}

// Updates the cache for a specific resource
function update(request) {
	//it'll only update the resource if the device is connected to the internet
	if (navigator.onLine) {
		return caches.open(CACHE).then(function (cache) {
			return fetch(request).then(function (response) {
				//put it into the cache
				return cache.put(request, response);
			}).catch(function(error){
				console.log(error);
				//we need to do nothing, so we do an empty resolve
				return new Promise(function(resolve,reject){
					resolve();
				});
			});
		});
	}
}