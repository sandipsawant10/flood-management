import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Divider,
  Chip,
  Alert,
  AlertTitle,
  Button,
  IconButton,
  Tooltip,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  TextField,
  useTheme,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  Scatter,
  ScatterChart,
  ZAxis,
  ComposedChart,
  Bar,
  Cell,
} from "recharts";
import RefreshIcon from "@mui/icons-material/Refresh";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { analyticsService } from "../../services/analyticsService";

const SensorMonitoringComponent = ({
  region,
  sensorData: initialSensorData,
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [sensorData, setSensorData] = useState(initialSensorData || null);
  const [error, setError] = useState(null);
  const [selectedSensorType, setSelectedSensorType] = useState("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  // Set up auto refresh interval
  useEffect(() => {
    if (!autoRefresh) return;

    const fetchUpdates = async () => {
      await fetchSensorData();
    };

    const intervalId = setInterval(fetchUpdates, refreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, fetchSensorData]);

  // Initial data fetch
  useEffect(() => {
    fetchSensorData();
  }, [region, selectedSensorType, selectedTimeRange, fetchSensorData]);

  const fetchSensorData = useCallback(async () => {
    if (loading && sensorData) {
      // Skip fetching if we already have data and are still loading
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getSensorData(
        [],
        region === "all" ? "all" : region
      );
      setSensorData(data);
    } catch (err) {
      console.error("Error fetching sensor data:", err);
      setError("Failed to load sensor data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [loading, sensorData, region]);

  const handleRefresh = () => {
    fetchSensorData();
  };

  const handleSensorTypeChange = (event) => {
    setSelectedSensorType(event.target.value);
  };

  const handleTimeRangeChange = (event) => {
    setSelectedTimeRange(event.target.value);
  };

  const handleAutoRefreshChange = (event) => {
    setAutoRefresh(event.target.checked);
  };

  const handleAlertThresholdChange = (event) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setAlertThreshold(value);
    }
  };

  const handleIntervalChange = (event) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value >= 5) {
      setRefreshInterval(value);
    }
  };

  // Prepare sensor data for visualization based on filters
  const prepareSensorData = () => {
    if (!sensorData?.readings) return [];

    let filteredData = [...sensorData.readings];

    // Filter by sensor type if not 'all'
    if (selectedSensorType !== "all") {
      filteredData = filteredData.filter(
        (sensor) => sensor.type === selectedSensorType
      );
    }

    // Sort by timestamp to ensure chronological order
    filteredData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return filteredData;
  };

  // Prepare aggregated status data for overview
  const prepareStatusSummary = () => {
    if (!sensorData?.readings)
      return { normal: 0, warning: 0, critical: 0, offline: 0 };

    return sensorData.readings.reduce(
      (acc, sensor) => {
        const status = sensor.status.toLowerCase();
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { normal: 0, warning: 0, critical: 0, offline: 0 }
    );
  };

  // Prepare data for time series chart
  const prepareTimeSeriesData = () => {
    if (!sensorData?.timeSeriesData) return [];
    return sensorData.timeSeriesData;
  };

  // Get status color based on sensor reading
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "normal":
        return "#22c55e"; // green
      case "warning":
        return "#f59e0b"; // amber
      case "critical":
        return "#ef4444"; // red
      case "offline":
        return "#6b7280"; // gray
      default:
        return "#3b82f6"; // blue
    }
  };

  // Get appropriate icon based on status
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "normal":
        return <CheckCircleIcon sx={{ color: getStatusColor(status) }} />;
      case "warning":
        return <WarningIcon sx={{ color: getStatusColor(status) }} />;
      case "critical":
        return <ErrorIcon sx={{ color: getStatusColor(status) }} />;
      case "offline":
        return <RefreshIcon sx={{ color: getStatusColor(status) }} />;
      default:
        return <CheckCircleIcon sx={{ color: getStatusColor(status) }} />;
    }
  };

  if (loading && !sensorData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && !sensorData) {
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        {error}
      </Alert>
    );
  }

  const filteredSensorData = prepareSensorData();
  const statusSummary = prepareStatusSummary();
  const timeSeriesData = prepareTimeSeriesData();
  const sensorTypes = sensorData?.sensorTypes || [];

  return (
    <Box sx={{ width: "100%" }}>
      <Paper
        sx={{
          p: 2,
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h6">
          Real-time Sensor Monitoring {region !== "all" ? `- ${region}` : ""}
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Tooltip title={loading ? "Refreshing..." : "Refresh Data"}>
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={handleAutoRefreshChange}
                color="primary"
              />
            }
            label="Auto Refresh"
          />
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Filter Controls */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sensor Type</InputLabel>
                  <Select
                    value={selectedSensorType}
                    onChange={handleSensorTypeChange}
                    label="Sensor Type"
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    {sensorTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Time Range</InputLabel>
                  <Select
                    value={selectedTimeRange}
                    onChange={handleTimeRangeChange}
                    label="Time Range"
                  >
                    <MenuItem value="1h">Last Hour</MenuItem>
                    <MenuItem value="6h">Last 6 Hours</MenuItem>
                    <MenuItem value="12h">Last 12 Hours</MenuItem>
                    <MenuItem value="24h">Last 24 Hours</MenuItem>
                    <MenuItem value="7d">Last 7 Days</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Alert Threshold (%)"
                  type="number"
                  size="small"
                  fullWidth
                  value={alertThreshold}
                  onChange={handleAlertThresholdChange}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Refresh Interval (s)"
                  type="number"
                  size="small"
                  fullWidth
                  value={refreshInterval}
                  onChange={handleIntervalChange}
                  disabled={!autoRefresh}
                  inputProps={{ min: 5 }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<NotificationsActiveIcon />}
                >
                  Configure Alerts
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Status Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sensor Network Status
              </Typography>

              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 2, my: 2 }}
              >
                {Object.entries(statusSummary).map(([status, count]) => (
                  <Box
                    key={status}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    {getStatusIcon(status)}
                    <Box sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ textTransform: "capitalize" }}
                        >
                          {status}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {count}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: "100%",
                          bgcolor: "background.default",
                          height: 8,
                          borderRadius: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: `${
                              (count / sensorData.readings.length) * 100
                            }%`,
                            bgcolor: getStatusColor(status),
                            height: "100%",
                            borderRadius: 1,
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Network Information
              </Typography>

              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total Sensors
                  </Typography>
                  <Typography variant="body1">
                    {sensorData.readings.length}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Coverage
                  </Typography>
                  <Typography variant="body1">
                    {sensorData.coverage}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Update Frequency
                  </Typography>
                  <Typography variant="body1">
                    {sensorData.updateFrequency}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Last Ping
                  </Typography>
                  <Typography variant="body1">
                    {new Date(sensorData.lastPing).toLocaleTimeString()}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                {statusSummary.critical > 0 && (
                  <Alert severity="error" sx={{ mb: 1 }}>
                    <AlertTitle>Critical Alert</AlertTitle>
                    {statusSummary.critical} sensors reporting critical
                    conditions
                  </Alert>
                )}

                {statusSummary.warning > 0 && (
                  <Alert severity="warning" sx={{ mb: 1 }}>
                    <AlertTitle>Warning</AlertTitle>
                    {statusSummary.warning} sensors reporting warnings
                  </Alert>
                )}

                {statusSummary.offline > 0 && (
                  <Alert severity="info" sx={{ mb: 1 }}>
                    <AlertTitle>Connectivity Issues</AlertTitle>
                    {statusSummary.offline} sensors are currently offline
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Time Series Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sensor Readings Over Time
              </Typography>

              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={timeSeriesData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="time"
                      label={{
                        value: "Time",
                        position: "insideBottomRight",
                        offset: -5,
                      }}
                    />
                    <YAxis
                      label={{
                        value: "Water Level (cm)",
                        angle: -90,
                        position: "insideLeft",
                      }}
                      domain={[0, "auto"]}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      label={{
                        value: "Rainfall (mm)",
                        angle: -90,
                        position: "insideRight",
                      }}
                      domain={[0, "auto"]}
                    />
                    <RechartsTooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="waterLevel"
                      fill={theme.palette.primary.light}
                      stroke={theme.palette.primary.main}
                      fillOpacity={0.3}
                      name="Water Level (cm)"
                    />
                    <Bar
                      dataKey="rainfall"
                      yAxisId="right"
                      fill={theme.palette.info.main}
                      name="Rainfall (mm)"
                    />
                    <Line
                      type="monotone"
                      dataKey="warning"
                      stroke={theme.palette.warning.main}
                      strokeDasharray="5 5"
                      name="Warning Level"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="critical"
                      stroke={theme.palette.error.main}
                      strokeDasharray="5 5"
                      name="Critical Level"
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ mb: 1 }}>
                  Chart shows water level and rainfall measurements with warning
                  thresholds.
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sensor Map */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sensor Location Map
              </Typography>

              <Box
                sx={{
                  height: 400,
                  position: "relative",
                  bgcolor: "background.default",
                  borderRadius: 1,
                }}
              >
                {/* This would be replaced with an actual map component */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Map visualization component would be integrated here with
                    sensor locations and statuses.
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    The map would show {filteredSensorData.length} sensors with
                    color coding for different statuses.
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sensor List */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Individual Sensor Details
              </Typography>

              <Grid container spacing={2}>
                {filteredSensorData.slice(0, 6).map((sensor, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        border: 1,
                        borderColor: "divider",
                        borderLeft: 4,
                        borderLeftColor: getStatusColor(sensor.status),
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle1">
                            {sensor.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {sensor.sensorId}
                          </Typography>
                        </Box>
                        <Chip
                          label={sensor.status}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(sensor.status),
                            color: "white",
                          }}
                        />
                      </Box>

                      <Divider sx={{ my: 1 }} />

                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Type
                          </Typography>
                          <Typography variant="body2">{sensor.type}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Location
                          </Typography>
                          <Typography variant="body2">
                            {sensor.location}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Reading
                          </Typography>
                          <Typography variant="body2">
                            {sensor.currentReading} {sensor.unit}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Battery
                          </Typography>
                          <Typography variant="body2">
                            {sensor.battery}%
                          </Typography>
                        </Grid>
                      </Grid>

                      {sensor.status === "critical" && (
                        <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                          Exceeds threshold by {sensor.threshold}%
                        </Alert>
                      )}

                      {sensor.status === "warning" && (
                        <Alert severity="warning" sx={{ mt: 1, py: 0 }}>
                          Near threshold ({sensor.threshold}%)
                        </Alert>
                      )}

                      <Box
                        sx={{
                          mt: 1,
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Updated:{" "}
                          {new Date(sensor.timestamp).toLocaleTimeString()}
                        </Typography>
                        <Button size="small">Details</Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {filteredSensorData.length > 6 && (
                <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                  <Button variant="outlined">
                    View All {filteredSensorData.length} Sensors
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SensorMonitoringComponent;
