import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  CircleMarker,
  useMap,
  LayersControl,
  ZoomControl,
  FeatureGroup,
} from "react-leaflet";
import { useQuery } from "@tanstack/react-query";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { useNavigate } from "react-router-dom";
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
  ArrowRight,
  Filter,
  LifeBuoy,
  Home,
  Search,
  Layers,
  ThumbsUp,
  ThumbsDown,
  Info,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { floodReportService } from "../../services/floodReportService";
import { alertService } from "../../services/alertService";
import { fetchNearbyEmergencyResources } from "../../services/overpassService";
import { format, parseISO } from "date-fns";

const { BaseLayer, Overlay } = LayersControl;

// Heatmap component
const HeatmapLayer = ({
  points,
  longitudeExtractor,
  latitudeExtractor,
  intensityExtractor,
  ...options
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;

    const heat = L.heatLayer(
      points.map((p) => [
        latitudeExtractor(p),
        longitudeExtractor(p),
        intensityExtractor(p),
      ]),
      options
    ).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [
    map,
    points,
    longitudeExtractor,
    latitudeExtractor,
    intensityExtractor,
    options,
  ]);

  return null;
};

// Map Controller component to handle center and zoom changes
const MapController = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
};

// Depth Legend Component
const MapLegend = () => {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend");

      // Define our depth levels and colors
      const depths = [
        { level: "< 0.05 m", color: "#E0F7FA" },
        { level: "0.05 - 0.1 m", color: "#B2EBF2" },
        { level: "0.1 - 0.25 m", color: "#80DEEA" },
        { level: "0.25 - 0.5 m", color: "#4DD0E1" },
        { level: "0.5 - 0.75 m", color: "#26C6DA" },
        { level: "0.75 - 1.0 m", color: "#00BCD4" },
        { level: "1.0 - 1.5 m", color: "#00ACC1" },
        { level: "1.5 - 2.0 m", color: "#0097A7" },
        { level: "2.0 - 3.0 m", color: "#00838F" },
        { level: "3.0 - 4.0 m", color: "#006064" },
        { level: "4.0 - 5.0 m", color: "#FFC107" },
        { level: "5.0 - 7.5 m", color: "#FF9800" },
        { level: "7.5 - 10.0 m", color: "#FF5722" },
        { level: "> 10.0 m", color: "#D32F2F" },
      ];

      div.innerHTML = "<h4>Water Depth</h4>";

      // Create legend items
      depths.forEach((depth) => {
        div.innerHTML += `
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <div style="background: ${depth.color}; width: 15px; height: 15px; margin-right: 5px;"></div>
            <span style="font-size: 11px;">${depth.level}</span>
          </div>
        `;
      });

      return div;
    };

    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map]);

  return null;
};

// Emergency Resource Legend Component
const EmergencyResourceLegend = ({ amenityIconMapping }) => {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: "topright" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend emergency-legend");
      div.innerHTML = "<h4>Emergency Resources</h4>";

      // Get a subset of key emergency resources to avoid overcrowding
      const keyResources = [
        "hospital",
        "fire_station",
        "police",
        "shelter",
        "pharmacy",
        "fuel",
        "assembly_point",
      ];

      keyResources.forEach((amenity) => {
        if (amenityIconMapping[amenity]) {
          const iconUrl = amenityIconMapping[amenity].options.iconUrl;
          const color = amenityIconMapping[amenity].options.shadowColor;

          div.innerHTML += `
            <div style="display: flex; align-items: center; margin-bottom: 4px;">
              <div style="background: ${color}; width: 15px; height: 15px; margin-right: 5px; display: flex; align-items: center; justify-content: center;">
                <img src="${iconUrl}" style="width: 12px; height: 12px;" />
              </div>
              <span style="font-size: 11px;">${amenity
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}</span>
            </div>
          `;
        }
      });

      return div;
    };

    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map, amenityIconMapping]);

  return null;
};

