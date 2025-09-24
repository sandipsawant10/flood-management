import React, { useState } from "react";
import { useLanguage } from "../../contexts/languageContextDef";
import { ChevronDown, Globe, Check } from "lucide-react";

/**
 * Language selector component
 * Allows users to change application language
 */
const LanguageSelector = ({ className = "", compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentLanguage, changeLanguage, availableLanguages, isLoading } =
    useLanguage();

  // Get the current language details
  const currentLanguageDetails = availableLanguages[currentLanguage];

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!isLoading) {
      setIsOpen(!isOpen);
    }
  };

  // Handle language selection
  const handleLanguageSelect = (languageCode) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        className={`flex items-center justify-between ${
          compact
            ? "p-1.5 rounded-md text-gray-700"
            : "px-3 py-2 rounded-md border border-gray-300 text-gray-700"
        } bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={toggleDropdown}
        disabled={isLoading}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Globe className={`${compact ? "h-4 w-4" : "h-5 w-5"} mr-1`} />
        {!compact && (
          <span className="mx-1 text-sm font-medium">
            {currentLanguageDetails?.nativeName || "Language"}
          </span>
        )}
        <ChevronDown
          className={`${
            compact ? "h-3 w-3" : "h-4 w-4"
          } ml-1 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="listbox" aria-label="Select language">
            {Object.entries(availableLanguages).map(([code, language]) => (
              <button
                key={code}
                className={`flex items-center justify-between w-full text-left px-4 py-2 text-sm ${
                  currentLanguage === code
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                role="option"
                aria-selected={currentLanguage === code}
                onClick={() => handleLanguageSelect(code)}
              >
                <span>
                  {language.nativeName}
                  <span className="ml-1 text-gray-400">({language.name})</span>
                </span>
                {currentLanguage === code && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
