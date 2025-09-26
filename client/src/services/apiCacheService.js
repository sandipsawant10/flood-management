/**
 * API Data Caching Service
 * Provides utilities for pre-fetching and caching essential API data for offline use
 */

import { updateItem, getAllItems, STORES_ENUM } from "./indexedDBService";
import axiosInstance from "./axiosConfig";

// Constants for cached resources
const CACHE_KEYS = {
  EMERGENCY_CONTACTS: "emergencyContacts",
  ALERTS: "alerts",
  DISASTER_PRONE_AREAS: "disasterProneAreas",
  EVACUATION_CENTERS: "evacuationCenters",
  WEATHER_FORECAST: "weatherForecast",
  USER_DATA: "userData",
};

// Cache expiration in milliseconds
const CACHE_EXPIRATION = {
  EMERGENCY_CONTACTS: 7 * 24 * 60 * 60 * 1000, // 1 week
  ALERTS: 1 * 60 * 60 * 1000, // 1 hour
  DISASTER_PRONE_AREAS: 7 * 24 * 60 * 60 * 1000, // 1 week
  EVACUATION_CENTERS: 7 * 24 * 60 * 60 * 1000, // 1 week
  WEATHER_FORECAST: 3 * 60 * 60 * 1000, // 3 hours
  USER_DATA: 24 * 60 * 60 * 1000, // 1 day
};

/**
 * Prefetch essential data for offline use
 * This should be called when the app initializes or when the user logs in
 */
export const prefetchEssentialData = async () => {
  if (!navigator.onLine) {
    console.log("Device is offline. Cannot prefetch essential data.");
    return;
  }

  try {
    console.log("Prefetching essential data for offline use");

    // Prefetch emergency contacts
    await prefetchEmergencyContacts();

    // Prefetch active alerts
    await prefetchActiveAlerts();

    // Prefetch disaster-prone areas
    await prefetchDisasterProneAreas();

    // Prefetch evacuation centers
    await prefetchEvacuationCenters();

    // Prefetch weather forecast
    await prefetchWeatherForecast();

    console.log("Essential data prefetched successfully");
    return true;
  } catch (error) {
    console.error("Failed to prefetch essential data:", error);
    return false;
  }
};

/**
 * Prefetch emergency contacts
 */
export const prefetchEmergencyContacts = async () => {
  try {
    const response = await axiosInstance.get("/emergency/contacts");
    // The server may return either an array ([]) or an object { contacts: [] }
    let contacts = [];
    if (Array.isArray(response.data)) {
      contacts = response.data;
    } else if (response.data && Array.isArray(response.data.contacts)) {
      contacts = response.data.contacts;
    } else {
      console.warn(
        "Unexpected /emergency/contacts response shape:",
        response.data
      );
      contacts = [];
    }

    if (!contacts || contacts.length === 0) {
      console.log("No emergency contacts to cache");
      return [];
    }

    // Cache each contact, ensure required keyPath 'id' exists; tolerate per-item failures
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i] || {};
      const id =
        contact.id ||
        contact._id ||
        contact.number ||
        contact.name ||
        `contact-${Date.now()}-${i}`;

      const item = {
        ...contact,
        id,
        cachedAt: new Date().toISOString(),
        expires: new Date(
          Date.now() + CACHE_EXPIRATION.EMERGENCY_CONTACTS
        ).toISOString(),
      };

      try {
        await updateItem(STORES_ENUM.EMERGENCY_CONTACTS, item);
      } catch (err) {
        console.warn(`Failed to cache emergency contact ${id}:`, err);
        // continue caching remaining contacts
      }
    }

    console.log(`Cached ${contacts.length} emergency contacts for offline use`);
    return contacts;
  } catch (error) {
    console.error("Failed to prefetch emergency contacts:", error);
    // Don't throw so the overall prefetch flow can continue
    return [];
  }
};
export const prefetchActiveAlerts = async () => {
  try {
    const response = await axiosInstance.get("/alerts/active");
    const alerts = response.data.alerts;

    // Store alerts for offline access
    await storeOfflineData(CACHE_KEYS.ALERTS, alerts, CACHE_EXPIRATION.ALERTS);

    console.log(`Cached ${alerts.length} active alerts for offline use`);
    return alerts;
  } catch (error) {
    console.error("Failed to prefetch active alerts:", error);
    // If unauthorized or any other error, return empty array so prefetch continues
    return [];
  }
};

