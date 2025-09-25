import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  ButtonGroup,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import { analyticsService } from "../../services/analyticsService";
import FloodRiskPredictionComponent from "../../components/Analytics/FloodRiskPredictionComponent";
import ResourceOptimizationComponent from "../../components/Analytics/ResourceOptimizationComponent";

// Define tab panels for different analytics views
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
      style={{ paddingTop: "16px" }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `analytics-tab-${index}`,
    "aria-controls": `analytics-tabpanel-${index}`,
  };
}

const AdvancedAnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // We'll use analyticsData for various dashboard components
  const [analyticsData, setAnalyticsData] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [timeframe, setTimeframe] = useState("month");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [modelConfidence, setModelConfidence] = useState(null);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle timeframe change
  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
  };

  // Handle region change
  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
  };

  // Fetch data when parameters change
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await analyticsService.getAdvancedAnalytics(
          timeframe,
          selectedRegion
        );
        setAnalyticsData(data);

        // Get model confidence separately
        const confidence = await analyticsService.getModelConfidence();
        setModelConfidence(confidence);
      } catch (err) {
        console.error("Error fetching advanced analytics data:", err);
        setError(
          "Failed to load advanced analytics data. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeframe, selectedRegion]);

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
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Advanced Analytics Dashboard
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="timeframe-select-label">Timeframe</InputLabel>
              <Select
                labelId="timeframe-select-label"
                id="timeframe-select"
                value={timeframe}
                onChange={handleTimeframeChange}
                label="Timeframe"
              >
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="month">Month</MenuItem>
                <MenuItem value="quarter">Quarter</MenuItem>
                <MenuItem value="year">Year</MenuItem>
              </Select>
            </FormControl>

            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="region-select-label">Region</InputLabel>
              <Select
                labelId="region-select-label"
                id="region-select"
                value={selectedRegion}
                onChange={handleRegionChange}
                label="Region"
              >
                <MenuItem value="all">All Regions</MenuItem>
                <MenuItem value="North District">North District</MenuItem>
                <MenuItem value="South District">South District</MenuItem>
                <MenuItem value="East District">East District</MenuItem>
                <MenuItem value="West District">West District</MenuItem>
                <MenuItem value="Central District">Central District</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {modelConfidence && analyticsData && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  Analytics Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Region Status
                    </Typography>
                    <Typography variant="body1">
                      {selectedRegion === "all"
                        ? "All regions"
                        : selectedRegion}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {analyticsData.predictions &&
                      analyticsData.predictions.length > 0
                        ? `${analyticsData.predictions.length} areas analyzed`
                        : "No prediction data available"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Timeframe
                    </Typography>
                    <Typography variant="body1">
                      {timeframe === "week"
                        ? "Weekly Analysis"
                        : timeframe === "month"
                        ? "Monthly Analysis"
                        : timeframe === "quarter"
                        ? "Quarterly Analysis"
                        : "Yearly Analysis"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Last updated:{" "}
                      {new Date(analyticsData.timestamp).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {analyticsData.predictions && analyticsData.predictions[0] && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Current Risk Assessment
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Overall Risk
                        </Typography>
                        <Typography variant="h6">
                          {analyticsData.predictions[0].riskScore}%
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Alert Level
                        </Typography>
                        <Typography variant="h6">
                          {analyticsData.predictions[0].alertLevel}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Areas at Risk
                        </Typography>
                        <Typography variant="h6">
                          {analyticsData.predictions[0].areasAtRisk || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Resource Coverage
                        </Typography>
                        <Typography variant="h6">
                          {analyticsData.resources
                            ? `${analyticsData.resources.coveragePercent || 0}%`
                            : "N/A"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  Model Confidence
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Model Accuracy
                    </Typography>
                    <Typography variant="h6">
                      {modelConfidence.accuracy}%
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Prediction Confidence
                    </Typography>
                    <Typography variant="h6">
                      {modelConfidence.confidenceScore}%
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Data Freshness
                    </Typography>
                    <Typography variant="h6">
                      {modelConfidence.dataFreshness}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Next Update
                    </Typography>
                    <Typography variant="h6">
                      {modelConfidence.nextUpdateScheduled
                        ? new Date(
                            modelConfidence.nextUpdateScheduled
                          ).toLocaleString()
                        : "Auto"}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="analytics dashboard tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Flood Risk Prediction" {...a11yProps(0)} />
            <Tab label="Resource Optimization" {...a11yProps(1)} />
            <Tab label="Historical Analysis" {...a11yProps(2)} />
            <Tab label="Sensor Monitoring" {...a11yProps(3)} />
            <Tab label="Evacuation Planning" {...a11yProps(4)} />
          </Tabs>
        </Box>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <FloodRiskPredictionComponent
          region={
            selectedRegion === "all" ? "Central District" : selectedRegion
          }
          predictions={analyticsData?.predictions}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ResourceOptimizationComponent
          region={selectedRegion === "all" ? "North District" : selectedRegion}
          resourceData={analyticsData?.resources}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <HistoricalAnalysisPlaceholder />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <SensorMonitoringComponent
          region={selectedRegion}
          sensorData={analyticsData?.sensors}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <EvacuationPlanningPlaceholder />
      </TabPanel>
    </Container>
  );
};

import SensorMonitoringComponent from "../../components/Analytics/SensorMonitoringComponent";

// Placeholder components for other tabs that are still under development
const HistoricalAnalysisPlaceholder = () => (
  <Box sx={{ py: 4, textAlign: "center" }}>
    <Typography variant="h5" color="text.secondary">
      Historical Analysis
    </Typography>
    <Typography variant="body1" sx={{ mt: 2 }}>
      This feature is under development. Historical flood data analysis will be
      available soon.
    </Typography>
  </Box>
);

const EvacuationPlanningPlaceholder = () => (
  <Box sx={{ py: 4, textAlign: "center" }}>
    <Typography variant="h5" color="text.secondary">
      Evacuation Planning
    </Typography>
    <Typography variant="body1" sx={{ mt: 2 }}>
      Evacuation route planning and optimization will be available in the next
      update.
    </Typography>
  </Box>
);

export default AdvancedAnalyticsDashboard;
