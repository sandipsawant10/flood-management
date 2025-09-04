import React, { useState, useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  LayerGroup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useQuery } from "react-query";
import {
  MapPin,
  Droplets,
  AlertTriangle,
  Users,
  Calendar,
  Eye,
  Layers,
  Navigation,
  RefreshCw,
  Filter,
  Info,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import L from "leaflet";
import toast from "react-hot-toast";

const { BaseLayer, Overlay } = LayersControl;

// Fix default icon for leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Custom markers for different severities
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
      width: 20px;
      height: 20px;
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
  const [center, setCenter] = useState([20.5937, 78.9629]); // India center
  const [zoom, setZoom] = useState(5);
  const [selectedSeverity, setSelectedSeverity] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [showUserLocation, setShowUserLocation] = useState(true);

  // Fetch flood reports with filters
  const {
    data: reportsData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ["flood-reports-map", selectedSeverity, selectedTimeRange],
    async () => {
      const params = new URLSearchParams();
      if (selectedSeverity) params.append("severity", selectedSeverity);
      params.append("timeRange", selectedTimeRange);
      params.append("hasCoordinates", "true");

      const response = await fetch(`/api/flood-reports?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to load flood reports");
      return response.json();
    },
    {
      refetchInterval: 120000, // Refresh every 2 minutes
      refetchIntervalInBackground: true,
    }
  );

  const reports = reportsData?.data || [];

  // Center map on user location
  useEffect(() => {
    if (user?.location?.coordinates && showUserLocation) {
      setCenter([user.location.coordinates[1], user.location.coordinates[0]]);
      setZoom(10);
    }
  }, [user, showUserLocation]);

  // User location component
  const UserLocationMarker = () => {
    if (!user?.location?.coordinates) return null;

    const userIcon = L.divIcon({
      html: `<div style="
        background-color: #3B82F6;
        width: 16px;
        height: 16px;
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
      recent: reports.filter((r) => {
        const reportDate = new Date(r.createdAt);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return reportDate > oneDayAgo;
      }).length,
    };
  }, [reports]);

  if (error) {
    toast.error(error.message);
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Map Controls Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Flood Risk Map
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
            {/* Filters */}
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
              />
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
              <Navigation className="w-3 h-3 mr-1" />
              My Location
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
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
          scrollWheelZoom={true}
        >
          <LayersControl position="topright">
            {/* Base Layers */}
            <BaseLayer checked name="Street Map">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            </BaseLayer>

            <BaseLayer name="Satellite">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              />
            </BaseLayer>

            <BaseLayer name="Terrain">
              <TileLayer
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
              />
            </BaseLayer>

            {/* Overlay Layers */}
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
                    <Popup maxWidth={300} className="custom-popup">
                      <div className="p-2">
                        <div className="flex items-center mb-3">
                          <Droplets className="w-5 h-5 text-blue-600 mr-2" />
                          <h3 className="font-bold text-lg">
                            {report.location.district}, {report.location.state}
                          </h3>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Severity:
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                {
                                  low: "bg-green-100 text-green-800",
                                  medium: "bg-yellow-100 text-yellow-800",
                                  high: "bg-orange-100 text-orange-800",
                                  critical: "bg-red-100 text-red-800",
                                }[report.severity]
                              }`}
                            >
                              {report.severity?.toUpperCase()}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Water Level:
                            </span>
                            <span className="text-sm font-medium">
                              {report.waterLevel?.replace("-", " ") ||
                                "Not specified"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Urgency:
                            </span>
                            <span className="text-sm font-medium">
                              {report.urgencyLevel || 0}/10
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                          {report.description}
                        </p>

                        {report.mediaFiles && report.mediaFiles.length > 0 && (
                          <div className="mb-3">
                            <img
                              src={report.mediaFiles[0]}
                              alt="Flood condition"
                              className="w-full h-32 object-cover rounded"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                            {report.mediaFiles.length > 1 && (
                              <p className="text-xs text-gray-500 mt-1">
                                +{report.mediaFiles.length - 1} more photos
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>
                              {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            <span>
                              {report.impact?.affectedPeople || 0} affected
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          <div className="text-xs text-gray-500">
                            By: {report.reportedBy?.name || "Anonymous"}
                          </div>
                          <button
                            onClick={() =>
                              window.open(`/reports/${report._id}`, "_blank")
                            }
                            className="flex items-center text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View Details
                          </button>
                        </div>
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

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-50 max-w-xs">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <Info className="w-4 h-4 mr-2" />
          Legend
        </h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-600 rounded-full mr-2"></div>
            <span className="text-sm">Low Severity</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-600 rounded-full mr-2"></div>
            <span className="text-sm">Medium Severity</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-600 rounded-full mr-2"></div>
            <span className="text-sm">High Severity</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-600 rounded-full mr-2"></div>
            <span className="text-sm">Critical Severity</span>
          </div>
          {showUserLocation && (
            <div className="flex items-center pt-2 border-t border-gray-200">
              <div className="w-4 h-4 bg-blue-600 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm">Your Location</span>
            </div>
          )}
        </div>
      </div>

      {/* Map Stats */}
      {mapStats && (
        <div className="absolute top-20 right-4 bg-white rounded-lg shadow-lg p-4 z-50">
          <h4 className="font-medium text-gray-900 mb-2">Map Statistics</h4>
          <div className="text-sm space-y-1">
            <div>
              Total Reports:{" "}
              <span className="font-medium">{mapStats.total}</span>
            </div>
            <div>
              Critical:{" "}
              <span className="font-medium text-red-600">
                {mapStats.critical}
              </span>
            </div>
            <div>
              High Risk:{" "}
              <span className="font-medium text-orange-600">
                {mapStats.high}
              </span>
            </div>
            <div>
              Recent (24h):{" "}
              <span className="font-medium text-blue-600">
                {mapStats.recent}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Add custom CSS for animations */}
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

        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }

        .leaflet-popup-tip {
          background: white;
        }
      `}</style>
    </div>
  );
};

export default FloodMap;
