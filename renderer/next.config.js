/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  trailingSlash: true,
  distDir: process.env.NODE_ENV === 'production' ? '../app' : undefined,
  images: {
    unoptimized: true,
  },
};
