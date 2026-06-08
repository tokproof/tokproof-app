/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Legacy /u/:username URLs redirect to canonical /@:username format
      { source: '/u/:username/go', destination: '/@:username/go', permanent: true },
      { source: '/u/:username',    destination: '/@:username',    permanent: true },
    ]
  },
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
