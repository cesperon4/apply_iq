/** @type {import('next').NextConfig} */
const nextConfig = {
  // Avoid pdf-parse debug branch that reads test files when bundled without module.parent
  serverExternalPackages: ["pdf-parse"],
};

module.exports = nextConfig;
