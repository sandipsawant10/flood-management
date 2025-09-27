import React from "react";
import { Link } from "react-router-dom";

const CallToAction = () => {
  return (
    <section id="cta" className="relative py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
      <div
        className="absolute inset-0 -z-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.5), transparent 60%)",
        }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
          Join The Network That Turns Minutes Into Saved Lives
        </h2>
        <p className="text-sky-100/90 dark:text-slate-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
          Every validated report sharpens response accuracy. Become an early
          reporter, validator, or coordinator today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="px-8 py-3 rounded-md text-base font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-500 shadow hover:from-sky-400 hover:to-indigo-400 transition-colors"
          >
            Create Account
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 rounded-md text-base font-medium bg-white/10 backdrop-blur text-white hover:bg-white/20 border border-white/20 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
