import React from "react";
import {
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import AlertsMap from "../components/Maps/AlertsMap";

const HomePage = () => {
  return (
    <Container>
      <Box sx={{ my: 4, textAlign: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to the Flood Disaster Management System
        </Typography>
        <Typography variant="h6" component="p" color="text.secondary">
          Your platform for reporting and monitoring flood-related incidents.
        </Typography>
      </Box>

      {/* Public Alerts Map */}
      <Box sx={{ my: 4 }}>
        <Card raised>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Current Flood Alerts
            </Typography>
            <Box sx={{ height: 400, width: "100%", mb: 2 }}>
              <AlertsMap height={400} showControls={true} publicView={true} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              This map shows current flood alerts in your area. Enable location
              services to see alerts near you.
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={4}>
          <Card raised>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Report a Flood
              </Typography>
              <Typography variant="body1" color="text.secondary">
                If you are experiencing or witnessing a flood, please submit a
                detailed report to help us coordinate emergency responses.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card raised>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Public Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                View real-time weather information and the latest news headlines
                related to floods and disasters in your area.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card raised>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Admin Review Portal
              </Typography>
              <Typography variant="body1" color="text.secondary">
                For municipal authorities and administrators to review and
                verify submitted flood reports.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;
