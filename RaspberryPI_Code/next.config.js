/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for easier deployment
  output: 'standalone',
  
  // Disable strict mode for development
  reactStrictMode: true,
  
  // Configure the server to listen on all interfaces
  experimental: {
    appDir: false // Use pages directory
  },
  
  // Add CORS headers for API routes if needed
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
  }
}

module.exports = nextConfig
