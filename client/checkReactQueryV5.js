// This file is used to check for React Query v5 configuration issues.
// It ensures that the TanStack Query client is properly configured
// and that there are no common pitfalls with data fetching or caching.

import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false, // Optional: disable refetch on window focus
      retry: 3, // Retry failed queries 3 times
    },
  },
});

export default queryClient;
