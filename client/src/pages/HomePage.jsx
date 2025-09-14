import React from 'react';
import { Typography, Container, Box, Card, CardContent, Grid } from '@mui/material';

const HomePage = () => {
  return (
    <Container>
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to the Flood Disaster Management System
        </Typography>
        <Typography variant="h6" component="p" color="text.secondary">
          Your platform for reporting and monitoring flood-related incidents.
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={6}>
          <Card raised>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Report a Flood
              </Typography>
              <Typography variant="body1" color="text.secondary">
                If you are experiencing or witnessing a flood, please submit a detailed report to help us coordinate emergency responses.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card raised>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Public Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                View real-time weather information and the latest news headlines related to floods and disasters in your area.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card raised>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Admin Review Portal
              </Typography>
              <Typography variant="body1" color="text.secondary">
                For municipal authorities and administrators to review and verify submitted flood reports.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;