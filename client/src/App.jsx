// src/App.jsx
import React, { useEffect } from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

// Components
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import OfflineStatus from "./components/OfflineStatus";
import adminRoutes from './routes/adminRoutes';

// Pages
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import Dashboard from "./pages/Dashboard/Dashboard";
import Emergency from "./pages/Dashboard/Emergency/Emergency";
import ReportFlood from "./pages/Reports/ReportFlood";
import ViewReports from "./pages/Reports/ViewReports";
import ReportDetail from "./pages/Reports/ReportDetail";
// import AdminRoute from "./components/Auth/AdminRoute"; // No longer needed as adminRoutes handles this
// import UserManagement from "./pages/admin/UserManagement"; // Moved to adminRoutes
// import ReportModeration from "./pages/admin/ReportModeration"; // Moved to adminRoutes
import Alerts from "./pages/Alerts/Alerts";
import ProfileSettings from "./pages/Profile/ProfileSettings";
import Analytics from "./pages/Analytics/Analytics";
import FloodMap from "./pages/Map/FloodMap";
import NotificationCenter from "./pages/Notifications/NotificationCenter";
import NotificationTest from "./pages/NotificationTest";

// Assets
import "./App.css";
import logo from "./assets/logo.jpg";

// Store
import { useAuthStore } from "./store/authStore";

// Services
import { initializeSocket } from "./services/socketService";

// React Query client with offline-friendly options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount) => (!navigator.onLine ? false : failureCount < 3),
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount) => (!navigator.onLine ? false : failureCount < 2),
    },
  },
});

function App() {
  // ✅ Correct way to use Zustand
  const token = useAuthStore((state) => state.token);
  console.log("Auth token:", token);
  const user = useAuthStore((state) => state.user);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  // Initialize auth and socket
  useEffect(() => {
    initializeAuth();

    if (token) {
      initializeSocket(token);
    }
  }, [token, initializeAuth]);

  // Service Worker registration (production only) + online/offline
  useEffect(() => {
    if (
      import.meta.env.NODE_ENV === "production" &&
      "serviceWorker" in navigator
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log(
              "✅ Service Worker registered successfully:",
              registration.scope
            );

            // Listen for updates
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  if (
                    confirm(
                      "AquaAssist has been updated! Reload to get the latest version?"
                    )
                  ) {
                    window.location.reload();
                  }
                }
              });
            });
          })
          .catch((error) =>
            console.error("❌ Service Worker registration failed:", error)
          );
      });
    }

    const handleOnline = () => {
      console.log("🌐 Back online - syncing data");
      document.body.classList.remove("offline");
      queryClient.refetchQueries({ type: "active" });
    };
    const handleOffline = () => {
      console.log("📵 Gone offline");
      document.body.classList.add("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // PWA install prompt
  useEffect(() => {
    let deferredPrompt;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      console.log("PWA install prompt available");
    };

    const handleAppInstalled = () => {
      console.log("AquaAssist PWA was installed");
      deferredPrompt = null;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Notification permission for PWA
  useEffect(() => {
    if ("Notification" in window && "serviceWorker" in navigator) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) =>
          console.log("Notification permission:", permission)
        );
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          <OfflineStatus />
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/emergency" element={<Emergency />} />
                <Route path="/report-flood" element={<ReportFlood />} />
                <Route path="/view-reports" element={<ViewReports />} />
                <Route path="/report/:id" element={<ReportDetail />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/notification-center" element={<NotificationCenter />} />
                <Route path="/profile" element={<ProfileSettings />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/map" element={<FloodMap />} />
                <Route path="/notifications" element={<NotificationCenter />} />
              </Route>

              {/* Admin Routes */}
              {adminRoutes.map((route, index) => (
                <Route
                  key={index}
                  path={route.path}
                  element={route.element}
                >
                  {route.children && route.children.map((childRoute, childIndex) => (
                    <Route
                      key={childIndex}
                      path={childRoute.path}
                      element={childRoute.element}
                    />
                  ))}
                </Route>
              ))}

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
          <Toaster position="top-right" />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
