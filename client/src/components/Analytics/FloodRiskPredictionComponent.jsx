import React, { useState, useEffect } from "react";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  useTheme,
} from "@mui/material";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
} from "recharts";
import { analyticsService } from "../../services/analyticsService";

const FloodRiskPredictionComponent = ({ region, timeframe = "7d" }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [predictionData, setPredictionData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [selectedConfidence, setSelectedConfidence] = useState(95);
  const [selectedModelType, setSelectedModelType] = useState("ml");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Set up location object based on region prop
        const location = {
          district: region || "Central District",
        };

        // Set up filters
        const filters = {
          timeframe: selectedTimeframe,
          modelType: selectedModelType,
          confidenceInterval: selectedConfidence,
        };

        // Fetch prediction data
        const data = await analyticsService.getPredictions(location, filters);
        setPredictionData(data);
      } catch (err) {
        console.error("Error fetching prediction data:", err);
        setError("Failed to load prediction data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [region, selectedTimeframe, selectedConfidence, selectedModelType]);

  const handleTimeframeChange = (event) => {
    setSelectedTimeframe(event.target.value);
  };

  const handleConfidenceChange = (event) => {
    setSelectedConfidence(event.target.value);
  };

  const handleModelTypeChange = (event) => {
    setSelectedModelType(event.target.value);
  };

  // Function to render the risk level with appropriate color
  const renderRiskLevel = (riskLevel, probability) => {
    let color;
    if (probability >= 75) color = "#ef4444"; // Red for high risk
    else if (probability >= 50)
      color = "#f97316"; // Orange for medium-high risk
    else if (probability >= 30) color = "#facc15"; // Yellow for medium risk
    else if (probability >= 15)
      color = "#84cc16"; // Light green for low-medium risk
    else color = "#22c55e"; // Green for low risk

    return (
      <Chip
        label={`${riskLevel} (${probability}%)`}
        sx={{
          bgcolor: color,
          color: probability >= 30 ? "white" : "black",
          fontWeight: "bold",
          padding: "4px 0",
        }}
      />
    );
  };

  if (loading) {
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

  if (error) {
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        {error}
      </Alert>
    );
  }

  if (!predictionData) {
    return (
      <Alert severity="info">
        <AlertTitle>No Data</AlertTitle>
        No prediction data is available for this region.
      </Alert>
    );
  }

  const { prediction, timeSeries, heatmap, modelInfo } = predictionData;

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
          Flood Risk Prediction for {prediction.region}
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={selectedTimeframe}
              label="Timeframe"
              onChange={handleTimeframeChange}
            >
              <MenuItem value="7d">7 Days</MenuItem>
              <MenuItem value="14d">14 Days</MenuItem>
              <MenuItem value="30d">30 Days</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Confidence</InputLabel>
            <Select
              value={selectedConfidence}
              label="Confidence"
              onChange={handleConfidenceChange}
            >
              <MenuItem value={80}>80%</MenuItem>
              <MenuItem value={90}>90%</MenuItem>
              <MenuItem value={95}>95%</MenuItem>
              <MenuItem value={99}>99%</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Model</InputLabel>
            <Select
              value={selectedModelType}
              label="Model"
              onChange={handleModelTypeChange}
            >
              <MenuItem value="ml">Machine Learning</MenuItem>
              <MenuItem value="statistical">Statistical</MenuItem>
              <MenuItem value="hybrid">Hybrid</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Current Risk Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Risk Overview
              </Typography>
              <Box sx={{ my: 3, display: "flex", justifyContent: "center" }}>
                {renderRiskLevel(prediction.riskLevel, prediction.probability)}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Confidence Interval: {prediction.confidenceInterval}%
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Rainfall
                  </Typography>
                  <Typography variant="body1">
                    {prediction.weatherData.rainfall} mm
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    River Level
                  </Typography>
                  <Typography variant="body1">
                    {prediction.weatherData.riverLevel} m
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Soil Moisture
                  </Typography>
                  <Typography variant="body1">
                    {prediction.weatherData.soilMoisture}%
                  </Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Contributing Factors
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                {prediction.factors.map((factor, index) => (
                  <Chip
                    key={index}
                    label={factor}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Recommended Actions
              </Typography>
              <Box sx={{ mt: 1 }}>
                {prediction.recommendedActions.map((action, index) => (
                  <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                    • {action}
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Forecast Timeline */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Forecast Timeline
              </Typography>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={prediction.timeline.forecasts}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timeframe" />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      domain={[0, 100]}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, "dataMax + 2"]}
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="probability"
                      stroke={theme.palette.primary.main}
                      activeDot={{ r: 8 }}
                      name="Flood Probability (%)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="waterLevel"
                      stroke={theme.palette.secondary.main}
                      name="Water Level (m)"
                    />
                    <ReferenceLine
                      y={50}
                      yAxisId="left"
                      label="Warning Level"
                      stroke="#f97316"
                      strokeDasharray="3 3"
                    />
                    <ReferenceLine
                      y={75}
                      yAxisId="left"
                      label="Critical Level"
                      stroke="#ef4444"
                      strokeDasharray="3 3"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Time Series Forecast */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {selectedTimeframe} Forecast Trend
              </Typography>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={timeSeries.forecast}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      domain={[0, 100]}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, "dataMax + 20"]}
                    />
                    <Tooltip />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="probability"
                      stackId="1"
                      stroke={theme.palette.primary.main}
                      fill={theme.palette.primary.light}
                      name="Flood Probability (%)"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="rainfall"
                      stackId="2"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.3}
                      name="Rainfall (mm)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                <Button
                  variant="outlined"
                  onClick={() => console.log("Download forecast data")}
                >
                  Download Forecast Data
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Heatmap Visualization */}
        {heatmap && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Risk Distribution
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Spatial distribution of flood risk intensity across{" "}
                  {prediction.region}
                </Typography>
                <Box sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 20,
                      }}
                    >
                      <CartesianGrid />
                      <XAxis
                        type="number"
                        dataKey="lng"
                        name="Longitude"
                        domain={["dataMin - 0.01", "dataMax + 0.01"]}
                        label={{ value: "Longitude", position: "bottom" }}
                      />
                      <YAxis
                        type="number"
                        dataKey="lat"
                        name="Latitude"
                        domain={["dataMin - 0.01", "dataMax + 0.01"]}
                        label={{
                          value: "Latitude",
                          angle: -90,
                          position: "left",
                        }}
                      />
                      <ZAxis
                        type="number"
                        dataKey="intensity"
                        range={[50, 400]}
                        name="Risk Intensity"
                      />
                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        formatter={(value, name, props) => {
                          if (name === "Risk Intensity") {
                            return [`${Math.round(value * 100)}%`, name];
                          }
                          return [value, name];
                        }}
                      />
                      <Scatter
                        name="Risk Points"
                        data={heatmap.points}
                        fill="#8884d8"
                        shape="circle"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  align="center"
                  display="block"
                  sx={{ mt: 1 }}
                >
                  Data valid until:{" "}
                  {new Date(heatmap.metadata.validUntil).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Model Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Model Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Model Type
                  </Typography>
                  <Typography variant="body1">
                    {modelInfo.type === "ml"
                      ? "Machine Learning"
                      : modelInfo.type === "statistical"
                      ? "Statistical"
                      : "Hybrid"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Confidence Interval
                  </Typography>
                  <Typography variant="body1">
                    {modelInfo.confidenceInterval}%
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1">
                    {new Date(modelInfo.lastUpdated).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FloodRiskPredictionComponent;
