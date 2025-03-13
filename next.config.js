/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // We'll handle linting differently to allow us to fix issues incrementally
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 