/**
 * Language Service
 * Provides utilities for internationalization (i18n) support
 */

import en from "../locales/en.json";
import hi from "../locales/hi.json";
import ta from "../locales/ta.json";
import bn from "../locales/bn.json";
import te from "../locales/te.json";
import ar from "../locales/ar.json";
import es from "../locales/es.json";
import fr from "../locales/fr.json";

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
  ar: { name: "Arabic", nativeName: "العربية", rtl: true },
  es: { name: "Spanish", nativeName: "Español", rtl: false },
  fr: { name: "French", nativeName: "Français", rtl: false },
};

// Translations storage - statically bundled into memory
const translations = {
  en,
  hi,
  ta,
  bn,
  te,
  ar,
  es,
  fr,
};

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
    languageCode = DEFAULT_LANGUAGE;
  }
  return translations[languageCode] || translations[DEFAULT_LANGUAGE] || {};
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

    console.log("languageService: Language change event dispatched for", languageCode);
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
  translate: (key, params = {}, fallback = "") => {
    if (!key) return fallback;

    // Handle case where second argument is string (fallback string passed as 2nd arg)
    let actualParams = params;
    let actualFallback = fallback;
    if (typeof params === "string") {
      actualFallback = params;
      actualParams = {};
    }

    const getValue = (data, k) => {
      const keyParts = k.split(".");
      let val = data;
      for (const part of keyParts) {
        if (val && typeof val === "object" && part in val) {
          val = val[part];
        } else {
          return undefined;
        }
      }
      return typeof val === "string" ? val : undefined;
    };

    const currentLangData = translations[currentLanguage] || {};
    let text = getValue(currentLangData, key);

    // Fallback to default language if key not found in current language
    if (text === undefined && currentLanguage !== DEFAULT_LANGUAGE) {
      const defaultLangData = translations[DEFAULT_LANGUAGE] || {};
      text = getValue(defaultLangData, key);
    }

    // Fallback if still not found
    if (text === undefined) {
      text = actualFallback || key;
    }

    // Replace parameters in the translation string
    if (actualParams && typeof actualParams === "object" && Object.keys(actualParams).length) {
      let result = text;
      Object.keys(actualParams).forEach((param) => {
        result = result.replace(new RegExp(`{{${param}}}`, "g"), actualParams[param]);
      });
      return result;
    }

    return text;
  },
};

// Create a shorthand for translate function
export const t = (key, params, fallback) => languageService.translate(key, params, fallback);



