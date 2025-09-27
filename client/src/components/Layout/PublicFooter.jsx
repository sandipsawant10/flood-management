import React from "react";
import AppLogo from "../Branding/AppLogo";

const footerLinks = [
  {
    heading: "Platform",
    links: ["Reporting", "Emergency Alerts", "Mapping", "Validation"],
  },
  {
    heading: "Resources",
    links: ["Docs", "API", "Community", "Support"],
  },
  {
    heading: "Emergency",
    links: ["Police: 100", "Fire: 101", "Medical: 108", "Disaster: 1070"],
  },
];

const PublicFooter = () => {
  return (
    <footer
      className="bg-slate-950 text-slate-300 pt-16 pb-10 dark:bg-black"
      id="footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-4">
            <AppLogo withText />
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              Technology and collective action to protect communities from flood
              disasters through early reporting and coordinated response.
            </p>
          </div>
          {footerLinks.map((section) => (
            <div key={section.heading}>
              <h3 className="font-semibold text-white mb-4 text-sm tracking-wide uppercase">
                {section.heading}
              </h3>
              <ul className="space-y-2 text-sm">
                {section.links.map((item) => (
                  <li
                    key={item}
                    className="hover:text-white cursor-default transition-colors"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm tracking-wide uppercase">
              Contact
            </h3>
            <ul className="space-y-2 text-sm">
              <li>Email: support@example.com</li>
              <li>24/7 Emergency Desk</li>
              <li>Community: Discord</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-12 pt-6 text-xs text-slate-500 text-center">
          &copy; {new Date().getFullYear()} Aqua Assists. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
