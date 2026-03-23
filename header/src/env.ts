const BOOKS_RECOMMENDATION_URL = import.meta.env.VITE_BOOKS_RECOMMENDATION_URL;

if (!BOOKS_RECOMMENDATION_URL) {
  throw new Error('Missing required environment variable: VITE_BOOKS_RECOMMENDATION_URL');
}

export const ENV = {
  BOOKS_RECOMMENDATION_URL,
} as const;
