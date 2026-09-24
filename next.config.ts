import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  // Old pages merged into the new four-tab layout.
  async redirects() {
    return [
      { source: '/analytics', destination: '/insights', permanent: true },
      { source: '/achievements', destination: '/you', permanent: true },
      { source: '/settings', destination: '/you', permanent: true },
    ]
  },
}

export default nextConfig
