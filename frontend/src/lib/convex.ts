import { ConvexReactClient } from 'convex/react';

const convexUrl = import.meta.env.VITE_CONVEX_URL || '';

let convex: any = null;

try {
  if (convexUrl && convexUrl.startsWith('https://')) {
    convex = new ConvexReactClient(convexUrl);
  } else {
    console.warn('Convex URL is missing or invalid in environment variables.');
  }
} catch (error) {
  console.warn('Failed to initialize Convex client:', error);
}

export default convex;
