/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimize for Vercel
  swcMinify: true,
  // Ensure proper image optimization
  images: {
    domains: [],
  },
}

module.exports = nextConfig

