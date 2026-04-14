import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media1.tenor.com' },
      { protocol: 'https', hostname: 'media.tenor.com' },
      { protocol: 'https', hostname: 'media.giphy.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
};

export default nextConfig;
