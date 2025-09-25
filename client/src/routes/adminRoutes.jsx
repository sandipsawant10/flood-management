import { lazy } from "react";
import AdminRoute from "../components/Auth/AdminRoute";

const AdminPortal = lazy(() => import("../pages/admin/AdminPortal"));
const MunicipalityDashboard = lazy(() =>
  import("../pages/admin/MunicipalityDashboard")
);
const RescuerDashboard = lazy(() =>
  import("../pages/AdminDashboard/RescuerDashboard")
);
const FinancialAidRequests = lazy(() =>
  import("../pages/admin/FinancialAidRequests")
);
const AdvancedAnalyticsDashboard = lazy(() =>
  import("../pages/AdminDashboard/AdvancedAnalyticsDashboard")
);
const UserManagement = lazy(() =>
  import("../pages/AdminDashboard/UserManagement")
);
const ResourceTracking = lazy(() =>
  import("../pages/AdminDashboard/ResourceTracking")
);
const AIVerificationDashboard = lazy(() =>
  import("../pages/admin/AIVerificationDashboard")
);

const adminRoutes = [
  {
    path: "/admin",
    element: (
      <AdminRoute requiredRoles={["admin", "municipality", "rescuer"]}>
        <AdminPortal />
      </AdminRoute>
    ),
    children: [
      { path: "municipality", element: <MunicipalityDashboard /> },
      { path: "rescuer", element: <RescuerDashboard /> },
      {
        path: "financial-aid",
        element: (
          <AdminRoute requiredRoles={["admin", "municipality"]}>
            <FinancialAidRequests />
          </AdminRoute>
        ),
      },
      {
        path: "analytics",
        element: (
          <AdminRoute requiredRoles={["admin"]}>
            <AdvancedAnalyticsDashboard />
          </AdminRoute>
        ),
      },
      {
        path: "users",
        element: (
          <AdminRoute requiredRoles={["admin"]}>
            <UserManagement />
          </AdminRoute>
        ),
      },
      {
        path: "resources",
        element: (
          <AdminRoute requiredRoles={["admin", "municipality"]}>
            <ResourceTracking />
          </AdminRoute>
        ),
      },
      {
        path: "verification",
        element: (
          <AdminRoute requiredRoles={["admin", "municipality"]}>
            <AIVerificationDashboard />
          </AdminRoute>
        ),
      },
    ],
  },
];

export default adminRoutes;
