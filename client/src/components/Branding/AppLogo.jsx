import React from "react";
import logoImage from "../../assets/logo.jpg";
const AppLogo = ({ size = 40, withText = true, className = "" }) => {
  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      aria-label="Aqua Assists"
      role="img"
    >
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-md shadow-sm"
        style={{ width: size, height: size }}
      >
        <img
          src={logoImage}
          alt="Aqua Assists Logo"
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
      {withText && (
        <span className="font-semibold tracking-tight text-lg bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400">
          Aqua Assists
        </span>
      )}
    </div>
  );
};

export default AppLogo;
