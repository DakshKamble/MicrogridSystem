/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow connections from any IP address for local network access
  experimental: {
    serverComponentsExternalPackages: []
  },
  // Configure for local network access
  env: {
    CUSTOM_KEY: 'microgrid-dashboard',
  }
}

module.exports = nextConfig
