'use client';
import { useEffect } from 'react';
import { Button } from '@/components/ui';

export default function GlobalError({
  error, reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // يُلتقط في Sentry عبر instrumentation
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-[var(--text-2xl)] font-[var(--font-weight-bold)]">حدث خطأ غير متوقع</h1>
      <p className="mt-2 max-w-md text-[var(--text-sm)] text-[var(--color-fg-muted)]">
        سجّلنا المشكلة وسنعمل على إصلاحها. يمكنك إعادة المحاولة الآن.
      </p>
      {error.digest ? (
        <p className="num mt-2 text-[var(--text-2xs)] text-[var(--color-fg-subtle)]">رقم التتبّع: {error.digest}</p>
      ) : null}
      <div className="mt-6">
        <Button onClick={reset}>إعادة المحاولة</Button>
      </div>
    </div>
  );
}
