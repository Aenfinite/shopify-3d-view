/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    rules: {
      // Handle .bin files for GLTF models
      '*.bin': {
        loaders: ['file-loader'],
        as: '*.bin',
      },
    },
  },
  webpack: (config) => {
    // Handle .bin files for GLTF models (fallback for webpack mode)
    config.module.rules.push({
      test: /\.bin$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]'
      }
    })
    return config
  },
  async headers() {
    return [
      {
        // Disable caching for GLTF files during development
        source: '/models/:path*.gltf',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, max-age=0',
          },
        ],
      },
      {
        // Apply these headers to all .bin files
        source: '/models/:path*.bin',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/octet-stream',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, max-age=0',
          },
        ],
      },
    ]
  },
}

export default nextConfig
