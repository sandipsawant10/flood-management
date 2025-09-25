import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Stack,
  Alert,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PlayArrow as RunIcon,
  Refresh as RefreshIcon,
  AutoAwesome as AutoAwesomeIcon,
  Info as InfoIcon,
  PriorityHigh as PriorityHighIcon,
  VisibilityOutlined as ViewIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import verificationService from "../../services/verificationService";
import floodReportService from "../../services/floodReportService";
import VerificationPanel from "../../components/Verification/VerificationPanel";

const AIVerificationDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [runningVerification, setRunningVerification] = useState(false);
  const [bulkVerificationResults, setBulkVerificationResults] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  // Load dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load statistics
      const stats = await verificationService.getVerificationStatistics();
      setStatistics(stats);

      // Load pending reports that need verification
      const reportsData = await floodReportService.getAdminFloodReports({
        status: "pending",
        limit: 10,
      });

      setReports(reportsData.reports || []);
    } catch (err) {
      setError(
        "Failed to load verification dashboard: " +
          (err.message || "Unknown error")
      );
      console.error("Dashboard loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle running AI verification on a single report
  const handleRunVerification = async (reportId) => {
    try {
      setRunningVerification(true);
      const result = await verificationService.verifyReport(reportId);

      // Update the report in the list with verification results
      setReports((prevReports) =>
        prevReports.map((report) =>
          report._id === reportId
            ? {
                ...report,
                verification: result.details,
                aiConfidence: result.confidence,
              }
            : report
        )
      );

      // Show success message
      alert(`Verification completed with status: ${result.status}`);
    } catch (err) {
      setError("Verification failed: " + (err.message || "Unknown error"));
    } finally {
      setRunningVerification(false);
    }
  };

  // Handle bulk verification
  const handleBulkVerification = async () => {
    try {
      setRunningVerification(true);
      setBulkVerificationResults(null);

      const result = await verificationService.bulkVerifyReports(20);
      setBulkVerificationResults(result.results);

      // Refresh data after bulk operation
      await fetchDashboardData();
    } catch (err) {
      setError("Bulk verification failed: " + (err.message || "Unknown error"));
    } finally {
      setRunningVerification(false);
    }
  };

  // Handle viewing report details
  const handleViewReport = (report) => {
    setSelectedReport(report);
    setDetailOpen(true);
  };

  // Handle navigating to moderation page
  const handleGoToModeration = () => {
    navigate("/admin/report-moderation");
  };

  const getStatusColor = (status) => {
    const statusColors = {
      verified: "success",
      "partially-verified": "info",
      "not-matched": "error",
      "manual-review": "warning",
      pending: "default",
    };
    return statusColors[status] || "default";
  };

  if (loading && !statistics) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ display: "flex", alignItems: "center" }}
      >
        <AutoAwesomeIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        AI Report Verification Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {bulkVerificationResults && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Bulk verification completed: {bulkVerificationResults.processed}{" "}
          reports processed ({bulkVerificationResults.verified} verified,{" "}
          {bulkVerificationResults.disputed} disputed,{" "}
          {bulkVerificationResults.failed} failed)
        </Alert>
      )}

      {/* Stats Cards */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Reports
                </Typography>
                <Typography variant="h4">{statistics.totalReports}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending Verification
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ color: theme.palette.warning.main }}
                >
                  {statistics.statusCounts.pending}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  AI-Verified Reports
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ color: theme.palette.success.main }}
                >
                  {statistics.aiVerification.aiVerified}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Needs Manual Review
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ color: theme.palette.error.main }}
                >
                  {statistics.aiVerification.manualReview}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleBulkVerification}
          disabled={runningVerification || reports.length === 0}
          startIcon={
            runningVerification ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <AutoAwesomeIcon />
            )
          }
        >
          Run Bulk AI Verification
        </Button>

        <Button
          variant="outlined"
          onClick={fetchDashboardData}
          startIcon={<RefreshIcon />}
          disabled={runningVerification}
        >
          Refresh Data
        </Button>

        <Button
          variant="outlined"
          onClick={handleGoToModeration}
          color="secondary"
        >
          Go to Report Moderation
        </Button>
      </Stack>

      {/* Reports Table */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Pending Reports
      </Typography>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Location</TableCell>
              <TableCell>Reporter</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Verification Status</TableCell>
              <TableCell>AI Confidence</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.length > 0 ? (
              reports.map((report) => (
                <TableRow key={report._id} hover>
                  <TableCell>{`${report.location.district}, ${report.location.state}`}</TableCell>
                  <TableCell>
                    {report.reportedBy?.name || "Anonymous"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={report.severity.toUpperCase()}
                      size="small"
                      color={
                        report.severity === "critical"
                          ? "error"
                          : report.severity === "high"
                          ? "warning"
                          : report.severity === "medium"
                          ? "info"
                          : "default"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        report.verification?.status
                          ? report.verification.status
                              .replace(/-/g, " ")
                              .toUpperCase()
                          : "PENDING"
                      }
                      size="small"
                      color={getStatusColor(
                        report.verification?.status || "pending"
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    {report.aiConfidence !== undefined
                      ? `${Math.round(report.aiConfidence * 100)}%`
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        color="primary"
                        onClick={() => handleRunVerification(report._id)}
                        disabled={runningVerification}
                        size="small"
                        title="Run AI Verification"
                      >
                        <RunIcon />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => handleViewReport(report)}
                        size="small"
                        title="View Details"
                      >
                        <ViewIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No pending reports found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Report Detail Dialog */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Report Details</DialogTitle>
        <DialogContent dividers>
          {selectedReport && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {selectedReport.location.address ||
                    `${selectedReport.location.district}, ${selectedReport.location.state}`}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Reporter:</Typography>
                    <Typography variant="body2" gutterBottom>
                      {selectedReport.reportedBy?.name || "Anonymous"}
                    </Typography>

                    <Typography variant="subtitle2">Reported On:</Typography>
                    <Typography variant="body2" gutterBottom>
                      {new Date(selectedReport.createdAt).toLocaleString()}
                    </Typography>

                    <Typography variant="subtitle2">Severity:</Typography>
                    <Chip
                      label={selectedReport.severity.toUpperCase()}
                      size="small"
                      color={
                        selectedReport.severity === "critical"
                          ? "error"
                          : selectedReport.severity === "high"
                          ? "warning"
                          : selectedReport.severity === "medium"
                          ? "info"
                          : "default"
                      }
                      sx={{ my: 1 }}
                    />

                    <Typography variant="subtitle2">Water Level:</Typography>
                    <Typography variant="body2" gutterBottom>
                      {selectedReport.waterLevel} ({selectedReport.depth || 0}{" "}
                      m)
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Description:</Typography>
                    <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
                      {selectedReport.description}
                    </Typography>

                    {selectedReport.mediaFiles &&
                      selectedReport.mediaFiles.length > 0 && (
                        <>
                          <Typography variant="subtitle2">Media:</Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 1,
                              mt: 1,
                              mb: 2,
                            }}
                          >
                            {selectedReport.mediaFiles.map((media, index) => (
                              <Box
                                key={index}
                                component="img"
                                src={media}
                                alt="Report media"
                                sx={{
                                  width: 100,
                                  height: 100,
                                  objectFit: "cover",
                                  borderRadius: 1,
                                }}
                              />
                            ))}
                          </Box>
                        </>
                      )}
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {selectedReport.verification ? (
                  <VerificationPanel
                    verificationData={selectedReport.verification}
                  />
                ) : (
                  <Alert severity="info">
                    This report has not been verified by AI yet.
                  </Alert>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {selectedReport && (
            <Button
              onClick={() => handleRunVerification(selectedReport._id)}
              color="primary"
              variant="contained"
              disabled={runningVerification}
              startIcon={
                runningVerification ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <AutoAwesomeIcon />
                )
              }
            >
              Run AI Verification
            </Button>
          )}
          <Button onClick={() => setDetailOpen(false)} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIVerificationDashboard;
