import React from "react";
import { Sun, Moon } from "lucide-react";
import useTheme from "../../hooks/useTheme";

/**
 * ThemeToggle
 * Reusable dark/light mode toggle button.
 * Accepts optional className to merge additional utility classes.
 */
const ThemeToggle = ({ className = "" }) => {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className={`p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
};

export default ThemeToggle;
