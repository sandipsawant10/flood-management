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
import "leaflet.heat";
import {
  AlertTriangle,
  Droplets,
  Clock,
  MapPin,
  Eye,
  Users,
  CheckCircle,
  XCircle,
  CloudRain,
  Sun,
  Wind,
} from "lucide-react"; // Added CloudRain, Sun, Wind
import { format, parseISO } from "date-fns"; // Added parseISO
import { Legend } from "leaflet";

import { floodReportService } from "../../services/floodReportService";

const HeatmapLayer = ({ points, longitudeExtractor, latitudeExtractor, intensityExtractor, ...options }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const heat = L.heatLayer(points.map(p => [
      latitudeExtractor(p),
      longitudeExtractor(p),
      intensityExtractor(p)
    ]), options).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points, longitudeExtractor, latitudeExtractor, intensityExtractor, options]);

  return null;
};
import { alertService } from "../../services/alertService";
import { useAuthStore } from "../../store/authStore";

const MapLegend = ({ depthToColor }) => {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
      const div = L.DomUtil.create("div", "info legend");
      const depths = [0, 0.5, 1, 2, 5]; // Example depth levels in meters
      const labels = [];

      div.innerHTML += "<h4>Water Depth (m)</h4>";

      for (let i = 0; i < depths.length; i++) {
        labels.push(
          '<i style="background:' +
            depthToColor(depths[i] + 0.1) +
            '"></i> ' +
            depths[i] +
            (depths[i + 1] ? "&ndash;" + depths[i + 1] + " m" : "+ m")
        );
      }
      div.innerHTML += labels.join("<br>");
      return div;
    };

    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map, depthToColor]);

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
  const [minDepth, setMinDepth] = useState(''); // New state for min depth filter
  const [maxDepth, setMaxDepth] = useState(''); // New state for max depth filter

  // Fetch flood reports
  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ["flood-reports-map", filters, minDepth, maxDepth],
    queryFn: () =>
      floodReportService.getReports({
        "location.coordinates": filters.coordinates,
        "location.radius": filters.radius,
        minDepth: minDepth || undefined, // Add minDepth to filters
        maxDepth: maxDepth || undefined, // Add maxDepth to filters
      }),
    enabled: !!(filters.coordinates && filters.radius),
  });

  // Fetch alerts
  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ["alerts-map", filters],
    queryFn: () =>
      alertService.getAlerts({ 
        "location.coordinates": filters.coordinates,
        "location.radius": filters.radius,
      }),
    enabled: !!(filters.coordinates && filters.radius),
  });

  const floodReports = reportsData?.data || [];
  const floodAlerts = alertsData?.data || [];

  // Prepare data for heatmap
  const heatmapData = floodReports.map(report => [
    report.location.coordinates[1],
    report.location.coordinates[0],
    report.depth || 0.1 // Default to 0.1 if depth is not available for heatmap intensity
  ]).filter(dataPoint => dataPoint[2] > 0);

  useEffect(() => {
    if (center) {
      setMapCenter(center);
      setMapZoom(zoom);
    }
  }, [center, zoom]);

  useEffect(() => {
    if (user?.location?.coordinates) {
      setMapCenter([user.location.coordinates[1], user.location.coordinates[0]]);
    }
  }, [user]);

  const handleMarkerClick = (report) => {
    setSelectedReport(report);
    if (onMarkerClick) {
      onMarkerClick(report);
    }
  };

  return (
    <div className="relative h-full w-full">
      <style>
        {`
          .info.legend {
            background: white;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
            line-height: 18px;
            color: #555;
          }
          .info.legend h4 {
            margin: 0 0 5px;
            color: #333;
          }
          .info.legend i {
            width: 18px;
            height: 18px;
            float: left;
            margin-right: 8px;
            opacity: 0.7;
          }
        `}
      </style>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        style={{ height: height, width: "100%", borderRadius: "8px" }}
        whenCreated={(map) => {
          // Store the map instance if needed for external manipulation
          // For now, use useMap hook for internal component access
        }}
      >
        <MapController center={mapCenter} zoom={mapZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Map Legend */}
        <MapLegend depthToColor={depthToColor} />

        {/* Heatmap Layer */}
        {heatmapData.length > 0 && (
          <HeatmapLayer
            points={heatmapData}
            longitudeExtractor={m => m[1]}
            latitudeExtractor={m => m[0]}
            intensityExtractor={m => parseFloat(m[2])}
            radius={25}
            max={1.0}
            blur={15}
            gradient={{
              0.0: 'blue',
              0.5: 'lime',
              1.0: 'red'
            }}
          />
        )}

        <div className="absolute top-4 left-4 z-[1000] bg-white p-3 rounded-lg shadow-md flex space-x-2">
          <input
            type="number"
            placeholder="Min Depth (m)"
            value={minDepth}
            onChange={(e) => setMinDepth(e.target.value)}
            className="w-32 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Max Depth (m)"
            value={maxDepth}
            onChange={(e) => setMaxDepth(e.target.value)}
            className="w-32 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* User location */}
        {user?.location?.coordinates && (
          <Marker
            position={[
              user.location.coordinates[1],
              user.location.coordinates[0],
            ]}
            icon={L.icon({
              iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
            })}
          >
            <Popup>Your current location</Popup>
          </Marker>
        )}

        {/* Flood Reports */}
        {showReports &&
          floodReports.map((report) => (
            <CircleMarker
              key={report._id}
              center={[
                report.location.coordinates[1],
                report.location.coordinates[0],
              ]}
              radius={5 + Math.min(report.depth || 0, 10)} // Scale radius by depth
              pathOptions={{
                color: depthToColor(report.depth),
                fillOpacity: 0.7,
              }}
              eventHandlers={{
                click: () => handleMarkerClick(report),
              }}
            >
              <Popup>
                <div className="font-bold">Flood Report Details</div>
                <div>
                  <MapPin size={16} className="inline-block mr-1 text-blue-500" />
                  Location: {report.location.address || "N/A"}
                </div>
                {report.depth !== undefined && report.depth !== null && (
                  <div>
                    <Droplets size={16} className="inline-block mr-1 text-blue-500" />
                    Depth: {report.depth} meters
                  </div>
                )}
                <div>
                  <CloudRain size={16} className="inline-block mr-1 text-blue-500" />
                  Water Level: {report.waterLevel}
                </div>
                <div>
                  <Clock size={16} className="inline-block mr-1 text-gray-500" />
                  Reported: {" "}
                  {format(parseISO(report.date), "MMM dd, yyyy HH:mm")}
                </div>
                <div>
                  <Eye size={16} className="inline-block mr-1 text-gray-500" />
                  Severity: {report.severity}
                </div>
                {report.description && (
                  <div>
                    Description: {report.description}
                  </div>
                )}
                {report.weatherInfo && (
                  <div>
                    Weather: {report.weatherInfo.temperature}°C, {report.weatherInfo.condition}, Wind: {report.weatherInfo.windSpeed} km/h
                  </div>
                )}
                {report.impact && (
                  <div>
                    Impact: {report.impact}
                  </div>
                )}
                {report.verifiedBy && (
                  <div className="flex items-center mt-2 text-green-600">
                    <CheckCircle size={16} className="inline-block mr-1" /> Verified by: {report.verifiedBy.username}
                  </div>
                )} 
                {report.isFake && (
                  <div className="flex items-center mt-2 text-red-600">
                    <XCircle size={16} className="inline-block mr-1" /> Marked as Fake
                  </div>
                )}
                {report.upvotes !== undefined && report.downvotes !== undefined && (
                  <div className="flex items-center mt-2">
                    <Users size={16} className="inline-block mr-1" /> {report.upvotes} Upvotes, {report.downvotes} Downvotes
                  </div>
                )}
              </Popup>
            </CircleMarker>
          ))}

        {/* Alerts */}
        {showAlerts &&
          <DepthLegend />
        }
          floodAlerts.map((alert) => (
            <React.Fragment key={alert._id}>
              <Circle
                center={[
                  alert.location.coordinates[1],
                  alert.location.coordinates[0],
                ]}
                radius={alert.radius * 1000} // Convert km to meters
                pathOptions={{ color: "red", fillOpacity: 0.1 }}
              />
              <Marker
                position={[
                  alert.location.coordinates[1],
                  alert.location.coordinates[0],
                ]}
                icon={alertIcon}
              >
                <Popup>
                  <div className="font-bold">Flood Alert!</div>
                  <div>Severity: {alert.severity}</div>
                  <div>Area: {alert.radius} km radius</div>
                  <div>
                    <Clock size={16} className="inline-block mr-1 text-gray-500" />
                    Issued: {" "}
                    {format(parseISO(alert.date), "MMM dd, yyyy HH:mm")}
                  </div>
                  <div>Threshold: {alert.threshold}</div>
                  {alert.description && (
                    <div>Description: {alert.description}</div>
                  )}
                </Popup>
              </Marker>
            </React.Fragment>
          ))}
      </MapContainer>
    </div>
  );
};

