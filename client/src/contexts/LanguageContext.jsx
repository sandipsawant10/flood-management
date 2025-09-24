import React, { useState, useEffect } from "react";
import { LanguageContext } from "./languageContextDef";
import { languageService } from "../services/languageService";

/**
 * Language Provider component
 * Manages language state and provides translation function
 */
const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(
    languageService.getCurrentLanguage()
  );
  const [isRTL, setIsRTL] = useState(languageService.isRTL());
  const [isLoading, setIsLoading] = useState(true);

  // Initialize language service
  useEffect(() => {
    const initLanguage = async () => {
      try {
        await languageService.init();
        setCurrentLanguage(languageService.getCurrentLanguage());
        setIsRTL(languageService.isRTL());
      } catch (error) {
        console.error("Failed to initialize language service:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initLanguage();
  }, []);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (event) => {
      setCurrentLanguage(event.detail.language);
      setIsRTL(languageService.isRTL(event.detail.language));
    };

    window.addEventListener("languagechange", handleLanguageChange);

    return () => {
      window.removeEventListener("languagechange", handleLanguageChange);
    };
  }, []);

  // Change language function
  const changeLanguage = async (languageCode) => {
    try {
      setIsLoading(true);
      await languageService.changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      setIsRTL(languageService.isRTL(languageCode));
      return true;
    } catch (error) {
      console.error("Failed to change language:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Translate function (shorthand for languageService.translate)
  const translate = (key, params) => languageService.translate(key, params);

  // Context value
  const contextValue = {
    currentLanguage,
    isRTL,
    isLoading,
    changeLanguage,
    translate,
    t: translate, // Alias for translate
    availableLanguages: languageService.getAvailableLanguages(),
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
