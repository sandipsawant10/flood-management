import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, CircularProgress, Alert } from '@mui/material';
import ReportDetails from '../components/Reports/ReportDetails';
import * as reportService from '../services/reportService';

const ReportReviewPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await reportService.getAllReports();
        setReports(data);
      } catch (err) {
        setError('Failed to fetch reports: ' + err.message);
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleMarkReviewed = async (reportId) => {
    try {
      // This would typically be an API call to update the report status
      // For now, we'll just update the local state
      await reportService.updateReportStatus(reportId, 'reviewed');
      setReports(reports.map(report => report._id === reportId ? { ...report, status: 'reviewed' } : report));
    } catch (err) {
      setError('Failed to mark report as reviewed: ' + err.message);
      console.error('Error marking report as reviewed:', err);
    }
  };

  const handleMarkNeedsManualReview = async (reportId) => {
    try {
      // This would typically be an API call to update the report status
      // For now, we'll just update the local state
      await reportService.updateReportStatus(reportId, 'needs_manual_review');
      setReports(reports.map(report => report._id === reportId ? { ...report, status: 'needs_manual_review' } : report));
    } catch (err) {
      setError('Failed to mark report as needing manual review: ' + err.message);
      console.error('Error marking report as needing manual review:', err);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>Loading reports...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (reports.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2">No flood reports to review.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Flood Report Review
      </Typography>
      <Box mt={3}>
        {reports.map((report) => (
          <ReportDetails
            key={report._id}
            report={report}
            onMarkReviewed={handleMarkReviewed}
            onMarkNeedsManualReview={handleMarkNeedsManualReview}
          />
        ))}
      </Box>
    </Container>
  );
};

export default ReportReviewPage;