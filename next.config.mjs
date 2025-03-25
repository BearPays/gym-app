/** @type {import('next').NextConfig} */
import withPWAInit from 'next-pwa';

// Initialize the withPWA function
const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV !== 'production',
  register: true,
  skipWaiting: true,
});

// Define Next.js config separately
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'example.com',
      'storage.googleapis.com',
      'cdn.muscleandstrength.com',
    ],
  },
};

// Apply the PWA wrapper to the Next.js config
export default withPWA(nextConfig);
