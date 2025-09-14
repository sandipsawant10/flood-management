import React from 'react';
import { Box, Typography, Grid, Container } from '@mui/material';
import WeatherWidget from '../components/WeatherWidget';
import NewsWidget from '../components/NewsWidget';

const DashboardPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Public Flood Disaster Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <WeatherWidget />
        </Grid>
        <Grid item xs={12} md={6}>
          <NewsWidget />
        </Grid>
        {/* Add more widgets here */}
      </Grid>
    </Container>
  );
};

export default DashboardPage;