/**
 * Service Worker Registration
 * This file handles the service worker registration process
 */

export const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log(
        "Service Worker registered successfully:",
        registration.scope
      );

      // Subscribe to push notifications if permission is granted
      await subscribeToPushNotifications(registration);

      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  } else {
    console.warn(
      "Service Workers are not supported in this browser. Offline functionality will be limited."
    );
    return null;
  }
};

/**
 * Subscribe to push notifications
 * @param {ServiceWorkerRegistration} registration - The service worker registration
 */
export const subscribeToPushNotifications = async (registration) => {
  try {
    // Check if we already have permission
    let permission = Notification.permission;

    // If permission is not granted or denied yet, ask for it
    if (permission !== "granted" && permission !== "denied") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      console.log("Notification permission not granted");
      return null;
    }

    // Check if push manager is supported
    if (!("PushManager" in window)) {
      console.warn("Push notifications are not supported in this browser");
      return null;
    }

    // Get existing subscription or create a new one
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Get the server's public key for VAPID
      // In a real application, this would come from your server
      const response = await fetch("/api/notifications/vapid-public-key");
      const vapidPublicKey = await response.text();

      // Convert the public key to the format required by the browser
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // Subscribe the user
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true, // Required for Chrome
        applicationServerKey: convertedVapidKey,
      });

      // Send the subscription to the server
      await fetch("/api/notifications/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });

      console.log("Push notification subscription successful");
    } else {
      console.log("Already subscribed to push notifications");
    }

    return subscription;
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error);
    return null;
  }
};

/**
 * Helper function to convert base64 string to Uint8Array for push subscription
 * @param {string} base64String - The base64 string to convert
 */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Check if the browser is online
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * Check if service worker is supported
 */
export const isServiceWorkerSupported = () => {
  return "serviceWorker" in navigator;
};

/**
 * Check if service worker is registered
 */
export const isServiceWorkerRegistered = async () => {
  if (!isServiceWorkerSupported()) {
    return false;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  return registrations.length > 0;
};

/**
 * Check if the app is installed (Progressive Web App)
 */
export const isAppInstalled = () => {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
};

/**
 * Unregister service workers
 * Useful for development or debugging
 */
export const unregisterServiceWorkers = async () => {
  if (!isServiceWorkerSupported()) {
    return false;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();

  for (const registration of registrations) {
    await registration.unregister();
  }

  console.log("All service workers unregistered");
  return true;
};

/**
 * Update service worker
 * Force the service worker to update
 */
export const updateServiceWorker = async () => {
  if (!isServiceWorkerSupported()) {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  await registration.update();

  return true;
};
