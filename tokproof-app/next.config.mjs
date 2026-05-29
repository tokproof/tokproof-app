/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // /@slug/go must come before /@slug so Next.js matches the longer path first
      {
        source: '/@:username/go',
        destination: '/u/:username/go',
      },
      {
        source: '/@:username',
        destination: '/u/:username',
      },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.supabase.in' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

export default nextConfig
