import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography, Box, Chip, Divider, List, ListItem, ListItemText, Grid, CardMedia, Button } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import { styled } from '@mui/system';
import VerificationPanel from '../Verification/VerificationPanel';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));

const DetailItem = ({ icon, label, value }) => (
  <Box display="flex" alignItems="center" mb={1}>
    {icon && React.cloneElement(icon, { sx: { mr: 1, color: 'text.secondary' } })}
    <Typography variant="subtitle2" component="span" sx={{ fontWeight: 'bold', mr: 0.5 }}>
      {label}:
    </Typography>
    <Typography variant="body2" component="span">
      {value}
    </Typography>
  </Box>
);

DetailItem.propTypes = {
  icon: PropTypes.element,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node]).isRequired,
};

const ReportDetails = ({ report, onMarkReviewed, onMarkNeedsManualReview }) => {
  if (!report) {
    return <Typography>No report data available.</Typography>;
  }

  const { _id, location, waterLevel, severity, urgencyLevel, description, media, reportedBy, createdAt, verification, status } = report;

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'moderate': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getVerificationStatusColor = (verificationStatus) => {
    switch (verificationStatus?.toLowerCase()) {
      case 'verified': return 'success';
      case 'not-matched': return 'error';
      case 'pending': return 'warning';
      default: return 'info';
    }
  };

  return (
    <StyledCard>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Box mb={2}>
              <Typography variant="h5" component="h2" gutterBottom>
                Flood Report #{_id.substring(0, 8)}
              </Typography>
              <Chip
                label={status.toUpperCase()}
                color={status === 'reviewed' ? 'success' : 'info'}
                size="small"
                sx={{ mr: 1 }}
              />
              {verification && (
                <Chip
                  label={`Verification: ${verification.status.replace(/-/g, ' ').toUpperCase()}`}
                  color={getVerificationStatusColor(verification.status)}
                  size="small"
                />
              )}
              <Divider sx={{ my: 2 }} />
            </Box>

            <DetailItem icon={<LocationOnIcon />} label="Location" value={location?.name || 'N/A'} />
            <DetailItem icon={<WarningIcon />} label="Severity" value={<Chip label={severity} color={getSeverityColor(severity)} size="small" />} />
            <DetailItem label="Urgency Level" value={urgencyLevel} />
            <DetailItem label="Water Level" value={`${waterLevel} feet`} />
            <DetailItem icon={<AccessTimeIcon />} label="Reported At" value={new Date(createdAt).toLocaleString()} />

            <Box mt={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Description:</Typography>
              <Typography variant="body2" color="text.secondary">{description}</Typography>
            </Box>

            {reportedBy && (
              <Box mt={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Reported By:</Typography>
                <DetailItem icon={<PersonIcon />} label="Name" value={reportedBy.name || 'Anonymous'} />
                <DetailItem label="Email" value={reportedBy.email || 'N/A'} />
                <DetailItem label="Phone" value={reportedBy.phone || 'N/A'} />
                <DetailItem label="Trust Score" value={reportedBy.trustScore !== undefined ? reportedBy.trustScore : 'N/A'} />
              </Box>
            )}

            {media && media.length > 0 && (
              <Box mt={3}>
                <Typography variant="h6" gutterBottom>Attached Media</Typography>
                <Grid container spacing={2}>
                  {media.map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <CardMedia
                        component="img"
                        image={item.url}
                        alt={`Media ${index + 1}`}
                        sx={{
                          height: 150,
                          objectFit: 'cover',
                          borderRadius: theme => theme.shape.borderRadius,
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            <Box mt={4} display="flex" gap={2}>
              {onMarkReviewed && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => onMarkReviewed(report._id)}
                  disabled={status === 'reviewed'}
                >
                  Mark as Reviewed
                </Button>
              )}
              {onMarkNeedsManualReview && (
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<WarningIcon />}
                  onClick={() => onMarkNeedsManualReview(report._id)}
                  disabled={status === 'needs_manual_review'}
                >
                  Needs Manual Review
                </Button>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            {verification && <VerificationPanel verificationData={verification} />}
          </Grid>
        </Grid>
      </CardContent>
    </StyledCard>
  );
};

ReportDetails.propTypes = {
  report: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    location: PropTypes.shape({
      name: PropTypes.string,
      latitude: PropTypes.number,
      longitude: PropTypes.number,
    }),
    waterLevel: PropTypes.number,
    severity: PropTypes.string,
    urgencyLevel: PropTypes.number,
    description: PropTypes.string,
    media: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string,
      type: PropTypes.string,
    })),
    reportedBy: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      email: PropTypes.string,
      phone: PropTypes.string,
      trustScore: PropTypes.number,
    }),
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string,
    verification: PropTypes.object, // Shape defined in VerificationPanel
    status: PropTypes.string,
  }),
  onMarkReviewed: PropTypes.func,
  onMarkNeedsManualReview: PropTypes.func,
};

export default ReportDetails;