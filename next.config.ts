import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/dashboard/:role/verify',
        destination: '/dashboard/:role?action=verify',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
