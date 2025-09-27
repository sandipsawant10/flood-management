import React, { Suspense, lazy } from "react";
import PublicNavBar from "../components/Layout/PublicNavBar";
import PublicFooter from "../components/Layout/PublicFooter";

// Lazy loaded marketing sections
const Hero = lazy(() => import("../components/Marketing/Hero"));
const FeatureCards = lazy(() => import("../components/Marketing/FeatureCards"));
const CallToAction = lazy(() => import("../components/Marketing/CallToAction"));

// New simplified marketing landing page using modular components.
// All previous inline sections removed for maintainability and clearer structure.
const Home = () => {
  return (
    <div className="flex min-h-screen flex-col bg-app-base">
      <PublicNavBar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="animate-pulse py-24 text-center text-app-muted">
              Loading content...
            </div>
          }
        >
          <Hero />
          <FeatureCards />
          <CallToAction />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
};

export default Home;
