import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import { useQuery } from "@tanstack/react-query";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  AlertTriangle,
  Droplets,
  Clock,
  MapPin,
  Eye,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

import { floodReportService } from "../../services/floodReportService";
import { alertService } from "../../services/alertService";
import { useAuthStore } from "../../store/authStore";

// Custom icons for different severity levels
const createCustomIcon = (severity, verified = false) => {
  const colors = {
    low: "#10B981",
    medium: "#F59E0B",
    high: "#EF4444",
    critical: "#7C2D12",
  };

  const iconHtml = `
    <div style="
      background-color: ${colors[severity] || colors.medium};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    ">
      <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      ${
        verified
          ? '<div style="position: absolute; top: -2px; right: -2px; background: #10B981; border-radius: 50%; width: 8px; height: 8px; border: 1px solid white;"></div>'
          : ""
      }
    </div>
  `;

  return new L.DivIcon({
    html: iconHtml,
    className: "custom-flood-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const alertIcon = new L.DivIcon({
  html: `
    <div style="
      background-color: #DC2626;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s infinite;
    ">
      <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
      </svg>
    </div>
  `,
  className: "custom-alert-marker",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

// Component to update map center when location changes
const MapController = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
};

const FloodMap = ({
  height = "500px",
  center = [20.5937, 78.9629],
  zoom = 5,
  showReports = true,
  showAlerts = true,
  filters = {},
  onMarkerClick = null,
}) => {
  const { user } = useAuthStore();
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);
  const [selectedReport, setSelectedReport] = useState(null);

  // Fetch flood reports
  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ["flood-reports-map", filters],
    queryFn: () =>
      floodReportService.getReports({
        ...filters,
        lat: user?.location?.coordinates?.[1],
        lng: user?.location?.coordinates?.[0],
        radius: 50,
        limit: 100,
      }),
    enabled: showReports,
    refetchInterval: 60000,
  });

  // Fetch active alerts
  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ["active-alerts-map"],
    queryFn: () => alertService.getActiveAlerts(),
    enabled: showAlerts,
    refetchInterval: 30000,
  });

  const reports = reportsData?.reports || [];
  const alerts = alertsData?.alerts || [];

  // Focus on user's location if available
  useEffect(() => {
    if (user?.location?.coordinates) {
      const [lng, lat] = user.location.coordinates;
      setMapCenter([lat, lng]);
      setMapZoom(12);
    }
  }, [user]);

  const handleMarkerClick = (report) => {
    setSelectedReport(report);
    if (onMarkerClick) onMarkerClick(report);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: "#10B981",
      medium: "#F59E0B",
      high: "#EF4444",
      critical: "#7C2D12",
    };
    return colors[severity] || colors.medium;
  };

  const getVerificationIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "disputed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="relative" style={{ height }}>
      {(reportsLoading || alertsLoading) && (
        <div className="absolute top-2 left-2 z-[1000] bg-white px-3 py-1 rounded-lg shadow-lg">
          <div className="flex items-center text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
            Loading map data...
          </div>
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg"
      >
        <MapController center={mapCenter} zoom={mapZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location */}
        {user?.location?.coordinates && (
          <Marker
            position={[
              user.location.coordinates[1],
              user.location.coordinates[0],
            ]}
            icon={
              new L.DivIcon({
                html: `<div style="background-color:#3B82F6;width:16px;height:16px;border-radius:50%;border:3px solid white;"></div>`,
                className: "user-location-marker",
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              })
            }
          >
            <Popup>
              <div className="p-2">
                <div className="flex items-center mb-2">
                  <MapPin className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="font-medium">Your Location</span>
                </div>
                <p className="text-sm text-gray-600">
                  {user.location.address || "Current position"}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Flood reports */}
        {showReports &&
          reports.map((report) => (
            <Marker
              key={report._id}
              position={[
                report.location.coordinates[1],
                report.location.coordinates[0],
              ]}
              icon={createCustomIcon(
                report.severity,
                report.verificationStatus === "verified"
              )}
              eventHandlers={{ click: () => handleMarkerClick(report) }}
            >
              <Popup maxWidth={320}>
                <div className="p-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Droplets
                        className={`w-5 h-5 mr-2`}
                        style={{ color: getSeverityColor(report.severity) }}
                      />
                      <span className="font-medium capitalize">
                        {report.severity} Severity
                      </span>
                    </div>
                    {getVerificationIcon(report.verificationStatus)}
                  </div>
                  <div className="mb-3 text-sm text-gray-600">
                    <MapPin className="w-3 h-3 mr-1 inline" />{" "}
                    {report.location.district}, {report.location.state}
                  </div>
                  <p className="text-sm mb-3 line-clamp-2">
                    {report.description}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Alerts */}
        {showAlerts &&
          alerts.map((alert) => {
            if (alert.targetArea.type === "Circle") {
              const center = alert.targetArea.coordinates;
              const radius = alert.targetArea.radius * 1000;
              return (
                <React.Fragment key={alert._id}>
                  <Circle
                    center={center}
                    radius={radius}
                    pathOptions={{
                      color: "#DC2626",
                      fillColor: "#FEE2E2",
                      fillOpacity: 0.3,
                      weight: 2,
                    }}
                  />
                  <Marker position={center} icon={alertIcon}>
                    <Popup maxWidth={300}>
                      <div className="p-2">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                          <span className="font-medium">
                            {alert.alertType.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="font-medium mb-2">{alert.title}</h4>
                        <p className="text-sm mb-3">{alert.message}</p>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            }
            return null;
          })}
      </MapContainer>
    </div>
  );
};

export default FloodMap;
