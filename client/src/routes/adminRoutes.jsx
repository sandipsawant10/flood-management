import { lazy } from 'react';
import AdminRoute from '../components/Auth/AdminRoute';

const AdminPortal = lazy(() => import('../pages/admin/AdminPortal'));
const MunicipalityDashboard = lazy(() => import('../pages/admin/MunicipalityDashboard'));
const RescuerDashboard = lazy(() => import('../pages/AdminDashboard/RescuerDashboard'));

const adminRoutes = [
  {
    path: '/admin',
    element: (
      <AdminRoute requiredRoles={['admin', 'municipality', 'rescuer']}>
        <AdminPortal />
      </AdminRoute>
    ),
    children: [
      { path: 'municipality', element: <MunicipalityDashboard /> },
      { path: 'rescuer', element: <RescuerDashboard /> },
    ],
  },
];

export default adminRoutes;