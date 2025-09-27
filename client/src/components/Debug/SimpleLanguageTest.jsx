import React from "react";
import { useLanguage } from "../../contexts/languageContextDef";

/**
 * Simple language test component to diagnose language switching issues
 */
const SimpleLanguageTest = () => {
  const { currentLanguage, changeLanguage, t, availableLanguages } =
    useLanguage();

  const handleLanguageChange = (langCode) => {
    console.log("SimpleLanguageTest: Attempting to change to", langCode);
    changeLanguage(langCode);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 max-w-xs">
      <h3 className="font-bold text-sm mb-2">Language Debug</h3>

      <div className="space-y-2 text-xs">
        <p>
          <strong>Current:</strong> {currentLanguage}
        </p>

        <div>
          <strong>Quick Switch:</strong>
          <div className="flex gap-1 mt-1">
            <button
              onClick={() => handleLanguageChange("en")}
              className={`px-2 py-1 text-xs rounded ${
                currentLanguage === "en"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => handleLanguageChange("hi")}
              className={`px-2 py-1 text-xs rounded ${
                currentLanguage === "hi"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              HI
            </button>
          </div>
        </div>

        <div className="border-t pt-2">
          <strong>Test Translations:</strong>
          <p>hero.title: "{t("hero.title")}"</p>
          <p>hero.getStarted: "{t("hero.getStarted")}"</p>
          <p>app.name: "{t("app.name")}"</p>
        </div>

        <div className="border-t pt-2">
          <strong>Available:</strong>{" "}
          {Object.keys(availableLanguages).join(", ")}
        </div>
      </div>
    </div>
  );
};

export default SimpleLanguageTest;
