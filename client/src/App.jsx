import React, { useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LanguageProvider from "./contexts/LanguageContext";
import { ThemeProvider as CustomThemeProvider } from "./contexts/ThemeContext";
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
import EmergencyServicesPage from "./pages/Emergency/EmergencyServicesPage";
import NotificationCenter from "./pages/Notifications/NotificationCenter";
import AlertsPage from "./pages/Alerts/AlertsPage.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import WaterIssuesList from "./pages/WaterIssues/WaterIssuesList";
import WaterIssueReport from "./pages/WaterIssues/WaterIssueReport";
import WaterIssueDetail from "./pages/WaterIssues/WaterIssueDetail";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard.jsx";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminSettings from "./pages/admin/AdminSettings";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageMunicipalities from "./pages/admin/ManageMunicipalities";
import ManageRescuers from "./pages/admin/ManageRescuers";
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
import adminRoutes from "./routes/adminRoutes";
import SmartDashboardRouter from "./components/Auth/SmartDashboardRouter.jsx";
import PortalRoutes from "./routes/portalRoutes";
import UserReportDetail from "./pages/UserPortal/UserReportDetail.jsx";

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

// Create a separate component for authentication-dependent logic
const AuthenticatedApp = () => {
  const { authInitialized, loading, error } = useAuth();

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

  return <AppRoutes />;
};

const AppRoutes = () => {
  return (
    <>
      <OfflineStatus />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/emergency" element={<QuickActions />} />
        <Route path="/emergency-services" element={<EmergencyServicesPage />} />
        <Route path="/" element={<Home />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Admin Routes - Outside Layout to avoid citizen UI wrapping */}
        {adminRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element}>
            {route.children?.map((child, childIndex) => (
              <Route
                key={childIndex}
                path={child.path}
                element={child.element}
              />
            ))}
          </Route>
        ))}

        {/* Routes using the Layout component */}
        <Route element={<Layout />}>
          {/* Protected Routes */}
          {/* Smart Dashboard Router - redirects based on user role */}
          <Route path="/dashboard" element={<SmartDashboardRouter />} />

          {/* Citizen Routes */}
          <Route element={<PrivateRoute allowedRoles={["user", "citizen"]} />}>
            <Route path="/citizen-dashboard" element={<Dashboard />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/report-flood" element={<ReportFlood />} />
            <Route path="/reports" element={<ViewReports />} />
            <Route path="/notifications" element={<NotificationCenter />} />
            <Route path="/water-issues" element={<WaterIssuesList />} />
            <Route path="/report-water-issue" element={<WaterIssueReport />} />
            <Route path="/water-issues/:id" element={<WaterIssueDetail />} />
            <Route path="/reports/:reportId" element={<UserReportDetail />} />
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
              path="/municipality/water-issues"
              element={<WaterIssuesList />}
            />
            <Route
              path="/municipality/water-issues/:id"
              element={<WaterIssueDetail />}
            />
            <Route
              path="/municipality/resources"
              element={<MunicipalityResourceManagement />}
            />
          </Route>

          {/* Portal Routes */}
          <Route path="/portal/*" element={<PortalRoutes />} />
        </Route>
      </Routes>
    </>
  );
};

const App = () => {
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

  return <AuthenticatedApp />;
};

const AppWrapper = () => (
  <CustomThemeProvider>
    <AuthProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </AuthProvider>
  </CustomThemeProvider>
);

export default AppWrapper;
