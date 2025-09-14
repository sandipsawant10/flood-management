import axios from 'axios';

const VITE_WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const fetchWeather = async (city) => {
  if (!VITE_WEATHER_API_KEY) {
    console.error('VITE_WEATHER_API_KEY is not defined. Please set it in your .env file.');
    throw new Error('Weather API key not configured.');
  }

  try {
    const response = await axios.get(WEATHER_API_BASE_URL, {
      params: {
        q: city,
        appid: VITE_WEATHER_API_KEY,
        units: 'metric',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};