/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Keep these as plain Node requires instead of bundling them.
    serverComponentsExternalPackages: ['unpdf', 'mammoth'],
  },
};

module.exports = nextConfig;
