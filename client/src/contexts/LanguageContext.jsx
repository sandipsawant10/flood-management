import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  const [isLoading, setIsLoading] = useState(false);

  // Initialize language service
  useEffect(() => {
    const initLanguage = async () => {
      try {
        await languageService.init();
        setCurrentLanguage(languageService.getCurrentLanguage());
        setIsRTL(languageService.isRTL());
      } catch (error) {
        console.error("Failed to initialize language service:", error);
      }
    };

    initLanguage();
  }, []);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (event) => {
      const newLang = event.detail?.language || languageService.getCurrentLanguage();
      setCurrentLanguage(newLang);
      setIsRTL(languageService.isRTL(newLang));
    };

    window.addEventListener("languagechange", handleLanguageChange);

    return () => {
      window.removeEventListener("languagechange", handleLanguageChange);
    };
  }, []);

  // Change language function
  const changeLanguage = useCallback(async (languageCode) => {
    try {
      console.log("LanguageContext: Changing language to:", languageCode);
      setIsLoading(true);
      await languageService.changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      setIsRTL(languageService.isRTL(languageCode));
      console.log(
        "LanguageContext: Language changed successfully to:",
        languageCode
      );
      return true;
    } catch (error) {
      console.error("Failed to change language:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Translate function (shorthand for languageService.translate)
  const translate = useCallback((key, params) => {
    return languageService.translate(key, params);
  }, [currentLanguage]);

  // Context value
  const contextValue = useMemo(() => ({
    currentLanguage,
    isRTL,
    isLoading,
    changeLanguage,
    translate,
    t: translate, // Alias for translate
    availableLanguages: languageService.getAvailableLanguages(),
  }), [currentLanguage, isRTL, isLoading, changeLanguage, translate]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;

