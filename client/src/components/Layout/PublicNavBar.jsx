import React, { useState } from "react";
import { Link } from "react-router-dom";
import AppLogo from "../Branding/AppLogo";
import { Menu, X } from "lucide-react";
import ThemeToggle from "../Common/ThemeToggle";
import LanguageSelector from "../Common/LanguageSelector";

const PublicNavBar = () => {
  const [open, setOpen] = useState(false);

  const linkBase =
    "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors";

  return (
    <nav className="sticky top-0 z-30 w-full backdrop-blur bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/70 dark:border-slate-800/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <AppLogo size={34} />
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className={linkBase}>
              Features
            </a>
            <a href="#how" className={linkBase}>
              How it works
            </a>
            <a href="#cta" className={linkBase}>
              Get Started
            </a>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector compact />
            <ThemeToggle />
            <Link
              to="/login"
              className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-gradient-to-r from-sky-600 to-indigo-600 shadow hover:from-sky-500 hover:to-indigo-500"
            >
              Register
            </Link>
            <button
              className="md:hidden p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
          <div className="px-4 py-4 flex flex-col gap-4 text-sm font-medium">
            <a
              href="#features"
              className={linkBase}
              onClick={() => setOpen(false)}
            >
              Features
            </a>
            <a href="#how" className={linkBase} onClick={() => setOpen(false)}>
              How it works
            </a>
            <a href="#cta" className={linkBase} onClick={() => setOpen(false)}>
              Get Started
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicNavBar;
