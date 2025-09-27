import React from "react";
import { useLanguage } from "../../contexts/languageContextDef";

/**
 * Test component to verify language translations are working
 */
const LanguageTest = () => {
  const { currentLanguage, t } = useLanguage();

  return (
    <div className="fixed top-4 left-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 max-w-sm">
      <h3 className="font-bold text-sm mb-2">Language Test</h3>

      <div className="space-y-2 text-xs">
        <p>
          <strong>Current Language:</strong> {currentLanguage}
        </p>

        <div className="border-t pt-2">
          <p>
            <strong>Test Translations:</strong>
          </p>
          <p>App Name: {t("app.name")}</p>
          <p>Home: {t("navigation.home")}</p>
          <p>Dashboard: {t("navigation.dashboard")}</p>
          <p>Loading: {t("common.loading")}</p>
          <p>Emergency: {t("emergency.emergencyServices")}</p>
        </div>

        <div className="border-t pt-2">
          <p>
            <strong>Fallback Test:</strong>
          </p>
          <p>Non-existent: {t("nonexistent.key")}</p>
        </div>
      </div>
    </div>
  );
};

export default LanguageTest;
