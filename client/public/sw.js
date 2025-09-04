const CACHE_NAME = "floodguard-v1.0.0";
const STATIC_CACHE = "floodguard-static-v1.0.0";
const DYNAMIC_CACHE = "floodguard-dynamic-v1.0.0";

// Assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/static/js/bundle.js",
  "/static/css/main.css",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/flood-reports/,
  /\/api\/alerts/,
  /\/api\/emergency/,
  /\/api\/weather/,
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing Service Worker");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("[SW] Static assets cached");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("[SW] Error caching static assets:", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating Service Worker");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("[SW] Service Worker activated");
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content, implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Handle different types of requests
  if (request.destination === "document") {
    // HTML requests - Network first, fallback to cache
    event.respondWith(handleDocumentRequest(request));
  } else if (API_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    // API requests - Cache first for offline functionality
    event.respondWith(handleAPIRequest(request));
  } else if (request.destination === "image") {
    // Image requests - Cache first
    event.respondWith(handleImageRequest(request));
  } else {
    // Static assets - Cache first
    event.respondWith(handleStaticRequest(request));
  }
});

// Network first strategy for documents
async function handleDocumentRequest(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[SW] Network failed for document, serving from cache");

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback page
    return caches.match("/");
  }
}

// Cache first strategy for API requests
async function handleAPIRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  // Return cached response immediately if available
  if (cachedResponse) {
    // Try to update cache in background
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          cache.put(request, networkResponse.clone());
        }
      })
      .catch(() => {
        // Network failed, cached version is still valid
      });

    return cachedResponse;
  }

  // No cache available, fetch from network
  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Network failed and no cache available
    console.log("[SW] API request failed:", request.url);

    // Return offline response for API calls
    return new Response(
      JSON.stringify({
        success: false,
        message: "You are offline. Please check your internet connection.",
        offline: true,
      }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

// Cache first strategy for images
async function handleImageRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Return placeholder image for offline
    return new Response(
      '<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" fill="#9ca3af">Image Unavailable</text></svg>',
      {
        headers: {
          "Content-Type": "image/svg+xml",
        },
      }
    );
  }
}

// Cache first strategy for static assets
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[SW] Static asset failed:", request.url);
    return new Response("Asset unavailable offline", { status: 404 });
  }
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag);

  if (event.tag === "flood-report-sync") {
    event.waitUntil(syncFloodReports());
  }
});

// Sync pending flood reports when back online
async function syncFloodReports() {
  // This would retrieve pending reports from IndexedDB and submit them
  console.log("[SW] Syncing pending flood reports...");

  // Implementation would depend on your offline storage strategy
  // You'd typically store failed API calls in IndexedDB and retry them here
}

// Push notification handling
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received");

  const options = {
    body: event.data ? event.data.text() : "New flood alert received",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    actions: [
      {
        action: "view",
        title: "View Alert",
        icon: "/icons/view-icon.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/icons/close-icon.png",
      },
    ],
    data: {
      url: "/alerts",
    },
  };

  event.waitUntil(
    self.registration.showNotification("FloodGuard Alert", options)
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked");

  event.notification.close();

  if (event.action === "view") {
    event.waitUntil(clients.openWindow(event.notification.data.url || "/"));
  }
});
