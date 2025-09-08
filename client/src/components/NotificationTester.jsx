import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Email as EmailIcon, Sms as SmsIcon, Notifications as NotificationsIcon } from '@mui/icons-material';

const NotificationTester = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const [notificationData, setNotificationData] = useState({
    channels: {
      email: true,
      sms: false,
      inApp: true,
    },
    title: 'Test Notification',
    message: 'This is a test notification from the Flood Disaster Management System.',
    type: 'info',
  });

  const handleChannelChange = (channel) => {
    setNotificationData({
      ...notificationData,
      channels: {
        ...notificationData.channels,
        [channel]: !notificationData.channels[channel],
      },
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNotificationData({
      ...notificationData,
      [name]: value,
    });
  };

  const sendTestNotification = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await axios.post('/api/notification-test/test', {
        userId: currentUser._id,
        ...notificationData,
      });
      
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader 
        title="Notification System Tester" 
        subheader="Test notification delivery across different channels"
      />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Notification Channels
            </Typography>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={notificationData.channels.email}
                    onChange={() => handleChannelChange('email')}
                    icon={<EmailIcon />}
                    checkedIcon={<EmailIcon color="primary" />}
                  />
                }
                label="Email"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={notificationData.channels.sms}
                    onChange={() => handleChannelChange('sms')}
                    icon={<SmsIcon />}
                    checkedIcon={<SmsIcon color="primary" />}
                  />
                }
                label="SMS"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={notificationData.channels.inApp}
                    onChange={() => handleChannelChange('inApp')}
                    icon={<NotificationsIcon />}
                    checkedIcon={<NotificationsIcon color="primary" />}
                  />
                }
                label="In-App"
              />
            </FormGroup>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Notification Title"
              name="title"
              value={notificationData.title}
              onChange={handleInputChange}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <Typography variant="body2" gutterBottom>
                Notification Type
              </Typography>
              <Select
                name="type"
                value={notificationData.type}
                onChange={handleInputChange}
              >
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="alert">Alert</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notification Message"
              name="message"
              value={notificationData.message}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={4}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={sendTestNotification}
              disabled={loading || (!notificationData.channels.email && !notificationData.channels.sms && !notificationData.channels.inApp)}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? 'Sending...' : 'Send Test Notification'}
            </Button>
          </Grid>
          
          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
          
          {result && (
            <Grid item xs={12}>
              <Alert severity="success">
                <Typography variant="subtitle2">Test Results:</Typography>
                <pre style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              </Alert>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default NotificationTester;