import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, CircularProgress, Box, TextField, Button } from '@mui/material';
import { fetchWeather } from '../services/weatherService';

const WeatherWidget = () => {
  const [city, setCity] = useState('London');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(city);
      setWeatherData(data);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWeather();
  }, []);

  const handleCityChange = (event) => {
    setCity(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    getWeather();
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Weather Information
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="City"
            variant="outlined"
            size="small"
            value={city}
            onChange={handleCityChange}
            fullWidth
          />
          <Button type="submit" variant="contained">
            Get Weather
          </Button>
        </Box>

        {loading && <Box display="flex" justifyContent="center"><CircularProgress /></Box>}
        {error && <Typography color="error">{error}</Typography>}
        {weatherData && (
          <Box>
            <Typography variant="h5">{weatherData.name}</Typography>
            <Typography variant="body1">Temperature: {weatherData.main.temp}°C</Typography>
            <Typography variant="body1">Condition: {weatherData.weather[0].description}</Typography>
            <Typography variant="body1">Humidity: {weatherData.main.humidity}%</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;