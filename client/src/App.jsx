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
import Dashboard from "./pages/Dashboard/Dashboard";
import ReportFlood from "./pages/Reports/ReportFlood";
import ViewReports from "./pages/Reports/ViewReports";
import ReportDetail from "./pages/Reports/ReportDetail";
// import AlertsPage from "./pages/Alerts/AlertsPage";
import Alerts from "./pages/Alerts/Alerts";
import Emergency from "./pages/Emergency/Emergency";
import ProfileSettings from "./pages/Profile/ProfileSettings";
import Analytics from "./pages/Analytics/Analytics";
import FloodMap from "./pages/Map/FloodMap";
import NotificationCenter from "./pages/Notifications/NotificationCenter";

// Assets
import "./App.css";
import logo from "./assets/logo.jpg";

// Store
import { useAuthStore } from "./store/authStore";

// Services
import { initializeSocket } from "./services/socketService";

// Enhanced Query Client with offline support
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry if offline
        if (!navigator.onLine) return false;
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      // Enable background refetch when back online
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry mutations if offline
        if (!navigator.onLine) return false;
        return failureCount < 2;
      },
    },
  },
});

function App() {
  const { token, initializeAuth, user } = useAuthStore();

  useEffect(() => {
    // Initialize authentication from localStorage
    initializeAuth();

    // Initialize socket connection if authenticated
    if (token) {
      initializeSocket(token);
    }
  }, [token, initializeAuth]);

  // Register Service Worker
  useEffect(() => {
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
                  if (
                    confirm(
                      "FloodGuard has been updated! Reload to get the latest version?"
                    )
                  ) {
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
        console.log("🌐 Back online - syncing data");
        document.body.classList.remove("offline");
        // Refetch all queries when back online
        queryClient.refetchQueries();
      });

      window.addEventListener("offline", () => {
        console.log("📵 Gone offline");
        document.body.classList.add("offline");
      });
    }

    // Request notification permission for PWA
    if ("Notification" in window && "serviceWorker" in navigator) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          console.log("Notification permission:", permission);
        });
      }
    }
  }, []);

  // PWA Install Prompt
  useEffect(() => {
    let deferredPrompt;

    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e;

      // Show install button/prompt in your UI if needed
      console.log("PWA install prompt available");
    };

    const handleAppInstalled = () => {
      console.log("FloodGuard PWA was installed");
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

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          {/* Offline Status Indicator */}
          <OfflineStatus />

          {/* Header */}
          <header className="flex flex-col items-center py-6 bg-white border-b mb-6 w-full shadow-sm">
            <img src={logo} alt="FloodGuard Logo" className="w-24 h-24 mb-2" />
            <h1 className="text-3xl font-bold text-gray-800">
              Flood<span className="text-blue-500">Guard</span>
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
                    <AlertsPage />
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

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          {/* Enhanced Toast Notifications */}
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

              // Success toast styling
              success: {
                duration: 3000,
                style: {
                  background: "#10B981",
                  color: "#fff",
                },
                iconTheme: {
                  primary: "#fff",
                  secondary: "#10B981",
                },
              },

              // Error toast styling
              error: {
                duration: 5000,
                style: {
                  background: "#EF4444",
                  color: "#fff",
                },
                iconTheme: {
                  primary: "#fff",
                  secondary: "#EF4444",
                },
              },

              // Loading toast styling
              loading: {
                duration: Infinity,
                style: {
                  background: "#3B82F6",
                  color: "#fff",
                },
                iconTheme: {
                  primary: "#fff",
                  secondary: "#3B82F6",
                },
              },

              // Emergency/Warning toast styling
              custom: {
                duration: 6000,
                style: {
                  background: "#DC2626",
                  color: "#fff",
                  border: "2px solid #FEE2E2",
                },
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
