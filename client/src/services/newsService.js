import axios from 'axios';

const VITE_NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2/everything';

export const fetchNews = async (query) => {
  if (!VITE_NEWS_API_KEY) {
    console.error('VITE_NEWS_API_KEY is not defined. Please set it in your .env file.');
    throw new Error('News API key not configured.');
  }

  try {
    const response = await axios.get(NEWS_API_BASE_URL, {
      params: {
        q: query,
        apiKey: VITE_NEWS_API_KEY,
        language: 'en',
        sortBy: 'relevancy',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching news data:', error);
    throw error;
  }
};