import useLocation from "./useLocation";

/**
 * Compatibility wrapper around useLocation to provide a `coordinates` field
 * which existing components expect as `useGeolocation`.
 */
export const useGeolocation = (options = {}) => {
  const {
    location,
    error,
    isWatching,
    permissionStatus,
    isSupported,
    getCurrentPosition,
    startWatching,
    stopWatching,
    checkPermission,
  } = useLocation(options);

  return {
    coordinates: location,
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

export default useGeolocation;
