import type { Metadata } from 'next';
import './globals.css';

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zju-pil-lab.github.io/dllm-reading-map/',
);
const canonicalUrl = siteUrl.toString();
const iconUrl = new URL('favicon.png', siteUrl);

const themeScript = `
  (() => {
    const storageKey = 'pil-color-theme';
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const getSavedTheme = () => {
      try {
        const saved = window.localStorage.getItem(storageKey);
        return saved === 'light' || saved === 'dark' ? saved : null;
      } catch {
        return null;
      }
    };
    const applyTheme = () => {
      const theme = getSavedTheme() ?? (media.matches ? 'dark' : 'light');
      root.dataset.theme = theme;
      root.style.colorScheme = theme;
    };
    applyTheme();
    media.addEventListener('change', () => {
      if (!getSavedTheme()) applyTheme();
    });
    window.addEventListener('storage', (event) => {
      if (event.key === storageKey) applyTheme();
    });
  })();
`;

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: '扩散语言模型：论文与学习资源 · dLLM Reading Map',
  description: '121 篇扩散语言模型及相关背景论文与精选学习资源：12 篇必读路径、方法分类、智能体方向、时间筛选与持续更新。',
  alternates: { canonical: canonicalUrl },
  icons: { icon: iconUrl },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: siteUrl,
    title: '扩散语言模型：论文与学习资源 · dLLM Reading Map',
    description: '扩散语言模型的研究论文、核心阅读路径与精选学习资源，支持方法分类与时间筛选。',
    siteName: 'dLLM Reading Map',
  },
  twitter: {
    card: 'summary',
    title: '扩散语言模型：论文与学习资源 · dLLM Reading Map',
    description: '扩散语言模型的研究论文、核心阅读路径与精选学习资源，支持方法分类与时间筛选。',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
