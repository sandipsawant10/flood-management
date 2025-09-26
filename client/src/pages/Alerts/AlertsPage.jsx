import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tab,
  Tabs,
} from "@mui/material";
import {
  NotificationsActive as NotificationsActiveIcon,
  LocationOn as LocationOnIcon,
  FilterList as FilterListIcon,
  Map as MapIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Navigation as NavigationIcon,
  FormatListBulleted as ListIcon,
} from "@mui/icons-material";

import { useGeoAlerts } from "../../hooks/useGeoAlerts";
import AlertsMap from "../../components/Maps/AlertsMap";

const AlertsPage = () => {
  const {
    isMonitoring,
    alertZones,
    nearbyAlerts,
    location,
    loading,
    error,
    startMonitoring,
    stopMonitoring,
    loadNearbyAlerts,
  } = useGeoAlerts();

  // Local state
  const [filters, setFilters] = useState({
    severity: "",
    type: "",
    radius: 50,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alertDetailOpen, setAlertDetailOpen] = useState(false);

  // Load alerts on mount and when filters change
  useEffect(() => {
    loadNearbyAlerts({
      params: {
        severity: filters.severity || undefined,
        type: filters.type || undefined,
        radius: filters.radius,
      },
    });
  }, [filters, loadNearbyAlerts]);

  // View mode state (list or map)
  const [viewMode, setViewMode] = useState("list");

  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Toggle monitoring
  const toggleMonitoring = () => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  };

  // Handle alert selection
  const handleAlertSelect = (alert) => {
    setSelectedAlert(alert);
    setAlertDetailOpen(true);
  };

  // Handle view mode change
  const handleViewModeChange = (event, newValue) => {
    setViewMode(newValue);
  };

  // Format distance (in kilometers)
  const formatDistance = (meters) => {
    if (!meters) return "Unknown";
    const km = meters / 1000;
    return km < 1 ? `${meters.toFixed(0)} m` : `${km.toFixed(1)} km`;
  };

  // Format severity color
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "primary";
      default:
        return "info";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  // Handle opening navigation for an alert
  const handleNavigate = (alert) => {
    if (!alert.location || !alert.location.latitude) return;

    const url = `https://www.google.com/maps/dir/?api=1&destination=${alert.location.latitude},${alert.location.longitude}`;
    window.open(url, "_blank");
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          Alerts & Warnings
        </Typography>

        <Box>
          <Button
            variant="contained"
            color={isMonitoring ? "secondary" : "primary"}
            onClick={toggleMonitoring}
            startIcon={<NotificationsActiveIcon />}
            sx={{ mr: 2 }}
          >
            {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
          </Button>

          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setDrawerOpen(true)}
          >
            Filters
          </Button>
        </Box>
      </Box>

      {/* Current location and alert zone status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "start", sm: "center" }}
          >
            <Box display="flex" alignItems="center" mb={{ xs: 2, sm: 0 }}>
              <LocationOnIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body1">
                {location
                  ? `Your location: ${location.latitude.toFixed(
                      5
                    )}, ${location.longitude.toFixed(5)}`
                  : "Location unavailable"}
              </Typography>
            </Box>

            {alertZones.length > 0 && (
              <Chip
                icon={<WarningIcon />}
                label={`You are in ${alertZones.length} alert zone${
                  alertZones.length > 1 ? "s" : ""
                }`}
                color="error"
                variant="outlined"
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || "Error loading alerts"}
        </Alert>
      )}

      {/* Loading indicator */}
      {loading && (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress />
        </Box>
      )}

      {/* View mode tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={viewMode}
          onChange={handleViewModeChange}
          aria-label="alert view mode"
        >
          <Tab
            value="list"
            icon={<ListIcon />}
            iconPosition="start"
            label="List View"
          />
          <Tab
            value="map"
            icon={<MapIcon />}
            iconPosition="start"
            label="Map View"
          />
        </Tabs>
      </Box>

      {/* Map View */}
      {viewMode === "map" && (
        <Box mb={3}>
          <AlertsMap height={500} />
        </Box>
      )}

      {/* Alert list */}
      {viewMode === "list" && (
        <>
          {!loading && nearbyAlerts.length === 0 ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              No alerts found in your area with the current filters.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {nearbyAlerts.map((alert) => (
                <Grid item xs={12} md={6} key={alert.id}>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardContent>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="start"
                      >
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {alert.title}
                          </Typography>
                          <Box display="flex" gap={1} mb={1} flexWrap="wrap">
                            <Chip
                              size="small"
                              label={alert.severity}
                              color={getSeverityColor(alert.severity)}
                            />
                            {alert.type && (
                              <Chip
                                size="small"
                                label={alert.type}
                                variant="outlined"
                              />
                            )}
                            {alert.distance && (
                              <Chip
                                size="small"
                                icon={<LocationOnIcon />}
                                label={formatDistance(alert.distance)}
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>

                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => handleAlertSelect(alert)}
                            color="primary"
                          >
                            <InfoIcon />
                          </IconButton>
                        </Box>
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {alert.description?.length > 150
                          ? `${alert.description.substring(0, 150)}...`
                          : alert.description}
                      </Typography>

                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(alert.createdAt || alert.timestamp)}
                        </Typography>

                        {alert.location && (
                          <Button
                            size="small"
                            startIcon={<NavigationIcon />}
                            onClick={() => handleNavigate(alert)}
                          >
                            Directions
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Filters drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 300, p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h6">Filter Alerts</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <form>
            <FormControl fullWidth margin="normal">
              <InputLabel id="severity-label">Severity</InputLabel>
              <Select
                labelId="severity-label"
                id="severity"
                name="severity"
                value={filters.severity}
                label="Severity"
                onChange={handleFilterChange}
              >
                <MenuItem value="">Any severity</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel id="type-label">Alert Type</InputLabel>
              <Select
                labelId="type-label"
                id="type"
                name="type"
                value={filters.type}
                label="Alert Type"
                onChange={handleFilterChange}
              >
                <MenuItem value="">Any type</MenuItem>
                <MenuItem value="flood">Flood</MenuItem>
                <MenuItem value="weather">Weather</MenuItem>
                <MenuItem value="evacuation">Evacuation</MenuItem>
                <MenuItem value="infrastructure">Infrastructure</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <TextField
                id="radius"
                name="radius"
                label="Radius (km)"
                type="number"
                value={filters.radius}
                onChange={handleFilterChange}
                InputProps={{ inputProps: { min: 1, max: 200 } }}
              />
            </FormControl>

            <Box mt={3}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => setDrawerOpen(false)}
              >
                Apply Filters
              </Button>
            </Box>
          </form>
        </Box>
      </Drawer>

      {/* Alert details dialog */}
      <Dialog
        open={alertDetailOpen}
        onClose={() => setAlertDetailOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedAlert && (
          <>
            <DialogTitle>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                {selectedAlert.title}
                <IconButton onClick={() => setAlertDetailOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>

            <DialogContent dividers>
              <Box mb={2}>
                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  <Chip
                    label={selectedAlert.severity}
                    color={getSeverityColor(selectedAlert.severity)}
                  />
                  {selectedAlert.type && (
                    <Chip label={selectedAlert.type} variant="outlined" />
                  )}
                </Box>

                <Typography variant="body1" gutterBottom>
                  {selectedAlert.description}
                </Typography>
              </Box>

              {selectedAlert.instructions && (
                <Box mb={2}>
                  <Typography variant="subtitle1" gutterBottom>
                    Safety Instructions:
                  </Typography>
                  <Typography variant="body2">
                    {selectedAlert.instructions}
                  </Typography>
                </Box>
              )}

              <Box mb={2}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Alert issued:{" "}
                  {formatDate(
                    selectedAlert.createdAt || selectedAlert.timestamp
                  )}
                </Typography>

                {selectedAlert.expiresAt && (
                  <Typography variant="subtitle2" color="text.secondary">
                    Expires: {formatDate(selectedAlert.expiresAt)}
                  </Typography>
                )}
              </Box>

              {selectedAlert.location && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Alert Location:
                  </Typography>
                  <Typography variant="body2">
                    Latitude: {selectedAlert.location.latitude}
                  </Typography>
                  <Typography variant="body2">
                    Longitude: {selectedAlert.location.longitude}
                  </Typography>
                  {selectedAlert.distance && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Distance from you:{" "}
                      {formatDistance(selectedAlert.distance)}
                    </Typography>
                  )}
                </Box>
              )}
            </DialogContent>

            <DialogActions>
              {selectedAlert.location && (
                <Button
                  startIcon={<MapIcon />}
                  onClick={() => handleNavigate(selectedAlert)}
                >
                  View on Map
                </Button>
              )}
              <Button onClick={() => setAlertDetailOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default AlertsPage;
