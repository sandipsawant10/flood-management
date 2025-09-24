import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Custom hook for accessing and tracking geolocation
 *
 * @param {Object} options - Geolocation API options
 * @param {boolean} options.enableHighAccuracy - Whether to enable high accuracy mode
 * @param {number} options.timeout - Timeout in milliseconds
 * @param {number} options.maximumAge - Maximum age of cached position in milliseconds
 * @param {boolean} options.watchByDefault - Whether to start watching location by default
 * @returns {Object} Location state and control functions
 */
export const useLocation = (options = {}) => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watchByDefault = false,
  } = options;

  // State for location
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isWatching, setIsWatching] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);

  // Ref for watch ID
  const watchIdRef = useRef(null);

  // Check if geolocation is supported
  const isSupported =
    typeof navigator !== "undefined" && "geolocation" in navigator;

  /**
   * Check permission status
   */
  const checkPermission = useCallback(async () => {
    if (typeof navigator === "undefined" || !("permissions" in navigator)) {
      return "unknown";
    }

    try {
      const { state } = await navigator.permissions.query({
        name: "geolocation",
      });
      setPermissionStatus(state);
      return state;
    } catch (error) {
      console.error("Error checking geolocation permission:", error);
      return "unknown";
    }
  }, []);

  /**
   * Success handler for geolocation API
   */
  const handleSuccess = useCallback((position) => {
    const { coords, timestamp } = position;

    setLocation({
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      altitude: coords.altitude,
      altitudeAccuracy: coords.altitudeAccuracy,
      heading: coords.heading,
      speed: coords.speed,
      timestamp,
    });

    setError(null);
  }, []);

  /**
   * Error handler for geolocation API
   */
  const handleError = useCallback((err) => {
    setError({
      code: err.code,
      message: err.message,
      PERMISSION_DENIED: err.code === 1,
      POSITION_UNAVAILABLE: err.code === 2,
      TIMEOUT: err.code === 3,
    });
  }, []);

  /**
   * Get current location once
   */
  const getCurrentPosition = useCallback(() => {
    if (!isSupported) {
      setError({
        code: 0,
        message: "Geolocation is not supported by this browser.",
      });
      return Promise.reject(
        new Error("Geolocation is not supported by this browser.")
      );
    }

    const positionOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge,
    };

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleSuccess(position);
          resolve(position);
        },
        (error) => {
          handleError(error);
          reject(error);
        },
        positionOptions
      );
    });
  }, [
    isSupported,
    enableHighAccuracy,
    timeout,
    maximumAge,
    handleSuccess,
    handleError,
  ]);

  /**
   * Start watching location
   */
  const startWatching = useCallback(() => {
    if (!isSupported) {
      setError({
        code: 0,
        message: "Geolocation is not supported by this browser.",
      });
      return false;
    }

    // Don't start if already watching
    if (isWatching || watchIdRef.current !== null) {
      return true;
    }

    const positionOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge,
    };

    try {
      const watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        positionOptions
      );

      watchIdRef.current = watchId;
      setIsWatching(true);
      return true;
    } catch (err) {
      console.error("Error starting location watch:", err);
      setError({
        code: 0,
        message: `Error starting location watch: ${err.message}`,
      });
      return false;
    }
  }, [
    isSupported,
    isWatching,
    enableHighAccuracy,
    timeout,
    maximumAge,
    handleSuccess,
    handleError,
  ]);

  /**
   * Stop watching location
   */
  const stopWatching = useCallback(() => {
    if (!isSupported || watchIdRef.current === null) {
      return false;
    }

    try {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsWatching(false);
      return true;
    } catch (err) {
      console.error("Error stopping location watch:", err);
      return false;
    }
  }, [isSupported]);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Start watching by default if configured
  useEffect(() => {
    if (watchByDefault) {
      startWatching();
    }

    // Clean up by stopping watch
    return () => {
      if (watchIdRef.current !== null) {
        stopWatching();
      }
    };
  }, [watchByDefault, startWatching, stopWatching]);

  return {
    location,
    error,
    isWatching,
    permissionStatus,
    isSupported,
    getCurrentPosition,
    startWatching,
    stopWatching,
    checkPermission,
  };
};

export default useLocation;
