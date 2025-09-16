import axios from 'axios';

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

export const fetchNews = async (query = 'flood') => {
  if (!API_KEY) {
    console.error('VITE_NEWS_API_KEY is not defined. Please set it in your .env file.');
    throw new Error('News API key not configured.');
  }

  try {
    const response = await fetch(
      `${BASE_URL}/everything?q=${query}&language=en&sortBy=publishedAt&apiKey=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};