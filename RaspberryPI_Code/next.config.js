/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow connections from any IP address for local network access
  experimental: {
    serverComponentsExternalPackages: []
  },
  // Configure for local network access
  env: {
    CUSTOM_KEY: 'microgrid-dashboard',
  },
  // Allow cross-origin requests for development
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
