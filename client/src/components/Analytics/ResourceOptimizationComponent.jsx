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
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import WarningIcon from "@mui/icons-material/Warning";
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";
import PrintIcon from "@mui/icons-material/Print";
import { analyticsService } from "../../services/analyticsService";

const ResourceOptimizationComponent = ({ region }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [optimizationData, setOptimizationData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {
          region: region || "North District",
          riskThreshold: 50,
        };

        const data = await analyticsService.getOptimizedResourceAllocation(
          params
        );
        setOptimizationData(data);
      } catch (err) {
        console.error("Error fetching resource optimization data:", err);
        setError(
          "Failed to load resource optimization data. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [region]);

  // Helper function to format efficiency score
  const getEfficiencyColor = (score) => {
    if (score >= 80) return "#22c55e"; // Green
    if (score >= 60) return "#84cc16"; // Light green
    if (score >= 40) return "#facc15"; // Yellow
    if (score >= 20) return "#f97316"; // Orange
    return "#ef4444"; // Red
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

  if (!optimizationData) {
    return (
      <Alert severity="info">
        <AlertTitle>No Data</AlertTitle>
        No resource optimization data is available for this region.
      </Alert>
    );
  }

  const { optimization, resources, evacuationPlan } = optimizationData;

  // Prepare data for the resource allocation chart
  const resourceAllocationData = optimization.recommendedAllocation.map(
    (allocation) => {
      const resource = resources.resources.find(
        (r) => r.id === allocation.resourceId
      );
      return {
        name: resource ? resource.name : `Resource ${allocation.resourceId}`,
        quantity: allocation.quantity,
        estimatedArrival: allocation.estimatedArrivalTime,
        assignedTask: allocation.assignedTask,
      };
    }
  );

  // Prepare data for resource gap analysis
  const resourceGapData = optimization.optimization.resourceAllocation.map(
    (item) => ({
      name: item.type,
      optimal: item.optimal,
      current: item.current,
      gap: item.delta,
    })
  );

  // Prepare data for evacuation routes
  const evacuationRoutesData = optimization.optimization.evacuationRoutes.map(
    (route) => ({
      name: `${route.from} → ${route.to}`,
      capacity: route.capacityPerHour,
      time: route.estimatedTime.replace(" min", ""),
    })
  );

  // COLORS for the charts
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
  ];

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
          Resource Optimization for {optimization.regionId || region}
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Download as PDF">
            <IconButton>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share">
            <IconButton>
              <ShareIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print">
            <IconButton>
              <PrintIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Optimization Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Optimization Summary
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  my: 2,
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    display: "inline-flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <CircularProgress
                    variant="determinate"
                    value={optimization.optimization.efficiencyScore}
                    size={120}
                    thickness={5}
                    sx={{
                      color: getEfficiencyColor(
                        optimization.optimization.efficiencyScore
                      ),
                    }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: "absolute",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="h4"
                      component="div"
                      color="text.secondary"
                    >
                      {optimization.optimization.efficiencyScore}%
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Resource Allocation Efficiency Score
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2">Critical Information:</Typography>

              <List dense sx={{ mt: 1 }}>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: "36px" }}>
                    <WarningIcon color="warning" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Affected Population"
                    secondary={optimization.optimization.affectedPopulation.toLocaleString()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: "36px" }}>
                    <WarningIcon color="error" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Time Window"
                    secondary={optimization.optimization.timeWindow}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: "36px" }}>
                    <WarningIcon color="info" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Estimated Evacuation Time"
                    secondary={
                      optimization.optimization.estimatedEvacuationTime
                    }
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Critical Areas:
              </Typography>

              {optimization.optimization.criticalAreas.map((area, index) => (
                <Box key={index} sx={{ mb: 1.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2">{area.name}</Typography>
                    <Chip
                      label={area.priorityLevel}
                      size="small"
                      color={
                        area.priorityLevel === "Critical"
                          ? "error"
                          : area.priorityLevel === "High"
                          ? "warning"
                          : area.priorityLevel === "Medium"
                          ? "info"
                          : "success"
                      }
                    />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={
                        (area.population /
                          optimization.optimization.affectedPopulation) *
                        100
                      }
                      sx={{ flexGrow: 1 }}
                    />
                    <Typography variant="caption">
                      {area.population.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Resource Gap Analysis */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resource Gap Analysis
              </Typography>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={resourceGapData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                    barGap={0}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar
                      dataKey="optimal"
                      name="Optimal"
                      fill={theme.palette.success.main}
                    />
                    <Bar
                      dataKey="current"
                      name="Current"
                      fill={theme.palette.info.main}
                    />
                    <Bar
                      dataKey="gap"
                      name="Gap"
                      fill={theme.palette.error.main}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 1,
                  gap: 2,
                }}
              >
                <Button variant="contained" color="primary">
                  Request Resources
                </Button>
                <Button variant="outlined">View Detailed Analysis</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recommended Resource Allocation */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recommended Resource Allocation
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table sx={{ minWidth: 650 }} size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Resource</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Est. Arrival (min)</TableCell>
                      <TableCell>Task Assignment</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resourceAllocationData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          {row.name}
                        </TableCell>
                        <TableCell align="right">{row.quantity}</TableCell>
                        <TableCell align="right">
                          {row.estimatedArrival}
                        </TableCell>
                        <TableCell>{row.assignedTask}</TableCell>
                        <TableCell align="right">
                          <Button size="small" variant="outlined">
                            Assign
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Evacuation Routes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Evacuation Routes
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={evacuationRoutesData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar
                      dataKey="capacity"
                      name="Capacity (people/hr)"
                      fill={theme.palette.primary.main}
                    >
                      <LabelList dataKey="capacity" position="right" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                <Button variant="outlined">View on Map</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Resource Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resource Distribution by Type
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={resourceGapData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="optimal"
                    >
                      {resourceGapData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value, name, props) => [
                        `${value} units`,
                        props.payload.name,
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ mt: 1 }}>
                <Alert severity="info" sx={{ mt: 1 }}>
                  This distribution reflects the optimal resource allocation
                  based on current risk assessment.
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Evacuation Plan Summary */}
        {evacuationPlan && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Evacuation Plan Timeline
                </Typography>
                <Box sx={{ px: 2 }}>
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                      overflowX: "auto",
                      py: 3,
                    }}
                  >
                    {evacuationPlan.timeline.phases.map((phase, index) => (
                      <Box
                        key={index}
                        sx={{
                          minWidth: 180,
                          borderRadius: 1,
                          p: 2,
                          bgcolor: theme.palette.background.default,
                          border: 1,
                          borderColor: "divider",
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          Phase {index + 1}: {phase.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Duration: {phase.duration}
                        </Typography>
                        {index < evacuationPlan.timeline.phases.length - 1 && (
                          <Box
                            sx={{
                              position: "absolute",
                              right: -20,
                              top: "50%",
                              transform: "translateY(-50%)",
                            }}
                          >
                            →
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Evacuation Zones:
                    </Typography>
                    <List dense>
                      {evacuationPlan.evacuationZones.map((zone, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={zone.name}
                            secondary={`Population: ${zone.population.toLocaleString()} • Priority: ${
                              zone.priority
                            }`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Emergency Shelters:
                    </Typography>
                    <List dense>
                      {evacuationPlan.shelters.map((shelter, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={shelter.name}
                            secondary={`Capacity: ${shelter.capacity.toLocaleString()} • Facilities: ${shelter.facilities.join(
                              ", "
                            )}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                  }}
                >
                  <Button variant="contained" color="primary">
                    Activate Plan
                  </Button>
                  <Button variant="outlined">Modify Plan</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ResourceOptimizationComponent;
