import React, { useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import useAuth from "./hooks/useAuth";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout/Layout.jsx";
import OfflineStatus from "./components/OfflineStatus";
import { initOfflineService } from "./services/offlineService";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard.jsx";
import ReportFlood from "./pages/Reports/ReportFlood";
import ViewReports from "./pages/Reports/ViewReports";
import QuickActions from "./pages/Emergency/QuickActions";
import NotificationCenter from "./pages/Notifications/NotificationCenter";
import AlertsPage from "./pages/Alerts/AlertsPage.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard.jsx";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminSettings from "./pages/admin/AdminSettings";
import ResourceManagement from "./pages/Municipality/ManageResources.jsx";
import AdminReports from "./pages/Reports/ViewReports.jsx";
import Analytics from "./pages/Analytics/Analytics.jsx";
import DisasterManagement from "./pages/admin/ManageDisasters.jsx";
import RequestManagement from "./pages/admin/ManageRequests.jsx";
import MunicipalityDashboard from "./pages/municipality/MunicipalityDashboard";
import MunicipalityProfile from "./pages/municipality/MunicipalityProfile";
import MunicipalitySettings from "./pages/municipality/MunicipalitySettings";
import MunicipalityAnalytics from "./pages/Municipality/Analytics.jsx";
import MunicipalityReports from "./pages/Reports/ViewReports.jsx";
import MunicipalityResourceManagement from "./pages/Municipality/ManageResources.jsx";
import LoginPage from "./pages/Auth/Login.jsx";
import RegisterPage from "./pages/Auth/Register.jsx";
import AboutPage from "./pages/Home.jsx";

// Unauthorized page component
const UnauthorizedPage = () => (
  <div className="p-8 text-center">
    <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
    <p className="mt-4">You don't have permission to access this page.</p>
    <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
      Go Home
    </Link>
  </div>
);

const App = () => {
  const { authInitialized, loading, error } = useAuth();

  // Initialize service worker and offline capabilities
  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize offline service for offline data sync
        initOfflineService();

        console.log("Offline service initialized");
      } catch (err) {
        console.error("Failed to initialize offline service:", err);
      }
    };

    initApp();
  }, []);

  // Prefetch essential data for offline use when user is authenticated
  useEffect(() => {
    const prefetchData = async () => {
      // Only prefetch data if user is authenticated
      if (authInitialized && !loading && !error) {
        try {
          // Import dynamically to avoid circular dependencies
          const { prefetchEssentialData } = await import(
            "./services/apiCacheService"
          );

          // Prefetch essential data for offline use
          await prefetchEssentialData();

          console.log("Essential data prefetched for offline use");
        } catch (err) {
          console.error("Failed to prefetch essential data:", err);
        }
      }
    };

    prefetchData();
  }, [authInitialized, loading, error]);

  // Handle loading and error states more explicitly
  if (loading) {
    return <div>Loading Application...</div>;
  }

  if (error) {
    console.error("Authentication Error:", error);
    return (
      <div>
        Error: {error.message || "Failed to initialize authentication."}
      </div>
    );
  }

  // Only render the application once authentication is initialized and no errors occurred
  if (!authInitialized) {
    return <div>Initializing Authentication...</div>;
  }

  return (
    <>
      <OfflineStatus />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/emergency" element={<QuickActions />} />
        <Route path="/" element={<Home />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Routes using the Layout component */}
        <Route element={<Layout />}>
          {/* Protected Routes */}
          <Route
            element={
              <PrivateRoute
                allowedRoles={["user", "citizen", "admin", "municipality"]}
              />
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/report-flood" element={<ReportFlood />} />
            <Route path="/reports" element={<ViewReports />} />
            <Route path="/notifications" element={<NotificationCenter />} />
          </Route>
          {/* Admin Routes */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/resources" element={<ResourceManagement />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/disasters" element={<DisasterManagement />} />
            <Route path="/admin/requests" element={<RequestManagement />} />
          </Route>
          {/* Municipality Routes */}
          <Route element={<PrivateRoute allowedRoles={["municipality"]} />}>
            <Route
              path="/municipality/dashboard"
              element={<MunicipalityDashboard />}
            />
            <Route
              path="/municipality/profile"
              element={<MunicipalityProfile />}
            />
            <Route
              path="/municipality/settings"
              element={<MunicipalitySettings />}
            />
            <Route
              path="/municipality/analytics"
              element={<MunicipalityAnalytics />}
            />
            <Route
              path="/municipality/reports"
              element={<MunicipalityReports />}
            />
            <Route
              path="/municipality/resources"
              element={<MunicipalityResourceManagement />}
            />
          </Route>
        </Route>
      </Routes>
    </>
  );
};

const AppWrapper = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppWrapper;
