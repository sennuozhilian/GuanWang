import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import BackToTop from '../components/ui/BackToTop';

// 配置Inter字体
const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: '森诺智联 - 智能机器人解决方案提供商',
    template: '%s | 森诺智联'
  },
  description: '专注智能机器人研发与应用，为全球客户提供高品质的自动化解决方案，推动产业智能化升级',
  keywords: '智能机器人,协作机器人,AGV移动机器人,服务机器人,自动化解决方案',
  authors: [{ name: '森诺智联机器人技术有限公司' }],
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes'
  },
  openGraph: {
    title: '森诺智联 - 智能机器人解决方案提供商',
    description: '专注智能机器人研发与应用，为全球客户提供高品质自动化解决方案',
    type: 'website',
    url: 'https://your-domain.com',
    images: [{ url: '/og-image.jpg' }]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${inter.variable} font-inter`}>
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <BackToTop />
        <div id="successToast" className="success-toast">
          <i className="fa fa-check-circle mr-2"></i> 咨询提交成功！我们将尽快与您联系
        </div>
      </body>
    </html>
  );
}