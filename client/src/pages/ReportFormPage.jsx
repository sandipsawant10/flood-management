import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box, Card, CardContent, CircularProgress, Alert } from '@mui/material';

const ReportFormPage = () => {
  const [formData, setFormData] = useState({
    location: '',
    latitude: '',
    longitude: '',
    description: '',
    image: null, // For future image upload
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // This is a placeholder for the actual API call
      // In a real application, you would send formData to your backend
      console.log('Submitting Report:', formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setMessage('Report submitted successfully! It will be verified shortly.');
      setFormData({
        location: '',
        latitude: '',
        longitude: '',
        description: '',
        image: null,
      });
    } catch (err) {
      setError('Failed to submit report. Please try again.');
      console.error('Report submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Submit a Flood Report
        </Typography>
        <Card raised>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                margin="normal"
                label="Location (e.g., City, Street Name)"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                margin="normal"
                label="Latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                type="number"
                inputProps={{ step: 'any' }}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                type="number"
                inputProps={{ step: 'any' }}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Description of the Incident"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
              />
              {/* Future: Add file input for image uploads */}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Report'}
              </Button>

              {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ReportFormPage;