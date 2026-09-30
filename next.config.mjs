import { withSentryConfig } from '@sentry/nextjs';

/* ============================================================
   إعداد Next.js — ترويسات أمان، تحسين الصور، وSentry
   ============================================================ */

const isDev = process.env.NODE_ENV !== 'production';

const csp = [
  "default-src 'self'",
  // Next يتطلّب unsafe-inline لأنماطه الحرجة؛ unsafe-eval للتطوير فقط
  isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com"
        : "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.vercel-storage.com https://images.unsplash.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.sentry.io https://vitals.vercel-insights.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'"
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // تُزال أدوات التطوير من الحزمة في الإنتاج لتقليل حجمها
  compiler: { removeConsole: isDev ? false : { exclude: ['error', 'warn'] } },
  images: {
    formats: ['image/avif', 'image/webp'],
    // أقصى مدة لتخزين الصورة المُحسّنة على شبكة التوزيع
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // المضيفون المسموح لهم بتحسين الصور. أضف مضيف تخزينك الخاص هنا
    // بدل فتح النطاق بالكامل (يمنع استعمال الموقع كوكيل صور مفتوح).
    remotePatterns: [
      { protocol: 'https', hostname: '**.vercel-storage.com' },
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: '**.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }
    ]
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'Content-Security-Policy', value: csp },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }
      ]
    }, {
      // النسخ المبنية غير قابلة للتغيير: خزّنها إلى الأبد على شبكة التوزيع
      source: '/_next/static/:path*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]
    }];
  }
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true
});
