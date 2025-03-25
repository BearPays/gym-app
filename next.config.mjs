import withPWA from 'next-pwa';

const nextConfig = withPWA({
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
  },
  images: {
    domains: [
      'images.unsplash.com',
      'example.com',
      'storage.googleapis.com',
      'cdn.muscleandstrength.com',
      // Add any other domains you might be using for exercise images
    ],
    // This allows any external image URL, but is less secure
    // Only use in development or if you trust all image sources
    // remotePatterns: [{ hostname: '*' }],
  },
});

export default nextConfig;
