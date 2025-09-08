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

// Pages
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import Dashboard from "./pages/Dashboard/Dashboard";
import ReportFlood from "./pages/Reports/ReportFlood";
import ViewReports from "./pages/Reports/ViewReports";
import ReportDetail from "./pages/Reports/ReportDetail";
import Alerts from "./pages/Alerts/Alerts";
import Emergency from "./pages/Emergency/Emergency";
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

          {/* Header */}
          <header className="flex flex-col items-center py-6 bg-white border-b mb-6 w-full shadow-sm">
            <img src={logo} alt="AquaAssist Logo" className="w-24 h-24 mb-2" />
            <h1 className="text-3xl font-bold text-gray-800">
              Aqua<span className="text-blue-500">Assists</span>
            </h1>
            {user && (
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {user.name}!
              </p>
            )}
          </header>

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={token ? <Navigate to="/dashboard" /> : <Login />}
            />
            <Route
              path="/register"
              element={token ? <Navigate to="/dashboard" /> : <Register />}
            />
            <Route
              path="/forgot-password"
              element={token ? <Navigate to="/dashboard" /> : <ForgotPassword />}
            />
            <Route
              path="/reset-password/:token"
              element={token ? <Navigate to="/dashboard" /> : <ResetPassword />}
            />
            <Route path="/emergency" element={<Emergency />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-flood"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ReportFlood />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ViewReports />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ReportDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/alerts"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Alerts />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <Layout>
                    <FloodMap />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Layout>
                    <NotificationCenter />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notification-test"
              element={
                <ProtectedRoute>
                  <Layout>
                    <NotificationTest />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfileSettings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Analytics />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              className: "",
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
                padding: "16px",
                borderRadius: "8px",
                fontSize: "14px",
                maxWidth: "500px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              },
              success: { style: { background: "#10B981" } },
              error: { style: { background: "#EF4444" } },
              loading: { style: { background: "#3B82F6" } },
              custom: {
                style: { background: "#DC2626", border: "2px solid #FEE2E2" },
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
