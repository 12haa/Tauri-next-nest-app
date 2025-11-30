/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // برای Tauri باید static export باشد
  trailingSlash: true,
};

module.exports = nextConfig;
