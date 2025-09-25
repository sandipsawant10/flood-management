import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Chip,
  LinearProgress,
  Tooltip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import {
  CheckCircleOutlined as CheckIcon,
  ErrorOutlined as ErrorIcon,
  CloudOutlined as CloudIcon,
  NewspaperOutlined as NewsIcon,
  Instagram as InstagramIcon,
  QuestionMark as UnknownIcon,
  SvgIcon,
} from "@mui/icons-material";

// Custom Machine Learning icon
const AIIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M21,10.5h-1v-1c0-0.8-0.7-1.5-1.5-1.5h-1v-1c0-0.8-0.7-1.5-1.5-1.5h-6C9.2,5.5,8.5,6.2,8.5,7v1h-1 C6.7,8,6,8.7,6,9.5v1H5c-0.6,0-1,0.4-1,1v3c0,0.6,0.4,1,1,1h1v1c0,0.8,0.7,1.5,1.5,1.5h1v1c0,0.8,0.7,1.5,1.5,1.5h6 c0.8,0,1.5-0.7,1.5-1.5v-1h1c0.8,0,1.5-0.7,1.5-1.5v-1h1c0.6,0,1-0.4,1-1v-3C22,10.9,21.6,10.5,21,10.5z M15.5,14.5 c0,0.6-0.4,1-1,1h-3c-0.6,0-1-0.4-1-1v-3c0-0.6,0.4-1,1-1h3c0.6,0,1,0.4,1,1V14.5z" />
  </SvgIcon>
);

const VerificationSummary = ({ verificationData }) => {
  const theme = useTheme();

  if (!verificationData) {
    return (
      <Card>
        <CardContent>
          <Typography>No verification data available.</Typography>
        </CardContent>
      </Card>
    );
  }

  const { status, summary, confidence, weather, news, social } =
    verificationData;

  // Confidence as percentage
  const confidencePercent =
    typeof confidence === "number" ? Math.round(confidence * 100) : 0;

  // Helper to get color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
      case "matched":
        return "success";
      case "partially-verified":
      case "partially-matched":
        return "info";
      case "not-matched":
        return "error";
      case "manual-review":
      case "pending":
        return "warning";
      case "error":
        return "error";
      default:
        return "default";
    }
  };

  // Helper to get icon based on status
  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
      case "matched":
        return <CheckIcon color="success" />;
      case "not-matched":
        return <ErrorIcon color="error" />;
      case "error":
        return <ErrorIcon color="error" />;
      default:
        return <UnknownIcon />;
    }
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <AIIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            AI Verification Results
          </Typography>
          <Chip
            label={status ? status.replace(/-/g, " ").toUpperCase() : "PENDING"}
            color={getStatusColor(status)}
            size="small"
            icon={getStatusIcon(status)}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {summary || "Verification in progress..."}
        </Typography>

        {/* Confidence Score */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2">Confidence Score</Typography>
            <Typography variant="body2" fontWeight="bold">
              {confidencePercent}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={confidencePercent}
            sx={{
              mt: 1,
              height: 8,
              borderRadius: 1,
              bgcolor: theme.palette.grey[200],
              "& .MuiLinearProgress-bar": {
                bgcolor:
                  confidencePercent >= 80
                    ? theme.palette.success.main
                    : confidencePercent >= 50
                    ? theme.palette.warning.main
                    : theme.palette.error.main,
              },
            }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Data Sources */}
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Verification Sources
        </Typography>

        <Grid container spacing={2}>
          {/* Weather Verification */}
          <Grid item xs={12} md={4}>
            <Tooltip title={weather?.summary || "No weather data"}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <CloudIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                    <Typography variant="body2">Weather Data</Typography>
                  </Box>
                  <Chip
                    label={
                      weather?.status
                        ? weather.status.replace(/-/g, " ").toUpperCase()
                        : "N/A"
                    }
                    size="small"
                    color={getStatusColor(weather?.status)}
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Tooltip>
          </Grid>

          {/* News Verification */}
          <Grid item xs={12} md={4}>
            <Tooltip title={news?.summary || "No news data"}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <NewsIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                    <Typography variant="body2">News Articles</Typography>
                  </Box>
                  <Chip
                    label={
                      news?.status
                        ? news.status.replace(/-/g, " ").toUpperCase()
                        : "N/A"
                    }
                    size="small"
                    color={getStatusColor(news?.status)}
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Tooltip>
          </Grid>

          {/* Social Media Verification */}
          <Grid item xs={12} md={4}>
            <Tooltip title={social?.summary || "No social media data"}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <InstagramIcon
                      sx={{ mr: 1, color: theme.palette.info.main }}
                    />
                    <Typography variant="body2">Social Media</Typography>
                  </Box>
                  <Chip
                    label={
                      social?.status
                        ? social.status.replace(/-/g, " ").toUpperCase()
                        : "COMING SOON"
                    }
                    size="small"
                    color={getStatusColor(social?.status)}
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Tooltip>
          </Grid>
        </Grid>

        {/* Decision Factors */}
        {summary && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Key Verification Factors
            </Typography>
            <List dense>
              {weather && weather.status === "matched" && (
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      weather.summary || "Weather data confirms flooding"
                    }
                  />
                </ListItem>
              )}
              {weather && weather.status === "not-matched" && (
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <ErrorIcon color="error" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      weather.summary ||
                      "Weather data does not indicate flooding"
                    }
                  />
                </ListItem>
              )}
              {news && news.status === "matched" && (
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={news.summary || "News articles confirm flooding"}
                  />
                </ListItem>
              )}
              {news && news.status === "not-matched" && (
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <ErrorIcon color="error" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={news.summary || "No relevant news articles found"}
                  />
                </ListItem>
              )}
              {social && social.status === "matched" && (
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={social.summary || "Social media confirms flooding"}
                  />
                </ListItem>
              )}
            </List>
          </>
        )}
      </CardContent>
    </Card>
  );
};

VerificationSummary.propTypes = {
  verificationData: PropTypes.shape({
    status: PropTypes.string,
    summary: PropTypes.string,
    confidence: PropTypes.number,
    weather: PropTypes.shape({
      status: PropTypes.string,
      summary: PropTypes.string,
    }),
    news: PropTypes.shape({
      status: PropTypes.string,
      summary: PropTypes.string,
    }),
    social: PropTypes.shape({
      status: PropTypes.string,
      summary: PropTypes.string,
    }),
  }),
};

export default VerificationSummary;
