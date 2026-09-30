'use client';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

/* يلتقط الأخطاء التي تسقط الإطار الجذري نفسه */
export default function GlobalError({
  error, reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: 24, textAlign: 'center' }}>
        <h1 style={{ fontSize: 22 }}>حدث خطأ غير متوقع</h1>
        <p style={{ opacity: 0.7 }}>سجّلنا المشكلة وسنعالجها. يمكنك إعادة المحاولة.</p>
        {error.digest ? <p style={{ opacity: 0.5, fontSize: 12 }}>رقم التتبّع: {error.digest}</p> : null}
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 20, height: 44, padding: '0 22px', border: 0, borderRadius: 12,
            background: '#9333ea', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer'
          }}
        >
          إعادة المحاولة
        </button>
      </body>
    </html>
  );
}
