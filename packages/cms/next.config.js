/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
      domains: [
      'images.pexels.com',
      'i.ytimg.com', // ✅ REQUIRED for YouTube thumbnails
      'img.youtube.com',
      'img.airtel.tv',
      'encrypted-tbn0.gstatic.com',
      'filmfreeway-production-storage-01-connector.filmfreeway.com',
      'example.com',
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${
          process.env.API_URL || 'http://localhost:3000'
        }/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
