import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, CircularProgress, Box, List, ListItem, ListItemText, Link } from '@mui/material';
import { fetchNews } from '../services/newsService';

const NewsWidget = () => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNews('flood disaster');
      setNewsData(data.articles);
    } catch (err) {
      setError('Failed to fetch news data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getNews();
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Latest News on Flood Disasters
        </Typography>

        {loading && <Box display="flex" justifyContent="center"><CircularProgress /></Box>}
        {error && <Typography color="error">{error}</Typography>}
        {newsData.length > 0 && (
          <List>
            {newsData.map((article, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={<Link href={article.url} target="_blank" rel="noopener">{article.title}</Link>}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {article.source.name} - {new Date(article.publishedAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {article.description}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
        {!loading && !error && newsData.length === 0 && (
          <Typography variant="body2">No news found.</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsWidget;