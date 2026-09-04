import type { Metadata } from 'next';
import './globals.css';

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zju-pil-lab.github.io/dllm-reading-map/',
);
const canonicalUrl = siteUrl.toString();
const iconUrl = new URL('favicon.png', siteUrl);
const socialImageUrl = new URL('og.png', siteUrl);

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: 'dLLM Reading Map · 扩散语言模型阅读地图',
  description: '100 篇扩散语言模型论文：12 篇必读路径、方法分类、时间筛选与持续更新。',
  alternates: { canonical: canonicalUrl },
  icons: { icon: iconUrl },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: siteUrl,
    title: 'dLLM Reading Map · 扩散语言模型阅读地图',
    description: '从 Mask 到 Flow：为学生与研究者整理的开放阅读地图。',
    siteName: 'dLLM Reading Map',
    images: [{ url: socialImageUrl, width: 1200, height: 630, alt: 'dLLM Reading Map — From Mask to Flow' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'dLLM Reading Map · 扩散语言模型阅读地图',
    description: '从 Mask 到 Flow：为学生与研究者整理的开放阅读地图。',
    images: [socialImageUrl],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
