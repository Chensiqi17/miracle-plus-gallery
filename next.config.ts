import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 已去掉 output: 'export'，以便「保存到仓库」的 API 在 Vercel 上可用
  images: {
    unoptimized: true,
  },
};

export default nextConfig;