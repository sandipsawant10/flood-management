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

// Pages
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import ReportFlood from "./pages/Reports/ReportFlood";
import ViewReports from "./pages/Reports/ViewReports";
import ReportDetail from "./pages/Reports/ReportDetail";
import Alerts from "./pages/Alerts/Alerts";
import Emergency from "./pages/Emergency/Emergency";
import Profile from "./pages/Profile/Profile";
import Analytics from "./pages/Analytics/Analytics";

import "./App.css";
import logo from "./assets/logo.jpg";

// Store
import { useAuthStore } from "./store/authStore";

// Services
import { initializeSocket } from "./services/socketService";

// Styles
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const { token, initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize authentication from localStorage
    initializeAuth();

    // Initialize socket connection if authenticated
    if (token) {
      initializeSocket(token);
    }
  }, [token, initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <header className="flex flex-col items-center py-6 bg-white border-b mb-6 w-full">
          <img src={logo} alt="Aqua Assists Logo" className="w-24 h-24 mb-2" />
          <h1 className="text-3xl font-bold text-gray-800">
            Aqua <span className="text-blue-500">Assists</span>
          </h1>
        </header>
        <div className="App min-h-screen bg-gray-50">
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
              path="/emergency"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Emergency />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
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

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
              // Define default options
              className: "",
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
                padding: "16px",
                borderRadius: "8px",
                fontSize: "14px",
                maxWidth: "500px",
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

              // Warning/custom toast styling
              custom: {
                duration: 4000,
                style: {
                  background: "#F59E0B",
                  color: "#fff",
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