/**
 * Prefetch disaster-prone areas
 */
export const prefetchDisasterProneAreas = async () => {
  try {
    const response = await axiosInstance.get("/disaster-prone-areas");
    const areas = response.data.areas;

    // Store areas for offline access
    await storeOfflineData(
      CACHE_KEYS.DISASTER_PRONE_AREAS,
      areas,
      CACHE_EXPIRATION.DISASTER_PRONE_AREAS
    );

    console.log(`Cached ${areas.length} disaster-prone areas for offline use`);
    return areas;
  } catch (error) {
    console.error("Failed to prefetch disaster-prone areas:", error);
    // Return empty list so overall prefetch continues when endpoint missing or unauthorized
    return [];
  }
};

/**
 * Prefetch evacuation centers
 */
export const prefetchEvacuationCenters = async () => {
  try {
    const response = await axiosInstance.get("/evacuation-centers");
    const centers = response.data.centers;

    // Store centers for offline access
    await storeOfflineData(
      CACHE_KEYS.EVACUATION_CENTERS,
      centers,
      CACHE_EXPIRATION.EVACUATION_CENTERS
    );

    console.log(`Cached ${centers.length} evacuation centers for offline use`);
    return centers;
  } catch (error) {
    console.error("Failed to prefetch evacuation centers:", error);
    return [];
  }
};

/**
 * Prefetch weather forecast
 * @param {object} location - User's location
 */
export const prefetchWeatherForecast = async (location = null) => {
  try {
    // Get user's location if not provided
    const userLocation = location || (await getUserLocation());

    // Get weather forecast for the location
    const response = await axiosInstance.get("/weather/forecast", {
      params: {
        lat: userLocation.latitude,
        lon: userLocation.longitude,
      },
    });

    const forecast = response.data;

    // Store forecast for offline access
    await storeOfflineData(
      CACHE_KEYS.WEATHER_FORECAST,
      forecast,
      CACHE_EXPIRATION.WEATHER_FORECAST
    );

    console.log("Cached weather forecast for offline use");
    return forecast;
  } catch (error) {
    console.error("Failed to prefetch weather forecast:", error);
    // Return null to indicate forecast not available
    return null;
  }
};

/**
 * Get user's location
 */
const getUserLocation = () => {
  return new Promise((resolve) => {
    // Try to get location from local storage first
    const cachedLocation = localStorage.getItem("userLocation");
    if (cachedLocation) {
      try {
        resolve(JSON.parse(cachedLocation));
        return;
      } catch {
        // Ignore parsing errors
      }
    }

    // Otherwise, use a default location
    // This is a fallback for India
    resolve({
      latitude: 20.5937,
      longitude: 78.9629,
    });
  });
};

/**
 * Store offline data in IndexedDB
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} expiration - Cache expiration in milliseconds
 */
export const storeOfflineData = async (key, data, expiration) => {
  try {
    await updateItem(STORES_ENUM.USER_DATA, {
      id: key,
      data,
      cachedAt: new Date().toISOString(),
      expires: new Date(Date.now() + expiration).toISOString(),
    });

    return true;
  } catch (error) {
    console.error(`Failed to store offline data for ${key}:`, error);
    throw error;
  }
};

/**
 * Get offline data from IndexedDB
 * @param {string} key - Cache key
 */
export const getOfflineData = async (key) => {
  try {
    const cachedData = await getAllItems(STORES_ENUM.USER_DATA);
    const item = cachedData.find((item) => item.id === key);

    if (!item) {
      return null;
    }

    // Check if data is expired
    if (new Date(item.expires) < new Date()) {
      console.log(`Cached data for ${key} is expired`);
      return null;
    }

    return item.data;
  } catch (error) {
    console.error(`Failed to get offline data for ${key}:`, error);
    throw error;
  }
};

/**
 * Check if offline data is available and not expired
 * @param {string} key - Cache key
 */
export const isOfflineDataAvailable = async (key) => {
  try {
    const data = await getOfflineData(key);
    return data !== null;
  } catch {
    return false;
  }
};

// Export named constants
export const CACHE_KEYS_ENUM = CACHE_KEYS;
