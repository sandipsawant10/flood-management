import AdminRoute from "../components/Auth/AdminRoute";
import AdminPortal from "../pages/admin/AdminPortal";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";
import SimpleAdminDashboard from "../components/Test/SimpleAdminDashboard";
import MunicipalityDashboard from "../components/Admin/MunicipalityDashboard";
import RescuerDashboard from "../pages/AdminDashboard/RescuerDashboard";
import FinancialAidRequests from "../pages/admin/FinancialAidRequests";
import AdvancedAnalyticsDashboard from "../pages/Analytics/AdvancedAnalyticsDashboard";
import UserManagement from "../pages/AdminDashboard/UserManagement";
import ResourceTracking from "../pages/AdminDashboard/ResourceTracking";
import AIVerificationDashboard from "../pages/admin/AIVerificationDashboard";

const adminRoutes = [
  {
    path: "/admin",
    element: (
      <AdminRoute requiredRoles={["admin", "municipality", "rescuer"]}>
        <AdminPortal />
      </AdminRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      { path: "municipality", element: <MunicipalityDashboard /> },
      { path: "rescuer", element: <RescuerDashboard /> },
      {
        path: "financial-aid",
        element: <FinancialAidRequests />,
      },
      {
        path: "analytics",
        element: <AdvancedAnalyticsDashboard />,
      },
      {
        path: "users",
        element: <UserManagement />,
      },
      {
        path: "resources",
        element: <ResourceTracking />,
      },
      {
        path: "verification",
        element: <AIVerificationDashboard />,
      },
    ],
  },
];

export default adminRoutes;
