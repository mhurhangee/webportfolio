// next.config.mjs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { withLogtail } = require('@logtail/next');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default withLogtail(nextConfig);