// Our main component
const InteractiveFloodMap = ({
  height = "600px",
  center,
  zoom = 10,
  radius = 5,
  showControls = true,
  onMarkerClick = null,
  containerClassName = "",
}) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Default center to user's location or central India
  const [mapCenter, setMapCenter] = useState(
    center ||
      (user?.location?.coordinates
        ? [user.location.coordinates[1], user.location.coordinates[0]]
        : [20.5937, 78.9629])
  );

  const [mapZoom, setMapZoom] = useState(zoom);
  const [mapRadius, setMapRadius] = useState(radius); // km
  const [selectedReport, setSelectedReport] = useState(null);

  // Filters
  const [minDepth, setMinDepth] = useState("");
  const [maxDepth, setMaxDepth] = useState("");
  const [severity, setSeverity] = useState("");
  const [timeFrame, setTimeFrame] = useState("all");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // View options
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showEmergencyResources, setShowEmergencyResources] = useState(false);
  const [emergencyRadius, setEmergencyRadius] = useState(2); // 2 km for emergency resources

  // Fetch flood reports
  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: [
      "flood-reports-map",
      mapCenter,
      mapRadius,
      minDepth,
      maxDepth,
      severity,
      timeFrame,
      verificationStatus,
    ],
    queryFn: () => {
      const now = new Date();
      let startDate;

      if (timeFrame === "today") {
        startDate = new Date(now.setHours(0, 0, 0, 0));
      } else if (timeFrame === "week") {
        startDate = new Date(now.setDate(now.getDate() - 7));
      } else if (timeFrame === "month") {
        startDate = new Date(now.setMonth(now.getMonth() - 1));
      }

      return floodReportService.getReports({
        "location.coordinates": mapCenter,
        "location.radius": mapRadius,
        minDepth: minDepth || undefined,
        maxDepth: maxDepth || undefined,
        severity: severity || undefined,
        verificationStatus: verificationStatus || undefined,
        startDate: startDate?.toISOString() || undefined,
      });
    },
    enabled: !!(mapCenter[0] && mapCenter[1]),
  });

  // Fetch alerts
  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ["alerts-map", mapCenter, mapRadius],
    queryFn: () =>
      alertService.getAlerts({
        "location.coordinates": mapCenter,
        "location.radius": mapRadius,
      }),
    enabled: !!(mapCenter[0] && mapCenter[1]),
  });

  // Fetch emergency resources when enabled
  const { data: emergencyResourcesData, isLoading: emergencyResourcesLoading } =
    useQuery({
      queryKey: [
        "emergency-resources",
        mapCenter,
        emergencyRadius,
        showEmergencyResources,
      ],
      queryFn: () =>
        fetchNearbyEmergencyResources(
          mapCenter[0],
          mapCenter[1],
          emergencyRadius * 1000
        ),
      enabled: !!(mapCenter[0] && mapCenter[1] && showEmergencyResources),
    });

  const floodReports = reportsData?.reports || [];
  const alerts = alertsData?.alerts || [];
  const emergencyResources = emergencyResourcesData || [];

  // Prepare data for heatmap
  const heatmapData = showHeatmap
    ? floodReports.map((report) => {
        // Convert coordinates and depth to heatmap data points
        return [
          report.location.coordinates[1],
          report.location.coordinates[0],
          report.depth || 0.1, // Use depth as intensity, default to minimal if missing
        ];
      })
    : [];

  // Update map center when user location changes
  useEffect(() => {
    if (!center && user?.location?.coordinates) {
      setMapCenter([
        user.location.coordinates[1],
        user.location.coordinates[0],
      ]);
      setMapZoom(13);
    }
  }, [center, user]);

  // Function to convert depth to color
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

  // Function to get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "#DC2626";
      case "high":
        return "#F97316";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#0EA5E9";
      default:
        return "#A0A0A0";
    }
  };

  // Set up emergency resource icons
  const amenityIconMapping = {
    hospital: new L.Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      shadowSize: [41, 41],
      shadowColor: "#FF5733",
    }),
    fire_station: new L.Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      shadowSize: [41, 41],
      shadowColor: "#C70039",
    }),
    police: new L.Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      shadowSize: [41, 41],
      shadowColor: "#900C3F",
    }),
    shelter: new L.Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      shadowSize: [41, 41],
      shadowColor: "#DAF7A6",
    }),
    pharmacy: new L.Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      shadowSize: [41, 41],
      shadowColor: "#8A2BE2",
    }),
    fuel: new L.Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      shadowSize: [41, 41],
      shadowColor: "#FFC300",
    }),
    assembly_point: new L.Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      shadowSize: [41, 41],
      shadowColor: "#B8860B",
    }),
    // Default icon for other resources
    default: new L.Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      shadowSize: [41, 41],
      shadowColor: "#696969",
    }),
  };

  // Set up alert icon
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
    <style>
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.1);
          opacity: 0.8;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
    </style>
    `,
    className: "custom-alert-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });

  // Handle marker click
  const handleMarkerClick = (report) => {
    setSelectedReport(report);
    if (onMarkerClick) onMarkerClick(report);
  };

  // Handle report vote
  const handleVote = async (reportId, voteType) => {
    try {
      await floodReportService.voteOnReport(reportId, voteType);
      // Refetch reports to update the vote count
      reportsData.refetch();
    } catch (error) {
      console.error("Error voting on report:", error);
    }
  };

  // Handle search function
  const handleSearch = () => {
    // We'd implement a geocoding service here to convert address to coordinates
    // For now, let's just focus on the other filters
    console.log("Search functionality would use a geocoding service");
  };

  // Reset all filters
  const resetFilters = () => {
    setMinDepth("");
    setMaxDepth("");
    setSeverity("");
    setTimeFrame("all");
    setVerificationStatus("");
  };

  return (
    <div className={`relative ${containerClassName}`} style={{ height }}>
      {/* Loading indicator */}
      {(reportsLoading ||
        alertsLoading ||
        (showEmergencyResources && emergencyResourcesLoading)) && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
            Loading map data...
          </div>
        </div>
      )}

      {/* Map container */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg shadow-md"
        zoomControl={false}
      >
        <ZoomControl position="bottomleft" />
        <MapController center={mapCenter} zoom={mapZoom} />

        <LayersControl position="topright">
          <BaseLayer name="Street Map" checked>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>
          <BaseLayer name="Satellite">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </BaseLayer>
          <BaseLayer name="Terrain">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>

          <Overlay name="Heatmap" checked={showHeatmap}>
            {heatmapData.length > 0 && (
              <HeatmapLayer
                points={heatmapData}
                longitudeExtractor={(m) => m[1]}
                latitudeExtractor={(m) => m[0]}
                intensityExtractor={(m) => parseFloat(m[2])}
                radius={25}
                max={1.0}
                blur={15}
                gradient={{
                  0.0: "blue",
                  0.5: "lime",
                  1.0: "red",
                }}
              />
            )}
          </Overlay>

          <Overlay name="Emergency Resources" checked={showEmergencyResources}>
            <FeatureGroup>
              {emergencyResources.map((resource, index) => (
                <Marker
                  key={`resource-${index}`}
                  position={[resource.lat, resource.lon]}
                  icon={
                    amenityIconMapping[resource.amenity] ||
                    amenityIconMapping.default
                  }
                >
                  <Popup className="resource-popup">
                    <div className="p-2">
                      <h3 className="font-medium">
                        {resource.name ||
                          resource.amenity
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </h3>
                      {resource.address && (
                        <p className="text-sm text-gray-600 mt-1">
                          {resource.address}
                        </p>
                      )}
                      <div className="flex justify-between items-center mt-2 text-xs">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {resource.amenity
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                        <button
                          onClick={() =>
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${resource.lat},${resource.lon}`,
                              "_blank"
                            )
                          }
                          className="bg-green-600 text-white px-2 py-1 rounded flex items-center"
                        >
                          Directions <ArrowRight className="ml-1 w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {showEmergencyResources && (
                <EmergencyResourceLegend
                  amenityIconMapping={amenityIconMapping}
                />
              )}
            </FeatureGroup>
          </Overlay>
        </LayersControl>

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
                  <Home className="w-4 h-4 text-blue-500 mr-2" />
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
        <FeatureGroup>
          {floodReports.map((report) => (
            <CircleMarker
              key={report._id}
              center={[
                report.location.coordinates[1],
                report.location.coordinates[0],
              ]}
              radius={5 + Math.min(report.depth || 0, 15)} // Scale radius based on depth
              pathOptions={{
                color: depthToColor(report.depth),
                fillColor: depthToColor(report.depth),
                fillOpacity: 0.6,
                weight: 2,
              }}
              eventHandlers={{ click: () => handleMarkerClick(report) }}
            >
              <Popup maxWidth={320} className="report-popup">
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
                    <div className="flex items-center">
                      {report.verificationStatus === "verified" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" /> Verified
                        </span>
                      ) : report.verificationStatus === "disputed" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" /> Disputed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3 mr-1" /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mb-3 text-sm text-gray-600">
                    <MapPin className="w-3 h-3 mr-1 inline" />
                    {report.location.address ||
                      `${report.location.district}, ${report.location.state}`}
                  </div>
                  {report.depth !== undefined && report.depth !== null && (
                    <div className="mb-3 text-sm text-gray-700 flex items-center">
                      <Droplets className="w-4 h-4 mr-1 inline text-blue-600" />
                      <strong>Depth:</strong> {report.depth.toFixed(2)} meters
                    </div>
                  )}
                  <p className="text-sm mb-3">{report.description}</p>

                  {/* Weather conditions if available */}
                  {report.weatherConditions && (
                    <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-gray-600">
                      {report.weatherConditions.rainfall !== undefined && (
                        <div className="flex items-center">
                          <CloudRain className="w-3 h-3 mr-1" />
                          {report.weatherConditions.rainfall} mm
                        </div>
                      )}
                      {report.weatherConditions.temperature !== undefined && (
                        <div className="flex items-center">
                          <Sun className="w-3 h-3 mr-1" />
                          {report.weatherConditions.temperature}°C
                        </div>
                      )}
                      {report.weatherConditions.windSpeed !== undefined && (
                        <div className="flex items-center">
                          <Wind className="w-3 h-3 mr-1" />
                          {report.weatherConditions.windSpeed} km/h
                        </div>
                      )}
                    </div>
                  )}

                  {/* Impact information */}
                  {report.impact && (
                    <div className="text-xs text-gray-600 mb-3">
                      {report.impact.affectedPeople > 0 && (
                        <div className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {report.impact.affectedPeople} people affected
                        </div>
                      )}
                      {report.impact.damagedProperties > 0 && (
                        <div className="flex items-center mt-1">
                          <Home className="w-3 h-3 mr-1" />
                          {report.impact.damagedProperties} properties damaged
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 border-t pt-2 mt-2">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {format(parseISO(report.createdAt), "MMM dd, yyyy HH:mm")}
                    </div>
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => handleVote(report._id, "up")}
                        className="p-1 text-green-600 hover:bg-green-50 rounded mr-1"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <span className="mx-1">
                        {report.communityVotes
                          ? report.communityVotes.upvotes
                          : 0}
                      </span>
                      <button
                        onClick={() => handleVote(report._id, "down")}
                        className="p-1 text-red-600 hover:bg-red-50 rounded ml-1"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                      <span className="ml-1">
                        {report.communityVotes
                          ? report.communityVotes.downvotes
                          : 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center mt-3">
                    <button
                      onClick={() => navigate(`/portal/reports/${report._id}`)}
                      className="text-primary-600 hover:bg-primary-50 border border-primary-200 text-xs font-medium px-3 py-1 rounded-full flex items-center"
                    >
                      <Info className="w-3 h-3 mr-1" />
                      View Full Details
                    </button>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </FeatureGroup>

        {/* Alerts */}
        <FeatureGroup>
          {alerts.map((alert) => (
            <React.Fragment key={alert._id}>
              {/* Alert radius circle */}
              <Circle
                center={[
                  alert.location.coordinates[1],
                  alert.location.coordinates[0],
                ]}
                radius={alert.radius * 1000} // Convert km to meters
                pathOptions={{
                  color: "#DC2626",
                  fillColor: "#FEE2E2",
                  fillOpacity: 0.3,
                  weight: 2,
                }}
              />

              {/* Alert marker */}
              <Marker
                position={[
                  alert.location.coordinates[1],
                  alert.location.coordinates[0],
                ]}
                icon={alertIcon}
              >
                <Popup maxWidth={300} className="alert-popup">
                  <div className="p-2">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                      <span className="font-medium">
                        {alert.alertType.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="font-medium mb-2">{alert.title}</h4>
                    <p className="text-sm mb-3">{alert.message}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {format(
                          parseISO(alert.createdAt),
                          "MMM dd, yyyy HH:mm"
                        )}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {alert.radius} km radius
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/portal/alerts/${alert._id}`)}
                      className="w-full mt-3 bg-red-600 text-white text-xs font-medium px-3 py-2 rounded flex items-center justify-center"
                    >
                      View Alert Details
                      <ArrowRight className="ml-1 w-3 h-3" />
                    </button>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}
        </FeatureGroup>

        {/* Map Legends */}
        <MapLegend />
      </MapContainer>

      {/* Map Controls */}
      {showControls && (
        <div className="absolute top-4 left-4 z-[999] bg-white p-3 rounded-lg shadow-lg max-w-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Flood Map</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-1 rounded-md ${
                  showFilters
                    ? "bg-primary-100 text-primary-600"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <Filter className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`p-1 rounded-md ${
                  showHeatmap
                    ? "bg-primary-100 text-primary-600"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setShowEmergencyResources(!showEmergencyResources)
                }
                className={`p-1 rounded-md ${
                  showEmergencyResources
                    ? "bg-primary-100 text-primary-600"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <LifeBuoy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search location */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search location..."
              className="w-full pl-10 pr-12 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                onClick={handleSearch}
                className="px-2 py-1 mr-1 bg-primary-600 text-white text-xs rounded"
              >
                Go
              </button>
            </div>
          </div>

          {/* Filter UI */}
          {showFilters && (
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">
                    Min Depth
                  </label>
                  <input
                    type="number"
                    value={minDepth}
                    onChange={(e) => setMinDepth(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">
                    Max Depth
                  </label>
                  <input
                    type="number"
                    value={maxDepth}
                    onChange={(e) => setMaxDepth(e.target.value)}
                    placeholder="10.0"
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">
                    Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  >
                    <option value="">All</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">
                    Time Frame
                  </label>
                  <select
                    value={timeFrame}
                    onChange={(e) => setTimeFrame(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Past Week</option>
                    <option value="month">Past Month</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">
                    Status
                  </label>
                  <select
                    value={verificationStatus}
                    onChange={(e) => setVerificationStatus(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="disputed">Disputed</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">
                    Radius (km)
                  </label>
                  <input
                    type="number"
                    value={mapRadius}
                    onChange={(e) => setMapRadius(Number(e.target.value))}
                    min="1"
                    max="100"
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
              </div>

              {showEmergencyResources && (
                <div className="pt-2 border-t border-gray-200">
                  <label className="block text-xs text-gray-600 mb-1">
                    Emergency Resource Radius (km)
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={emergencyRadius}
                    onChange={(e) => setEmergencyRadius(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 text-center">
                    {emergencyRadius} km
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={resetFilters}
                  className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* Current stats */}
          <div className="text-xs text-gray-600 pt-2 border-t border-gray-200">
            <div className="flex justify-between">
              <span>Reports: {floodReports.length}</span>
              <span>Alerts: {alerts.length}</span>
              {showEmergencyResources && (
                <span>Resources: {emergencyResources.length}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map Copyright */}
      <div className="absolute bottom-2 right-2 z-[999] bg-white bg-opacity-75 px-2 py-1 rounded text-xs text-gray-600">
        © OpenStreetMap contributors
      </div>
    </div>
  );
};

export default InteractiveFloodMap;
