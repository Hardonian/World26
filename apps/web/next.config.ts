import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@world26/schemas',
    '@world26/data',
    '@world26/model',
    '@world26/analytics',
  ],
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
};

export default nextConfig;
