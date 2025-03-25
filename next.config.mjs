import withPWA from 'next-pwa';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = withPWA({
  pwa: {
    dest: 'public',
    disable: !isProd, // Disable PWA in development mode
    register: true,
    skipWaiting: true,
  },
  images: {
    domains: [
      'images.unsplash.com',
      'example.com',
      'storage.googleapis.com',
      'cdn.muscleandstrength.com',
    ],
  },
});

export default nextConfig;
