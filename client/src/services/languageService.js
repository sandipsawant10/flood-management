/**
 * Language Service
 * Provides utilities for internationalization (i18n) support
 */

// Default language
const DEFAULT_LANGUAGE = "en";
// Language storage key for persisting user preference
const LANGUAGE_STORAGE_KEY = "userLanguagePreference";
// Available languages
const AVAILABLE_LANGUAGES = {
  en: { name: "English", nativeName: "English", rtl: false },
  hi: { name: "Hindi", nativeName: "हिन्दी", rtl: false },
  ta: { name: "Tamil", nativeName: "தமிழ்", rtl: false },
  bn: { name: "Bengali", nativeName: "বাংলা", rtl: false },
  te: { name: "Telugu", nativeName: "తెలుగు", rtl: false },
};

// Translations storage
let translations = {};
let currentLanguage = loadSavedLanguage() || DEFAULT_LANGUAGE;

/**
 * Load language preference from storage
 * @returns {string|null} Saved language code
 */
function loadSavedLanguage() {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch (error) {
    console.error("Error loading saved language:", error);
    return null;
  }
}

/**
 * Save language preference to storage
 * @param {string} languageCode - Language code to save
 */
function saveLanguagePreference(languageCode) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
  } catch (error) {
    console.error("Error saving language preference:", error);
  }
}

/**
 * Load translations for a specific language
 * @param {string} languageCode - Language code to load
 * @returns {Promise} Resolves when translations are loaded
 */
async function loadTranslations(languageCode) {
  if (!AVAILABLE_LANGUAGES[languageCode]) {
    console.warn(
      `Language ${languageCode} not supported, falling back to ${DEFAULT_LANGUAGE}`
    );
    languageCode = DEFAULT_LANGUAGE;
  }

  // Check if translations already loaded
  if (translations[languageCode]) {
    return translations[languageCode];
  }

  try {
    console.log(`Loading translations for ${languageCode}...`);
    // In production, load from server or bundled files
    const response = await import(`../locales/${languageCode}.json`);
    translations[languageCode] = response.default || response;
    console.log(
      `Loaded ${languageCode} translations:`,
      Object.keys(translations[languageCode])
    );
    return translations[languageCode];
  } catch (error) {
    console.error(`Failed to load translations for ${languageCode}:`, error);

    // If we fail to load the requested language, try loading default
    if (languageCode !== DEFAULT_LANGUAGE) {
      console.warn(`Falling back to ${DEFAULT_LANGUAGE}`);
      return loadTranslations(DEFAULT_LANGUAGE);
    }

    // If even default fails, return empty object to avoid errors
    return {};
  }
}

export const languageService = {
  /**
   * Initialize the language service
   * @returns {Promise} Resolves when initialized
   */
  init: async () => {
    await loadTranslations(currentLanguage);
    document.documentElement.lang = currentLanguage;

    // Set RTL/LTR direction
    if (AVAILABLE_LANGUAGES[currentLanguage]?.rtl) {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }

    return currentLanguage;
  },

  /**
   * Change the current language
   * @param {string} languageCode - New language code
   * @returns {Promise} Resolves when language is changed
   */
  changeLanguage: async (languageCode) => {
    console.log("languageService: changeLanguage called with:", languageCode);

    if (!AVAILABLE_LANGUAGES[languageCode]) {
      throw new Error(`Language ${languageCode} is not supported`);
    }

    await loadTranslations(languageCode);
    console.log("languageService: Translations loaded for", languageCode);
    console.log(
      "languageService: Available translations:",
      Object.keys(translations[languageCode] || {})
    );

    currentLanguage = languageCode;
    saveLanguagePreference(languageCode);
    document.documentElement.lang = languageCode;

    // Set RTL/LTR direction
    if (AVAILABLE_LANGUAGES[languageCode]?.rtl) {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }

    // Dispatch an event so components can update
    window.dispatchEvent(
      new CustomEvent("languagechange", { detail: { language: languageCode } })
    );

    console.log("languageService: Language change event dispatched");
    return languageCode;
  },

  /**
   * Get the current language code
   * @returns {string} Current language code
   */
  getCurrentLanguage: () => currentLanguage,

  /**
   * Get list of available languages
   * @returns {Object} Available languages
   */
  getAvailableLanguages: () => AVAILABLE_LANGUAGES,

  /**
   * Check if a language is RTL
   * @param {string} languageCode - Language code to check
   * @returns {boolean} True if RTL
   */
  isRTL: (languageCode = currentLanguage) => {
    return AVAILABLE_LANGUAGES[languageCode]?.rtl || false;
  },

  /**
   * Translate a key to current language
   * @param {string} key - Translation key (dot notation for nested keys)
   * @param {Object} params - Parameters to replace in translation
   * @returns {string} Translated text
   */
  translate: (key, params = {}) => {
    if (!key) return "";

    const langData = translations[currentLanguage] || {};

    // Handle nested keys with dot notation (e.g., 'geolocation.directions.north')
    const keyParts = key.split(".");
    let value = langData;

    // Navigate through nested objects
    for (const part of keyParts) {
      if (value && typeof value === "object" && part in value) {
        value = value[part];
      } else {
        // Key not found in translations, return the key itself
        return key;
      }
    }

    // If we found a string value, use it; otherwise return the key
    const text = typeof value === "string" ? value : key;

    // Replace parameters in the translation string
    if (params && Object.keys(params).length) {
      let result = text;
      Object.keys(params).forEach((param) => {
        result = result.replace(new RegExp(`{{${param}}}`, "g"), params[param]);
      });
      return result;
    }

    return text;
  },
};

// Create a shorthand for translate function
export const t = (key, params) => languageService.translate(key, params);
