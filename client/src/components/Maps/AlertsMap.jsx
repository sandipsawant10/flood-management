import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useGeoAlerts } from "../../hooks/useGeoAlerts";
import { getCurrentLocation } from "../../services/geolocationService";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Check if Leaflet is available
const hasLeaflet = typeof L !== "undefined";

// This component will be loaded only if Leaflet is loaded
const AlertsMap = ({
  height = 400,
  width = "100%",
  showControls = true,
  publicView = false,
  showEmergencies = false,
  showRescueTeams = false,
  rescuerView = false,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const alertMarkersRef = useRef([]);
  const emergencyMarkersRef = useRef([]);
  const teamMarkersRef = useRef([]);
  const userMarkerRef = useRef(null);

  const {
    isMonitoring,
    alertZones,
    nearbyAlerts,
    location,
    loading: alertsLoading,
    error: alertsError,
    startMonitoring,
    stopMonitoring,
  } = useGeoAlerts();

  // Fetch active emergencies for the map
  const { data: emergencies, isLoading: emergenciesLoading } = useQuery({
    queryKey: ["map-emergencies"],
    queryFn: async () => {
      const response = await axios.get("/api/emergency/active");
      return response.data;
    },
    enabled: showEmergencies,
    refetchInterval: rescuerView ? 30000 : false, // Update every 30 seconds for rescuers
  });

  // Fetch active rescue teams for the map
  const { data: rescueTeams, isLoading: teamsLoading } = useQuery({
    queryKey: ["map-rescue-teams"],
    queryFn: async () => {
      const response = await axios.get("/api/emergency/teams/active");
      return response.data;
    },
    enabled: showRescueTeams && rescuerView,
    refetchInterval: rescuerView ? 30000 : false,
  });

  const loading = alertsLoading || emergenciesLoading || teamsLoading;
  const error = alertsError;

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  // Initialize map
  useEffect(() => {
    if (!hasLeaflet) {
      setMapError(
        "Leaflet map library not loaded. Please check your internet connection."
      );
      return;
    }

    if (!mapRef.current) return;

    try {
      // Create map instance if it doesn't exist
      if (!mapInstanceRef.current) {
        // Create map
        mapInstanceRef.current = L.map(mapRef.current).setView(
          [20.5937, 78.9629],
          5
        );

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstanceRef.current);

        setMapLoaded(true);
      }

      // Center map on user location if available
      if (location && mapInstanceRef.current) {
        mapInstanceRef.current.setView(
          [location.latitude, location.longitude],
          12
        );
      }

      return () => {
        // Clean up map on unmount
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    } catch (err) {
      console.error("Error initializing map:", err);
      setMapError(`Error initializing map: ${err.message}`);
    }
  }, [mapRef, location]);

  // Update user location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !location || !mapLoaded) return;

    try {
      // Remove existing marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      // Create new marker
      userMarkerRef.current = L.marker(
        [location.latitude, location.longitude],
        {
          icon: L.divIcon({
            className: "user-location-marker",
            html: `<div style="background-color: #4285F4; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          }),
        }
      ).addTo(mapInstanceRef.current);

      // Add accuracy circle
      if (location.accuracy) {
        L.circle([location.latitude, location.longitude], {
          radius: location.accuracy,
          weight: 1,
          color: "#4285F4",
          fillColor: "#4285F455",
          fillOpacity: 0.2,
        }).addTo(mapInstanceRef.current);
      }
    } catch (err) {
      console.error("Error updating user location marker:", err);
    }
  }, [location, mapLoaded]);

  // Update alert markers
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || !nearbyAlerts) return;

    try {
      // Remove existing markers
      alertMarkersRef.current.forEach((marker) => marker.remove());
      alertMarkersRef.current = [];

      // Add markers for each alert
      nearbyAlerts.forEach((alert) => {
        if (!alert.location || !alert.location.latitude) return;

        // Determine marker color based on severity
        const getColor = (severity) => {
          switch (severity?.toLowerCase()) {
            case "critical":
              return "#d32f2f"; // red
            case "high":
              return "#f57c00"; // orange
            case "medium":
              return "#fbc02d"; // yellow
            default:
              return "#2196f3"; // blue
          }
        };

        // Create marker
        const marker = L.marker(
          [alert.location.latitude, alert.location.longitude],
          {
            icon: L.divIcon({
              className: "alert-marker",
              html: `<div style="background-color: ${getColor(
                alert.severity
              )}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; box-shadow: 0 0 5px rgba(0,0,0,0.5);">!</div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
              popupAnchor: [0, -12],
            }),
          }
        ).addTo(mapInstanceRef.current);

        // Add popup
        marker.bindPopup(`
          <div>
            <h3 style="font-size: 16px; margin: 0 0 5px; color: ${getColor(
              alert.severity
            )}">${alert.title}</h3>
            <p style="margin: 0 0 5px;">${alert.message}</p>
            <span style="font-size: 12px; color: #666;">
              ${new Date(alert.createdAt || alert.timestamp).toLocaleString()}
            </span>
          </div>
        `);

        // Add to ref array for cleanup
        alertMarkersRef.current.push(marker);

        // Show affected areas if available
        if (alert.targetArea) {
          if (alert.targetArea.type === "Circle" && alert.location) {
            const circle = L.circle(
              [alert.location.latitude, alert.location.longitude],
              {
                radius: alert.targetArea.radius || 5000,
                color: getColor(alert.severity),
                fillColor: getColor(alert.severity),
                fillOpacity: 0.1,
                weight: 1,
              }
            ).addTo(mapInstanceRef.current);

            alertMarkersRef.current.push(circle);
          } else if (
            alert.targetArea.type === "Polygon" &&
            Array.isArray(alert.targetArea.coordinates)
          ) {
            const polygon = L.polygon(
              alert.targetArea.coordinates.map((coord) => [coord[1], coord[0]]),
              {
                color: getColor(alert.severity),
                fillColor: getColor(alert.severity),
                fillOpacity: 0.1,
                weight: 1,
              }
            ).addTo(mapInstanceRef.current);

            alertMarkersRef.current.push(polygon);
          }
        }
      });
    } catch (err) {
      console.error("Error updating alert markers:", err);
    }
  }, [nearbyAlerts, mapLoaded]);

  // Update emergency markers
  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !mapLoaded ||
      !showEmergencies ||
      !emergencies?.length
    )
      return;

    try {
      // Remove existing markers
      emergencyMarkersRef.current.forEach((marker) => marker.remove());
      emergencyMarkersRef.current = [];

      // Add markers for each emergency
      emergencies.forEach((emergency) => {
        if (!emergency.location || !emergency.location.coordinates) return;

        const lat = emergency.location.coordinates[1]; // MongoDB GeoJSON uses [lng, lat]
        const lng = emergency.location.coordinates[0];

        // Create marker
        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: "emergency-marker",
            html: `<div style="background-color: #d32f2f; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; box-shadow: 0 0 5px rgba(0,0,0,0.5);">SOS</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15],
          }),
        }).addTo(mapInstanceRef.current);

        // Add popup
        marker.bindPopup(`
          <div>
            <h3 style="font-size: 16px; margin: 0 0 5px; color: #d32f2f">Emergency: ${
              emergency.type
            }</h3>
            <p style="margin: 0 0 5px; font-weight: bold;">Severity: ${
              emergency.severity
            }</p>
            <p style="margin: 0 0 5px;">${
              emergency.description || "No description"
            }</p>
            <p style="margin: 0 0 5px;">Status: ${emergency.status}</p>
            <p style="margin: 0 0 5px;">Affected People: ${
              emergency.affectedPeople || "Unknown"
            }</p>
            <span style="font-size: 12px; color: #666;">
              ${new Date(emergency.createdAt).toLocaleString()}
            </span>
          </div>
        `);

        // Add to ref array for cleanup
        emergencyMarkersRef.current.push(marker);

        // Add affected area circle
        const circle = L.circle([lat, lng], {
          radius: emergency.radius || 300,
          color: "#d32f2f",
          fillColor: "#d32f2f",
          fillOpacity: 0.2,
          weight: 2,
          className: "emergency-zone",
        }).addTo(mapInstanceRef.current);

        emergencyMarkersRef.current.push(circle);
      });
    } catch (err) {
      console.error("Error updating emergency markers:", err);
    }
  }, [emergencies, mapLoaded, showEmergencies]);

  // Update rescue team markers
  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !mapLoaded ||
      !showRescueTeams ||
      !rescueTeams?.length
    )
      return;

    try {
      // Remove existing markers
      teamMarkersRef.current.forEach((marker) => marker.remove());
      teamMarkersRef.current = [];

      // Add markers for each rescue team
      rescueTeams.forEach((team) => {
        if (!team.location || !team.location.coordinates) return;

        const lat = team.location.coordinates[1]; // MongoDB GeoJSON uses [lng, lat]
        const lng = team.location.coordinates[0];

        // Create marker
        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: "team-marker",
            html: `<div style="background-color: #2e7d32; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; box-shadow: 0 0 5px rgba(0,0,0,0.5);">RT</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            popupAnchor: [0, -14],
          }),
        }).addTo(mapInstanceRef.current);

        // Add popup
        marker.bindPopup(`
          <div>
            <h3 style="font-size: 16px; margin: 0 0 5px; color: #2e7d32">Team: ${
              team.name
            }</h3>
            <p style="margin: 0 0 5px;">Status: ${team.status}</p>
            <p style="margin: 0 0 5px;">Members: ${
              team.memberCount || "Unknown"
            }</p>
            <span style="font-size: 12px; color: #666;">
              Last updated: ${new Date(
                team.lastUpdated || team.updatedAt
              ).toLocaleString()}
            </span>
          </div>
        `);

        // Add to ref array for cleanup
        teamMarkersRef.current.push(marker);
      });
    } catch (err) {
      console.error("Error updating rescue team markers:", err);
    }
  }, [rescueTeams, mapLoaded, showRescueTeams]);

  // Handle user in alert zones
  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !mapLoaded ||
      !alertZones ||
      alertZones.length === 0
    )
      return;

    try {
      // Highlight affected zones if user is in them
      if (location) {
        alertZones.forEach((alert) => {
          if (!alert.targetArea) return;

          // Add pulsing effect to the alert zone
          if (alert.targetArea.type === "Circle" && alert.location) {
            const pulse = L.circle(
              [alert.location.latitude, alert.location.longitude],
              {
                radius: alert.targetArea.radius || 5000,
                color: "#ff0000",
                fillColor: "#ff000055",
                fillOpacity: 0.3,
                weight: 2,
                className: "pulsing-circle",
              }
            ).addTo(mapInstanceRef.current);

            alertMarkersRef.current.push(pulse);
          }
        });
      }
    } catch (err) {
      console.error("Error highlighting alert zones:", err);
    }
  }, [alertZones, location, mapLoaded]);

  // Handle locate me button click
  const handleLocateMe = async () => {
    try {
      const position = await getCurrentLocation();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView(
          [position.latitude, position.longitude],
          12
        );
      }
    } catch (err) {
      console.error("Error getting current location:", err);
    }
  };

  if (mapError) {
    return <Alert severity="error">{mapError}</Alert>;
  }

  return (
    <Paper elevation={2} sx={{ overflow: "hidden" }}>
      {showControls && (
        <Box
          px={2}
          py={1}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          borderBottom="1px solid #eee"
        >
          <Typography variant="h6">
            {rescuerView
              ? "Emergency Response Map"
              : publicView
              ? "Public Flood Alerts"
              : "Flood Alert Map"}
          </Typography>
          <Box>
            <Button size="small" onClick={handleLocateMe} sx={{ mr: 1 }}>
              Locate Me
            </Button>
            {!publicView && (
              <Button
                size="small"
                variant={isMonitoring ? "outlined" : "contained"}
                color={isMonitoring ? "secondary" : "primary"}
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
                disabled={loading}
              >
                {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
              </Button>
            )}
          </Box>
        </Box>
      )}

      <Box position="relative" height={height} width={width}>
        {loading && (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            sx={{ transform: "translate(-50%, -50%)", zIndex: 1000 }}
          >
            <CircularProgress size={40} />
          </Box>
        )}

        {error && (
          <Box position="absolute" top={16} left={16} right={16} zIndex={1000}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.message || "Error loading map"}
            </Alert>
          </Box>
        )}

        <Box
          ref={mapRef}
          sx={{
            height: "100%",
            width: "100%",
            "& .leaflet-container": {
              height: "100%",
              width: "100%",
            },
            "& .pulsing-circle": {
              animation: "pulse 1.5s infinite",
            },
            "@keyframes pulse": {
              "0%": {
                opacity: 0.6,
                transform: "scale(0.9)",
              },
              "50%": {
                opacity: 0.3,
                transform: "scale(1.1)",
              },
              "100%": {
                opacity: 0.6,
                transform: "scale(0.9)",
              },
            },
          }}
        />

        {nearbyAlerts?.length > 0 && alertZones?.length > 0 && (
          <Box position="absolute" top={16} right={16} zIndex={1000}>
            <Alert severity="warning">
              <Typography variant="body2">You are in an alert zone!</Typography>
            </Alert>
          </Box>
        )}

        {/* Map Legend for rescue view */}
        {(showEmergencies || showRescueTeams) && (
          <Box
            position="absolute"
            bottom={16}
            right={16}
            zIndex={1000}
            bgcolor="rgba(255,255,255,0.85)"
            p={1.5}
            borderRadius={1}
            boxShadow={2}
          >
            <Typography variant="subtitle2" fontWeight="bold" mb={1}>
              Map Legend
            </Typography>
            <Box display="flex" alignItems="center" mb={1}>
              <Box
                width={16}
                height={16}
                borderRadius="50%"
                bgcolor="#4285F4"
                mr={1}
                border="2px solid white"
                boxShadow="0 0 3px rgba(0,0,0,0.3)"
              />
              <Typography variant="body2">Your Location</Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={1}>
              <Box
                width={16}
                height={16}
                borderRadius="50%"
                bgcolor="#d32f2f"
                mr={1}
                border="2px solid white"
                boxShadow="0 0 3px rgba(0,0,0,0.3)"
              />
              <Typography variant="body2">Emergency/SOS</Typography>
            </Box>
            {showRescueTeams && (
              <Box display="flex" alignItems="center" mb={1}>
                <Box
                  width={16}
                  height={16}
                  borderRadius="50%"
                  bgcolor="#2e7d32"
                  mr={1}
                  border="2px solid white"
                  boxShadow="0 0 3px rgba(0,0,0,0.3)"
                />
                <Typography variant="body2">Rescue Team</Typography>
              </Box>
            )}
            <Box display="flex" alignItems="center">
              <Box
                width={16}
                height={16}
                borderRadius="50%"
                bgcolor="#f57c00"
                mr={1}
                border="2px solid white"
                boxShadow="0 0 3px rgba(0,0,0,0.3)"
              />
              <Typography variant="body2">Alert</Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

// Wrapper component that conditionally renders map based on script loading
const AlertsMapWrapper = (props) => {
  const [scriptLoaded, setScriptLoaded] = useState(hasLeaflet);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    if (hasLeaflet) {
      setScriptLoaded(true);
      return;
    }

    // Load Leaflet script dynamically if not already present
    const loadLeaflet = () => {
      // Load CSS
      const linkElem = document.createElement("link");
      linkElem.rel = "stylesheet";
      linkElem.href = "https://unpkg.com/leaflet@1.9.3/dist/leaflet.css";
      document.head.appendChild(linkElem);

      // Add custom CSS for markers and animations
      const customCss = document.createElement("style");
      customCss.textContent = `
        .pulsing-circle {
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% {
            opacity: 0.6;
            transform: scale(0.9);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.1);
          }
          100% {
            opacity: 0.6;
            transform: scale(0.9);
          }
        }
        .emergency-zone {
          animation: emergency-pulse 2s infinite;
        }
        @keyframes emergency-pulse {
          0% {
            stroke-opacity: 0.8;
            stroke-width: 2;
          }
          50% {
            stroke-opacity: 0.4;
            stroke-width: 3;
          }
          100% {
            stroke-opacity: 0.8;
            stroke-width: 2;
          }
        }
      `;
      document.head.appendChild(customCss);

      // Load JS
      const scriptElem = document.createElement("script");
      scriptElem.src = "https://unpkg.com/leaflet@1.9.3/dist/leaflet.js";
      scriptElem.integrity =
        "sha256-WBkoXOwTeyKclOHuWtc+i2uENFpDZ9YPdf5Hf+D7ewM=";
      scriptElem.crossOrigin = "";

      scriptElem.onload = () => setScriptLoaded(true);
      scriptElem.onerror = () => setScriptError(true);

      document.head.appendChild(scriptElem);
    };

    loadLeaflet();
  }, []);

  if (scriptError) {
    return (
      <Alert severity="error">
        Failed to load map library. Please check your internet connection and
        try again.
      </Alert>
    );
  }

  if (!scriptLoaded) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={props.height || 400}
      >
        <CircularProgress />
        <Typography variant="body2" ml={2}>
          Loading map...
        </Typography>
      </Box>
    );
  }

  return <AlertsMap {...props} />;
};

export default AlertsMapWrapper;