// Helper function for color interpolation based on depth
const depthToColor = (depth) => {
  if (depth === undefined || depth === null) return "#A0A0A0"; // Default color for unknown depth
  if (depth <= 0.05) return "#E0F7FA"; // Very Light Cyan
  if (depth <= 0.1) return "#B2EBF2"; // Light Cyan
  if (depth <= 0.25) return "#80DEEA"; // Cyan
  if (depth <= 0.5) return "#4DD0E1"; // Medium Cyan
  if (depth <= 0.75) return "#26C6DA"; // Strong Cyan
  if (depth <= 1.0) return "#00BCD4"; // Dark Cyan
  if (depth <= 1.5) return "#00ACC1"; // Very Dark Cyan
  if (depth <= 2.0) return "#0097A7"; // Even Darker Cyan
  if (depth <= 3.0) return "#00838F"; // Blue-Green
  if (depth <= 4.0) return "#006064"; // Dark Blue-Green
  if (depth <= 5.0) return "#FFC107"; // Amber for caution
  if (depth <= 7.5) return "#FF9800"; // Orange for warning
  if (depth <= 10.0) return "#FF5722"; // Deep Orange for high warning
  return "#D32F2F"; // Red for critical depth
};

// Depth Legend Component
const DepthLegend = () => {
  const legendItems = [
    { label: "< 0.05 m", color: "#E0F7FA" },
    { label: "0.05 - 0.1 m", color: "#B2EBF2" },
    { label: "0.1 - 0.25 m", color: "#80DEEA" },
    { label: "0.25 - 0.5 m", color: "#4DD0E1" },
    { label: "0.5 - 0.75 m", color: "#26C6DA" },
    { label: "0.75 - 1.0 m", color: "#00BCD4" },
    { label: "1.0 - 1.5 m", color: "#00ACC1" },
    { label: "1.5 - 2.0 m", color: "#0097A7" },
    { label: "2.0 - 3.0 m", color: "#00838F" },
    { label: "3.0 - 4.0 m", color: "#006064" },
    { label: "4.0 - 5.0 m", color: "#FFC107" },
    { label: "5.0 - 7.5 m", color: "#FF9800" },
    { label: "7.5 - 10.0 m", color: "#FF5722" },
    { label: "> 10.0 m", color: "#D32F2F" },
    { label: "Unknown", color: "#A0A0A0" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: 20,
        backgroundColor: "white",
        padding: "10px",
        borderRadius: "5px",
        boxShadow: "0 0 10px rgba(0,0,0,0.6)",
        zIndex: 1000,
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "5px" }}>Depth (m)</div>
      {legendItems.map((item, index) => (
        <div key={index} style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: item.color,
              marginRight: "5px",
              border: "1px solid #ccc",
            }}
          ></div>
          <div>{item.label}</div>
        </div>
      ))}
    </div>
  );
};

