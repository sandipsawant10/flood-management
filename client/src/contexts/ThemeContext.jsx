import React, { createContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext({ theme: "light", toggle: () => {} });

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "dark" || stored === "light") {
        setTheme(stored);
        updateDocumentClass(stored);
      } else {
        // Auto-detect system preference
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        const defaultTheme = prefersDark ? "dark" : "light";
        setTheme(defaultTheme);
        updateDocumentClass(defaultTheme);
        localStorage.setItem("theme", defaultTheme);
      }
    } catch (error) {
      console.error("Error initializing theme:", error);
      // Fallback to light theme
      setTheme("light");
      updateDocumentClass("light");
    }
  }, []);

  const updateDocumentClass = (themeValue) => {
    if (themeValue === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme", next);
        updateDocumentClass(next);
      } catch (error) {
        console.error("Error saving theme to localStorage:", error);
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
export { ThemeContext };
