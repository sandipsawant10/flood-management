import React, { useEffect, useState, useCallback } from "react";
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
  Loader2,
} from "lucide-react";

import { floodReportService } from "../../services/floodReportService";
import ErrorBoundary from "../Common/ErrorBoundary";

// Heatmap Layer Component
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

// SetViewAndZoom Component
function SetViewAndZoom({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
}

// Loading Component
const LoadingSpinner = ({ message = "Loading map data..." }) => (
  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-[1000]">
    <div className="flex flex-col items-center space-y-2">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  </div>
);

// Error Component
const ErrorMessage = ({ message, onRetry }) => (
  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-[1000]">
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center max-w-md">
      <XCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
      <h3 className="text-red-800 font-medium mb-2">Map Error</h3>
      <p className="text-red-600 text-sm mb-3">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

// Main FloodMap Component
const FloodMap = ({
  center = [28.6139, 77.209], // Default to Delhi
  zoom = 10,
  height = "500px",
  filters = {},
  showReports = true,
  onReportClick = null,
  className = "",
}) => {
  const [mapCenter, setMapCenter] = useState(center);

  // Fetch flood reports
  const {
    data: reportsData,
    isLoading: reportsLoading,
    error: reportsError,
    refetch: refetchReports,
  } = useQuery({
    queryKey: ["flood-reports-map", filters],
    queryFn: () => floodReportService.getFloodReports(filters),
    enabled: showReports,
    retry: 3,
    staleTime: 300000, // 5 minutes
  });

  // Process data
  const floodReports = reportsData?.data || reportsData || [];

  // Update map center when center prop changes
  useEffect(() => {
    if (center) {
      setMapCenter(center);
    }
  }, [center]);

  // Depth to color mapping
  const depthToColor = useCallback((depth) => {
    if (depth < 0.5) return "#3B82F6"; // Blue for shallow
    if (depth < 1) return "#F59E0B"; // Orange for medium
    if (depth < 2) return "#EF4444"; // Red for deep
    return "#7C2D12"; // Dark red for very deep
  }, []);

  // Handle loading states
  const isLoading = showReports && reportsLoading;

  // Handle errors
  const hasError = reportsError;
  const errorMessage = reportsError?.message;

  const handleRetry = () => {
    if (reportsError) refetchReports();
  };

  return (
    <ErrorBoundary
      message="The flood map failed to load. This might be due to network issues or invalid location data."
      onRetry={handleRetry}
    >
      <div className={`relative ${className}`} style={{ height }}>
        {isLoading && <LoadingSpinner />}
        {hasError && (
          <ErrorMessage message={errorMessage} onRetry={handleRetry} />
        )}

        <MapContainer
          center={mapCenter}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
        >
          <SetViewAndZoom center={mapCenter} zoom={zoom} />

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Flood Report Markers */}
          <ErrorBoundary message="Unable to display flood report markers">
            {showReports &&
              floodReports?.map((report) => {
                const position = report.location?.coordinates
                  ? [
                      report.location.coordinates[1],
                      report.location.coordinates[0],
                    ]
                  : [report.location?.latitude, report.location?.longitude];

                if (!position[0] || !position[1]) return null;

                return (
                  <Marker
                    key={report._id}
                    position={position}
                    icon={L.divIcon({
                      className: "custom-div-icon",
                      html: `
                  <div style="
                    background-color: ${depthToColor(report.depth || 0)};
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 10px;
                    font-weight: bold;
                  ">
                    ${report.depth ? Math.round(report.depth * 10) / 10 : "?"}
                  </div>
                `,
                      iconSize: [20, 20],
                      iconAnchor: [10, 10],
                    })}
                    eventHandlers={{
                      click: () => onReportClick && onReportClick(report),
                    }}
                  >
                    <Popup maxWidth={300}>
                      <div className="p-2">
                        <div className="flex items-center mb-2">
                          <Droplets className="w-4 h-4 text-blue-500 mr-2" />
                          <span className="font-medium text-sm">
                            Flood Report
                          </span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div>
                            <strong>Severity:</strong> {report.severity}
                          </div>
                          <div>
                            <strong>Water Level:</strong> {report.waterLevel}
                          </div>
                          {report.depth && (
                            <div>
                              <strong>Depth:</strong> {report.depth}m
                            </div>
                          )}
                          <div>
                            <strong>Status:</strong> {report.status}
                          </div>
                          {report.createdAt && (
                            <div>
                              <strong>Reported:</strong>{" "}
                              {new Date(report.createdAt).toLocaleDateString()}
                            </div>
                          )}
                          {report.description && (
                            <div className="mt-2 text-gray-600">
                              {report.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
          </ErrorBoundary>
        </MapContainer>
      </div>
    </ErrorBoundary>
  );
};

export default FloodMap;
