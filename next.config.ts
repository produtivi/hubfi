import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DO_SPACES_ACCESS_KEY: process.env.DO_SPACES_ACCESS_KEY,
    DO_SPACES_SECRET_KEY: process.env.DO_SPACES_SECRET_KEY,
    DO_SPACES_ENDPOINT: process.env.DO_SPACES_ENDPOINT,
    DO_SPACES_BUCKET: process.env.DO_SPACES_BUCKET,
    DO_SPACES_REGION: process.env.DO_SPACES_REGION,
  },
  async headers() {
    return [
      {
        // Permitir CORS para o script de tracking
        source: '/hubpixel.min.js',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
    ];
  },
};

export default nextConfig;
