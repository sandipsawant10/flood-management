import React from "react";
import { Routes, Route } from "react-router-dom";
import UserPortalLayout from "../pages/UserPortal/UserPortalLayout";
import UserDashboard from "../pages/UserPortal/UserDashboard";
import UserReportForm from "../pages/UserPortal/UserReportForm";
import UserReportsHistory from "../pages/UserPortal/UserReportsHistory";
import UserReportDetail from "../pages/UserPortal/UserReportDetail";
import UserMapView from "../pages/UserPortal/UserMapView";
import UserEmergencyResources from "../pages/UserPortal/UserEmergencyResources";
import UserProfile from "../pages/UserPortal/UserProfile";

const PortalRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<UserPortalLayout />}>
        <Route index element={<UserDashboard />} />
        <Route path="reports" element={<UserReportsHistory />} />
        <Route path="reports/:reportId" element={<UserReportDetail />} />
        <Route path="report" element={<UserReportForm />} />
        <Route path="map" element={<UserMapView />} />
        <Route path="emergency" element={<UserEmergencyResources />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>
    </Routes>
  );
};

export default PortalRoutes;
