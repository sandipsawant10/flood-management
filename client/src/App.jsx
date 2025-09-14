import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import HomePage from './pages/HomePage';
import ReportReviewPage from './pages/ReportReviewPage';
import PublicDashboardPage from './pages/PublicDashboardPage';
import ReportFormPage from './pages/ReportFormPage';

function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Flood Disaster Management
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/report">
            Submit Report
          </Button>
          <Button color="inherit" component={Link} to="/dashboard">
            Public Dashboard
          </Button>
          <Button color="inherit" component={Link} to="/admin/review">
            Admin Review
          </Button>
        </Toolbar>
      </AppBar>
      <Container>
        <Box mt={4}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/report" element={<ReportFormPage />} />
            <Route path="/dashboard" element={<PublicDashboardPage />} />
            <Route path="/admin/review" element={<ReportReviewPage />} />
          </Routes>
        </Box>
      </Container>
    </Router>
  );
}

export default App;
