import type { Metadata } from 'next';
import './globals.css';

const siteUrl = new URL('https://dllm-reading-map.peppy-smile-2269.chatgpt.site');

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: 'dLLM Reading Map · 扩散语言模型阅读地图',
  description: '100 篇扩散语言模型论文：12 篇必读路径、方法分类、时间筛选与持续更新。',
  alternates: { canonical: '/' },
  icons: { icon: '/favicon.png' },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: '/',
    title: 'dLLM Reading Map · 扩散语言模型阅读地图',
    description: '从 Mask 到 Flow：为学生与研究者整理的开放阅读地图。',
    siteName: 'dLLM Reading Map',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'dLLM Reading Map — From Mask to Flow' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'dLLM Reading Map · 扩散语言模型阅读地图',
    description: '从 Mask 到 Flow：为学生与研究者整理的开放阅读地图。',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
