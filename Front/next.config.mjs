/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@creit.tech/stellar-wallets-kit"],
}

export default nextConfig
