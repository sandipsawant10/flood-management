import React, { useState, useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  LayerGroup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Droplets,
  AlertTriangle,
  Users,
  Calendar,
  Navigation,
  RefreshCw,
  Eye,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
// import L from "leaflet";
import toast from "react-hot-toast";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const { BaseLayer, Overlay } = LayersControl;

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom marker for severity
const createCustomIcon = (severity) => {
  const colors = {
    low: "#10B981",
    medium: "#F59E0B",
    high: "#F97316",
    critical: "#DC2626",
  };
  return L.divIcon({
    html: `<div style="
      background-color: ${colors[severity] || colors.medium};
      width: 20px; height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    className: "custom-marker",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const FloodMap = () => {
  const { user } = useAuthStore();
  const [center, setCenter] = useState([20.5937, 78.9629]);
  const [zoom, setZoom] = useState(5);
  const [selectedSeverity, setSelectedSeverity] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [showUserLocation, setShowUserLocation] = useState(true);

  // Fetch flood reports using React Query v5
  const {
    data: reportsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["flood-reports-map", selectedSeverity, selectedTimeRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedSeverity) params.append("severity", selectedSeverity);
      params.append("timeRange", selectedTimeRange);
      params.append("hasCoordinates", "true");

      const response = await fetch(`/api/flood-reports?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Failed to load flood reports");
      return response.json();
    },
    refetchInterval: 120000,
    refetchIntervalInBackground: true,
  });

  const reports = reportsData?.data || [];

  // Center map on user
  useEffect(() => {
    if (user?.location?.coordinates && showUserLocation) {
      setCenter([user.location.coordinates[1], user.location.coordinates[0]]);
      setZoom(10);
    }
  }, [user, showUserLocation]);

  // User location marker
  const UserLocationMarker = () => {
    if (!user?.location?.coordinates) return null;
    const userIcon = L.divIcon({
      html: `<div style="
        background-color: #3B82F6;
        width: 16px; height: 16px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        animation: pulse 2s infinite;
      "></div>`,
      className: "user-location-marker",
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    return (
      <Marker
        position={[user.location.coordinates[1], user.location.coordinates[0]]}
        icon={userIcon}
      >
        <Popup>
          <div className="text-center">
            <div className="w-4 h-4 bg-blue-600 rounded-full mx-auto mb-2"></div>
            <p className="font-medium">Your Location</p>
            <p className="text-sm text-gray-600">
              {user.location.district}, {user.location.state}
            </p>
          </div>
        </Popup>
      </Marker>
    );
  };

  // Map statistics
  const mapStats = useMemo(() => {
    if (!reports.length) return null;
    return {
      total: reports.length,
      critical: reports.filter((r) => r.severity === "critical").length,
      high: reports.filter((r) => r.severity === "high").length,
      recent: reports.filter(
        (r) =>
          new Date(r.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length,
    };
  }, [reports]);

  if (error) toast.error(error.message);

  return (
    <div className="h-screen flex flex-col">
      {/* Header / Controls */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 z-50 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" /> Flood Risk Map
          </h1>
          {mapStats && (
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-1"></div>
                <span>{mapStats.total} Total</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-600 rounded-full mr-1"></div>
                <span>{mapStats.critical} Critical</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-600 rounded-full mr-1"></div>
                <span>{mapStats.high} High</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                <span>{mapStats.recent} Recent (24h)</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All time</option>
          </select>

          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3 h-3 mr-1 ${isLoading ? "animate-spin" : ""}`}
            />{" "}
            Refresh
          </button>

          <button
            onClick={() => setShowUserLocation(!showUserLocation)}
            className={`flex items-center px-3 py-1 rounded text-sm ${
              showUserLocation
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <Navigation className="w-3 h-3 mr-1" /> My Location
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute top-4 left-4 z-50 bg-white rounded-lg shadow-lg p-3 flex items-center">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm">Loading reports...</span>
          </div>
        )}

        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
        >
          <LayersControl position="topright">
            {/* Base Layers */}
            <BaseLayer checked name="Street Map">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
              />
            </BaseLayer>
            <BaseLayer name="Satellite">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="&copy; Esri"
              />
            </BaseLayer>
            <BaseLayer name="Terrain">
              <TileLayer
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenTopoMap"
              />
            </BaseLayer>

            {/* Flood Reports */}
            <Overlay checked name="Flood Reports">
              <LayerGroup>
                {reports.map((report) => (
                  <Marker
                    key={report._id}
                    position={[
                      report.location.coordinates[1],
                      report.location.coordinates[0],
                    ]}
                    icon={createCustomIcon(report.severity)}
                  >
                    <Popup maxWidth={300}>
                      {/* Custom report popup content here */}
                      <div>
                        {report.location.district}, {report.location.state}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </LayerGroup>
            </Overlay>

            {/* User Location */}
            {showUserLocation && (
              <Overlay checked name="Your Location">
                <LayerGroup>
                  <UserLocationMarker />
                </LayerGroup>
              </Overlay>
            )}
          </LayersControl>
        </MapContainer>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

export default FloodMap;
