import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography, Box, Divider, Link } from '@mui/material';
import CloudIcon from '@mui/icons-material/Cloud';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import InstagramIcon from '@mui/icons-material/Instagram';

const VerificationPanel = ({ verificationData }) => {
  if (!verificationData) {
    return <Typography>No verification data available.</Typography>;
  }

  const { weather, news, social } = verificationData;

  const getWeatherSummary = () => {
    if (!weather || weather.status === 'not-available' || !weather.snapshot) {
      return 'Weather data not available.';
    }
    const data = weather.snapshot.current || weather.snapshot.daily?.[0];
    if (data) {
      return `Temp: ${data.temp?.day || data.temp}°C, Feels like: ${data.feels_like?.day || data.feels_like}°C, Conditions: ${data.weather?.[0]?.description || 'N/A'}`;
    }
    return weather.summary || 'Weather data available, but no detailed snapshot.';
  };

  return (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Verification Details</Typography>
        <Divider sx={{ mb: 2 }} />

        {/* Weather Verification */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CloudIcon color={weather?.status === 'verified' ? 'success' : weather?.status === 'not-matched' ? 'error' : 'action'} sx={{ mr: 1 }} />
          <Typography variant="subtitle1" component="span">Weather Verification:</Typography>
          <Typography variant="body2" component="span" ml={1} color={weather?.status === 'verified' ? 'success.main' : weather?.status === 'not-matched' ? 'error.main' : 'text.secondary'}>
            {weather?.status ? `${weather.status.replace(/-/g, ' ').toUpperCase()}` : 'N/A'}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ pl: 4, mb: 2 }}>
          {getWeatherSummary()}
        </Typography>

        {/* News Verification */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <NewspaperIcon color={news?.status === 'verified' ? 'success' : news?.status === 'not-matched' ? 'error' : 'action'} sx={{ mr: 1 }} />
          <Typography variant="subtitle1" component="span">News Verification:</Typography>
          <Typography variant="body2" component="span" ml={1} color={news?.status === 'verified' ? 'success.main' : news?.status === 'not-matched' ? 'error.main' : 'text.secondary'}>
            {news?.status ? `${news.status.replace(/-/g, ' ').toUpperCase()}` : 'N/A'}
          </Typography>
        </Box>
        {news?.snapshot?.articles && news.snapshot.articles.length > 0 ? (
          news.snapshot.articles.slice(0, 3).map((article, index) => (
            <Box key={index} sx={{ pl: 4, mb: 1 }}>
              <Link href={article.url} target="_blank" rel="noopener" variant="body2">
                {article.title}
              </Link>
              <Typography variant="caption" display="block" color="text.secondary">
                {new Date(article.publishedAt).toLocaleDateString()} - {article.source.name}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ pl: 4, mb: 2 }}>
            {news?.summary || 'No relevant news found.'}
          </Typography>
        )}

        {/* Social Media Verification */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <InstagramIcon color={social?.status === 'verified' ? 'success' : social?.status === 'not-matched' ? 'error' : 'action'} sx={{ mr: 1 }} />
          <Typography variant="subtitle1" component="span">Social Verification:</Typography>
          <Typography variant="body2" component="span" ml={1} color={social?.status === 'verified' ? 'success.main' : social?.status === 'not-matched' ? 'error.main' : 'text.secondary'}>
            {social?.status ? `${social.status.replace(/-/g, ' ').toUpperCase()}` : 'COMING SOON'}
          </Typography>
        </Box>
        {social?.status === 'verified' && social.snapshot?.posts && social.snapshot.posts.length > 0 ? (
          social.snapshot.posts.slice(0, 3).map((post, index) => (
            <Box key={index} sx={{ pl: 4, mb: 1 }}>
              <Link href={post.permalink} target="_blank" rel="noopener" variant="body2">
                Instagram Post by {post.username}
              </Link>
              <Typography variant="caption" display="block" color="text.secondary">
                {new Date(post.timestamp).toLocaleDateString()} - {post.caption.substring(0, 50)}...
              </Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ pl: 4, mb: 2 }}>
            {social?.summary || 'Social media verification coming soon.'}
          </Typography>
        )}

      </CardContent>
    </Card>
  );
};

VerificationPanel.propTypes = {
  verificationData: PropTypes.shape({
    status: PropTypes.string,
    summary: PropTypes.string,
    weather: PropTypes.shape({
      status: PropTypes.string,
      summary: PropTypes.string,
      snapshot: PropTypes.object,
    }),
    news: PropTypes.shape({
      status: PropTypes.string,
      summary: PropTypes.string,
      snapshot: PropTypes.object,
    }),
    social: PropTypes.shape({
      status: PropTypes.string,
      summary: PropTypes.string,
      snapshot: PropTypes.object,
    }),
  }),
};

export default VerificationPanel;