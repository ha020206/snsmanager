import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  output: 'export',
  ...(process.env.GITHUB_PAGES === '1'
    ? { basePath: '/snsmanager', assetPrefix: '/snsmanager/' }
    : {}),
  outputFileTracingRoot: path.join(__dirname),
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' }],
  },
  trailingSlash: true,
}

export default nextConfig