// Custom icons for different severity levels
  const createCustomIcon = (severity, verified = false, depth = null) => {
    const colors = {
      low: "#10B981",
      medium: "#F59E0B",
      high: "#EF4444",
      critical: "#7C2D12",
    };

    const baseColor = depth !== null ? depthToColor(depth) : (colors[severity] || colors.medium);

    const iconHtml = `
    <div style="
      background-color: ${baseColor};
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

const MapLegend = ({ depthToColor }) => {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend");
      const depths = [0, 0.1, 0.5, 1.0, 2.0, 3.0, 5.0];
      const labels = [];

      div.innerHTML = '<h4>Water Depth (m)</h4>';

      // Loop through our depth intervals and generate a label with a colored square for each interval
      for (let i = 0; i < depths.length; i++) {
        const from = depths[i];
        const to = depths[i + 1];

        labels.push(
          '<i style="background:' +
            depthToColor(from + 0.01) +
            '"></i> ' +
            from +
            (to ? '&ndash;' + to : '+')
        );
      }

      div.innerHTML += labels.join('<br>');

      // Add size legend
      div.innerHTML += '<h4>Size Scale</h4>';
      div.innerHTML += `
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background: #4682B4;"></div>
          <span style="margin-left: 5px; font-size: 12px;">Small (e.g., 0.5m)</span>
        </div>
        <div style="display: flex; align-items: center;">
          <div style="width: 20px; height: 20px; border-radius: 50%; background: #8B0000;"></div>
          <span style="margin-left: 5px; font-size: 12px;">Large (e.g., 5m+)</span>
        </div>
      `;

      return div;
    };

    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map, depthToColor]);

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

        {/* Map Legend */}
        <MapLegend depthToColor={depthToColor} />

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
            <CircleMarker
              key={report._id}
              center={[
                report.location.coordinates[1],
                report.location.coordinates[0],
              ]}
              radius={5 + Math.min(report.depth || 0, 15)} // Scale radius based on depth, max radius 20
              pathOptions={{
                color: depthToColor(report.depth),
                fillColor: depthToColor(report.depth),
                fillOpacity: 0.6,
                weight: 2,
              }}
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
                    {report.location.address ||
                      `${report.location.district}, ${report.location.state}`}
                  </div>
                  {report.depth !== undefined && report.depth !== null && (
                    <div className="mb-3 text-sm text-gray-700 flex items-center">
                      <Droplets className="w-4 h-4 mr-1 inline text-blue-600" />
                      <strong>Depth:</strong> {report.depth.toFixed(2)} meters
                    </div>
                  )}
                  <p className="text-sm mb-3 line-clamp-2">
                    {report.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-3">
                    <div className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {format(parseISO(report.createdAt), 'MMM dd, yyyy HH:mm')}</div>
                    <div className="flex items-center"><Eye className="w-3 h-3 mr-1" /> {report.communityVotes.upvotes + report.communityVotes.downvotes} votes</div>
                    {report.weatherConditions && (
                      <div className="flex items-center">
                        {report.weatherConditions.rainfall !== undefined && (
                          <span className="flex items-center mr-2">
                            <CloudRain className="w-3 h-3 mr-1" />{report.weatherConditions.rainfall}mm
                          </span>
                        )}
                        {report.weatherConditions.temperature !== undefined && (
                          <span className="flex items-center mr-2">
                            <Sun className="w-3 h-3 mr-1" />{report.weatherConditions.temperature}°C
                          </span>
                        )}
                        {report.weatherConditions.windSpeed !== undefined && (
                          <span className="flex items-center">
                            <Wind className="w-3 h-3 mr-1" />{report.weatherConditions.windSpeed}km/h
                          </span>
                        )}
                      </div>
                    )}
                    {report.impact?.affectedPeople > 0 && (
                      <div className="flex items-center"><Users className="w-3 h-3 mr-1" /> {report.impact.affectedPeople} affected</div>
                    )}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
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
