/**
 * @type { import("next").NextConfig }
 */
module.exports = {
  reactStrictMode: false,
  output: 'standalone',
  experimental: {
    serverActions: true,
  },
}
