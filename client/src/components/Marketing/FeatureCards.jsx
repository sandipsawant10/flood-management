import React from "react";
import { AlertTriangle, Shield, MapPin, Users } from "lucide-react";

const items = [
  {
    icon: AlertTriangle,
    title: "Real-time Reporting",
    text: "Crowd-sourced flood condition capture with geo-tagging & media uploads.",
    color: "from-sky-500/10 to-sky-500/0",
  },
  {
    icon: Shield,
    title: "Coordinated Response",
    text: "Unified dashboard for emergency teams to prioritize and deploy resources.",
    color: "from-indigo-500/10 to-indigo-500/0",
  },
  {
    icon: MapPin,
    title: "Dynamic Mapping",
    text: "Layered severity visualization & infrastructure impact overlays.",
    color: "from-blue-500/10 to-blue-500/0",
  },
  {
    icon: Users,
    title: "Validation Engine",
    text: "Community + official review workflow to elevate trusted reports.",
    color: "from-violet-500/10 to-violet-500/0",
  },
];

const FeatureCards = () => {
  return (
    <section id="features" className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
            Built For High-Risk Communities
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Aqua Assists unifies citizen intelligence and emergency coordination
            so decisions happen minutes—not hours—faster.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((card) => (
            <div
              key={card.title}
              className="group relative rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className={`absolute inset-0 rounded-xl bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
              />
              <div className="relative flex flex-col h-full">
                <div className="w-12 h-12 rounded-md bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center mb-5 shadow">
                  <card.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-lg">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                  {card.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
