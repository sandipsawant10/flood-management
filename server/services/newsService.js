const axios = require('axios');

const NEWS_API_KEY = process.env.VITE_NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

async function getFloodNews(query, location, fromDate, toDate) {
  if (!NEWS_API_KEY) {
    console.error('NEWS_API_KEY is not set. Cannot fetch news.');
    return {
      articles: [],
      summary: 'News API key not configured.',
      status: 'error',
      source: 'NewsAPI',
    };
  }

  try {
    const searchQuery = `${query} ${location}`;
    const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
      params: {
        q: searchQuery,
        language: 'en',
        from: fromDate ? new Date(fromDate).toISOString() : undefined,
        to: toDate ? new Date(toDate).toISOString() : undefined,
        sortBy: 'relevancy',
        pageSize: 5,
        apiKey: NEWS_API_KEY,
      },
    });

    const articles = response.data.articles.map((article) => ({
      source: article.source.name,
      author: article.author,
      title: article.title,
      description: article.description,
      url: article.url,
      publishedAt: article.publishedAt,
    }));

    let summary = 'No relevant news found.';
    let status = 'not-matched';

    if (articles.length > 0) {
      summary = `Found ${articles.length} news articles related to '${query}' in '${location}'.`;
      status = 'verified';
    }

    return {
      articles,
      summary,
      status,
      source: 'NewsAPI',
      snapshot: response.data, // Store the full API response for detailed review
    };
  } catch (error) {
    console.error('Error fetching news from NewsAPI:', error.message);
    return {
      articles: [],
      summary: `Error fetching news: ${error.message}`,
      status: 'error',
      source: 'NewsAPI',
    };
  }
}

module.exports = {
  getFloodNews,
};