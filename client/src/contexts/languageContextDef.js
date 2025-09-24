import { createContext, useContext } from "react";

// Create context
export const LanguageContext = createContext();

/**
 * Custom hook to use language context
 * @returns {Object} Language context value
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
};
