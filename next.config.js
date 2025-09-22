/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure API routes work properly
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  // Optimize for production
  swcMinify: true,
  // Enable static optimization
  output: 'standalone',
}

module.exports = nextConfig
