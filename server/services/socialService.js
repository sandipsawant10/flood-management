const INSTAGRAM_ACCESS_TOKEN = process.env.VITE_INSTAGRAM_ACCESS_TOKEN;

// This is a stub for Instagram social media verification.
// The actual implementation would involve calling the Instagram Graph API.
// For now, it returns mock data.

async function getInstagramPosts(location, time) {
  if (!INSTAGRAM_ACCESS_TOKEN) {
    console.warn('INSTAGRAM_ACCESS_TOKEN is not set. Social verification is "Coming soon".');
    return {
      posts: [],
      summary: 'Instagram API access token not configured. Feature coming soon.',
      status: 'unavailable',
      source: 'Instagram',
    };
  }

  // TODO: Implement actual Instagram API call here.
  // Example: Use Axios to call Instagram Graph API
  /*
  try {
    const response = await axios.get(`https://graph.instagram.com/v12.0/places_search`, {
      params: {
        q: location,
        access_token: INSTAGRAM_ACCESS_TOKEN,
        // Add other parameters like time range if supported by Instagram API
      },
    });
    const posts = response.data.data.map(post => ({
      id: post.id,
      caption: post.caption,
      media_url: post.media_url,
      permalink: post.permalink,
      timestamp: post.timestamp,
    }));
    return {
      posts,
      summary: `Found ${posts.length} Instagram posts near ${location}.`,
      status: 'verified',
      source: 'Instagram',
      snapshot: response.data,
    };
  } catch (error) {
    console.error('Error fetching Instagram posts:', error.message);
    return {
      posts: [],
      summary: `Error fetching Instagram posts: ${error.message}`,
      status: 'error',
      source: 'Instagram',
    };
  }
  */

  // Mock data for demonstration when API is not fully implemented
  return {
    posts: [
      {
        id: 'mock_insta_1',
        caption: `Mock Instagram post about flood in ${location} around ${time}.`,
        media_url: 'https://via.placeholder.com/150?text=Instagram+Post',
        permalink: 'https://www.instagram.com/p/mockpost1/',
        timestamp: new Date().toISOString(),
      },
    ],
    summary: `Mock: Found 1 Instagram post near ${location}. (Feature coming soon)`,
    status: 'mock-verified',
    source: 'Instagram (Mock)',
  };
}

module.exports = {
  getInstagramPosts,
};