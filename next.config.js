/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'attachments.clickup.com',
      },
    ],
  },
}

module.exports = nextConfig
