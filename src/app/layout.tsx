import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ToastHost } from '@/components/ui';
import { ThemeSync } from '@/components/theme-sync';
import './globals.css';

const plex = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-plex-arabic'
});

export const metadata: Metadata = {
  title: { default: 'خَيال', template: '%s · خَيال' },
  description: 'منصة عربية لمشاركة واكتشاف برومبتات الصور المُنشأة بالذكاء الاصطناعي.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://khayal.app'),
  applicationName: 'خَيال',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'خَيال' },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    siteName: 'خَيال',
    title: 'خَيال',
    description: 'منصة عربية لمشاركة برومبتات الصور المُنشأة بالذكاء الاصطناعي.'
  },
  twitter: { card: 'summary_large_image' }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0a09' }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=JSON.parse(localStorage.getItem('khayal-store')||'{}');var t=(s.state&&s.state.theme)||'system';var r=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.dataset.theme=r;document.documentElement.style.colorScheme=r;}catch(e){}})();`
          }}
        />
      </head>
      <body className={`${plex.variable} font-[var(--font-plex-arabic)]`}>
        <a href="#main" className="skip-link">تخطَّ إلى المحتوى</a>
        <ThemeSync />
        {children}
        <ToastHost />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}