import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import NotificationTester from '../components/NotificationTester';
import PageHeader from '../components/common/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const NotificationTestPage = () => {
  const { user } = useAuth();
  
  // Only allow authenticated users to access this page
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <Container maxWidth="lg">
      <PageHeader 
        title="Notification System Test" 
        subtitle="Test and verify the notification system functionality"
      />
      
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="body1" paragraph>
          This page allows you to test the notification system across different channels (email, SMS, and in-app).
          Select the channels you want to test and customize the notification content before sending.
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <NotificationTester />
        </Box>
      </Paper>
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Notification System Overview
        </Typography>
        
        <Typography variant="body1" paragraph>
          The Flood Disaster Management System uses a multi-channel notification system to ensure
          that users receive critical information through their preferred communication channels.
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Available Notification Channels:
          </Typography>
          
          <ul>
            <li>
              <Typography variant="body1">
                <strong>Email Notifications:</strong> Detailed notifications with rich HTML content
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                <strong>SMS Notifications:</strong> Brief, text-based alerts for urgent information
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                <strong>In-App Notifications:</strong> Real-time notifications within the application interface
              </Typography>
            </li>
          </ul>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Notification Types:
          </Typography>
          
          <ul>
            <li>
              <Typography variant="body1">
                <strong>Info:</strong> General information and updates
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                <strong>Success:</strong> Confirmation of successful actions or positive updates
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                <strong>Alert:</strong> Urgent notifications about flood alerts, emergencies, or critical situations
              </Typography>
            </li>
          </ul>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotificationTestPage;