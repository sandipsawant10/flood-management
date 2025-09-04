import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

// Register Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log(
          "✅ Service Worker registered successfully:",
          registration.scope
        );

        // Check for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New content is available
              if (confirm("New version available! Reload to update?")) {
                window.location.reload();
              }
            }
          });
        });
      })
      .catch((error) => {
        console.error("❌ Service Worker registration failed:", error);
      });
  });

  // Handle offline/online status
  window.addEventListener("online", () => {
    console.log("🌐 Back online");
    document.body.classList.remove("offline");
  });

  window.addEventListener("offline", () => {
    console.log("📵 Gone offline");
    document.body.classList.add("offline");
  });
}

// Request notification permission
if ("Notification" in window && "serviceWorker" in navigator) {
  if (Notification.permission === "default") {
    Notification.requestPermission().then((permission) => {
      console.log("Notification permission:", permission);
    });
  }
}
