import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "../checkReactQueryV5";
import { BrowserRouter as Router } from "react-router-dom";

// Register service worker for offline capabilities
import { registerServiceWorker } from "./services/serviceWorkerRegistration";

// Initialize offline capabilities
const initOfflineCapabilities = async () => {
  try {
    // Register service worker
    await registerServiceWorker();

    // Prefetch essential data for offline use once user is authenticated
    // We'll trigger this from App.jsx after user authentication
    console.log("Service worker registered successfully");
  } catch (error) {
    console.error("Failed to initialize offline capabilities:", error);
  }
};

// Initialize offline capabilities
initOfflineCapabilities();

createRoot(document.getElementById("root")).render(
  <Router>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </Router>
);
