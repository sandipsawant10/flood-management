import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../contexts/languageContextDef";

const Hero = () => {
  const { t, currentLanguage } = useLanguage();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
      <div
        className="absolute inset-0 -z-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.3), transparent 60%)",
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
        {/* Debug: Current Language Indicator */}
        <div className="mb-4 text-xs bg-black/30 text-white/80 px-3 py-1 rounded-full inline-block">
          Language: {currentLanguage} | Title: {t("hero.title")}
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
          {t("hero.title")}{" "}
          <span className="text-sky-200">{t("hero.titleHighlight")}</span>
        </h1>
        <p className="text-lg md:text-2xl text-sky-100/90 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10">
          {t("hero.subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="px-8 py-3 rounded-md text-lg font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-500 shadow hover:from-sky-400 hover:to-indigo-400 transition-colors"
          >
            {t("hero.getStarted")}
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 rounded-md text-lg font-medium bg-white/10 backdrop-blur text-white hover:bg-white/20 border border-white/20 transition-colors"
          >
            {t("hero.signIn")}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
