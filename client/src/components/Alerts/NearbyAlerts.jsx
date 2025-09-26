import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Button,
  CircularProgress,
  List,
  ListItem,
  Chip,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { useGeoAlerts } from "../../hooks/useGeoAlerts";

/**
 * Component that displays alerts based on user's geolocation
 */
const NearbyAlerts = ({ maxAlerts = 3, showControls = true }) => {
  // Get geolocation alerts using our custom hook
  const {
    isMonitoring,
    alertZones,
    nearbyAlerts,
    location,
    loading,
    error,
    startMonitoring,
    stopMonitoring,
    checkNow,
    loadNearbyAlerts,
  } = useGeoAlerts();

  const [permissionDenied, setPermissionDenied] = useState(false);

  // Check for permission denied error
  useEffect(() => {
    if (error && error.PERMISSION_DENIED) {
      setPermissionDenied(true);
    }
  }, [error]);

  // Handle refresh button click
  const handleRefresh = async () => {
    await checkNow();
    await loadNearbyAlerts();
  };

  // Format coordinates for display
  const formatCoords = (loc) => {
    if (!loc) return "Unknown location";
    return `${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)}`;
  };

  if (permissionDenied) {
    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Alert severity="warning">
            Location permission was denied. Please enable location access in
            your browser settings to see nearby alerts.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography
            variant="h6"
            component="div"
            display="flex"
            alignItems="center"
          >
            <LocationOnIcon color="primary" sx={{ mr: 1 }} />
            Nearby Alerts
          </Typography>

          {showControls && (
            <Box>
              <Button
                size="small"
                onClick={handleRefresh}
                disabled={loading}
                sx={{ mr: 1 }}
              >
                Refresh
              </Button>

              {isMonitoring ? (
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  onClick={stopMonitoring}
                  disabled={loading}
                >
                  Stop Monitoring
                </Button>
              ) : (
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={startMonitoring}
                  disabled={loading}
                >
                  Start Monitoring
                </Button>
              )}
            </Box>
          )}
        </Box>

        {location && (
          <Box mb={2} display="flex" alignItems="center">
            <Chip
              icon={<LocationOnIcon />}
              label={`Your location: ${formatCoords(location)}`}
              variant="outlined"
              size="small"
            />

            {isMonitoring && (
              <Chip
                icon={<NotificationsActiveIcon />}
                label="Monitoring active"
                color="primary"
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        )}

        {loading && (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress size={24} />
          </Box>
        )}

        {alertZones.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">
              You are currently in {alertZones.length} alert zone(s)!
            </Typography>
          </Alert>
        )}

        {!loading && nearbyAlerts.length === 0 && (
          <Alert severity="info">No alerts in your area at this time.</Alert>
        )}

        {nearbyAlerts.length > 0 && (
          <>
            <Typography variant="subtitle2" gutterBottom>
              {nearbyAlerts.length} alert(s) in your area:
            </Typography>

            <List dense disablePadding>
              {nearbyAlerts.slice(0, maxAlerts).map((alert) => (
                <ListItem key={alert.id} disableGutters>
                  <Card variant="outlined" sx={{ width: "100%", mb: 1 }}>
                    <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="subtitle2">
                          {alert.title}
                        </Typography>
                        <Chip
                          label={alert.severity}
                          size="small"
                          color={
                            alert.severity === "critical"
                              ? "error"
                              : alert.severity === "high"
                              ? "warning"
                              : "info"
                          }
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {alert.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </ListItem>
              ))}
            </List>

            {nearbyAlerts.length > maxAlerts && (
              <Button size="small" variant="text" sx={{ mt: 1 }} href="/alerts">
                View all {nearbyAlerts.length} alerts
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NearbyAlerts;
