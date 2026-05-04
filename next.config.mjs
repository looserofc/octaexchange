/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Fix: pages/ lives at root, src/ has components/lib etc.
  // This makes @/lib/store → src/lib/store work correctly
  webpack(config) {
    return config;
  },
};

export default nextConfig;
