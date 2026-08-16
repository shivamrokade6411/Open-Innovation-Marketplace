/** @type {import('next').NextConfig} */
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' }
    ]
  },
  async rewrites() {
    return [
      { source: '/api/auth/login', destination: `${backendUrl}/api/auth/login` },
      { source: '/api/auth/register', destination: `${backendUrl}/api/auth/register` },
      { source: '/api/auth/logout', destination: `${backendUrl}/api/auth/logout` },
      { source: '/api/auth/refresh-token', destination: `${backendUrl}/api/auth/refresh-token` },
      { source: '/api/auth/forgot-password', destination: `${backendUrl}/api/auth/forgot-password` },
      { source: '/api/auth/reset-password', destination: `${backendUrl}/api/auth/reset-password` },
      { source: '/api/auth/verify-email/:token', destination: `${backendUrl}/api/auth/verify-email/:token` },
      { source: '/api/auth/me', destination: `${backendUrl}/api/auth/me` },
      { source: '/api/auth/users/:id', destination: `${backendUrl}/api/auth/users/:id` },
      { source: '/api/:path((?!auth/).*)', destination: `${backendUrl}/api/:path` },
    ];
  },
};

module.exports = nextConfig;
