/**
 * Authentication token helper utility
 * Provides consistent token access across the application
 */

/**
 * Get the current authentication token from storage
 * @returns {string|null} The current token or null if not found
 */
export const getAuthToken = () => {
  // First check if there's a direct token in localStorage (legacy)
  const directToken = localStorage.getItem("token");
  if (directToken) {
    return directToken;
  }

  // Check sessionData in localStorage
  let sessionData = localStorage.getItem("sessionData");
  if (sessionData) {
    try {
      const parsed = JSON.parse(sessionData);
      if (parsed.token) {
        return parsed.token;
      }
    } catch (e) {
      // Continue to sessionStorage check
    }
  }

  // Check sessionData in sessionStorage
  sessionData = sessionStorage.getItem("sessionData");
  if (sessionData) {
    try {
      const parsed = JSON.parse(sessionData);
      if (parsed.token) {
        return parsed.token;
      }
    } catch (e) {
      // Return null if parsing fails
    }
  }

  return null;
};

/**
 * Set the authentication token in both places for compatibility
 * @param {string} token The token to store
 */
export const setAuthToken = (token) => {
  // Store in localStorage for compatibility with existing code
  localStorage.setItem("token", token);

  // Also update sessionData if it exists
  let sessionData = localStorage.getItem("sessionData");
  if (sessionData) {
    try {
      const parsed = JSON.parse(sessionData);
      parsed.token = token;
      localStorage.setItem("sessionData", JSON.stringify(parsed));
    } catch (e) {
      // If parsing fails, create new sessionData
      localStorage.setItem("sessionData", JSON.stringify({ token }));
    }
  }
};

/**
 * Clear authentication token from all storage locations
 */
export const clearAuthToken = () => {
  localStorage.removeItem("token");

  // Also clear from sessionData
  const sessionDataLocal = localStorage.getItem("sessionData");
  if (sessionDataLocal) {
    try {
      const parsed = JSON.parse(sessionDataLocal);
      delete parsed.token;
      localStorage.setItem("sessionData", JSON.stringify(parsed));
    } catch (e) {
      // If parsing fails, remove the entire sessionData
      localStorage.removeItem("sessionData");
    }
  }

  const sessionDataSession = sessionStorage.getItem("sessionData");
  if (sessionDataSession) {
    try {
      const parsed = JSON.parse(sessionDataSession);
      delete parsed.token;
      sessionStorage.setItem("sessionData", JSON.stringify(parsed));
    } catch (e) {
      // If parsing fails, remove the entire sessionData
      sessionStorage.removeItem("sessionData");
    }
  }
};
