/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['monghyang.com', 'localhost'],
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig;