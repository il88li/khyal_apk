import Link from 'next/link';
import { LinkButton } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <span className="num text-[var(--text-5xl)] font-[var(--font-weight-bold)] text-[var(--color-brand-400)]">٤٠٤</span>
      <h1 className="mt-4 text-[var(--text-2xl)] font-[var(--font-weight-bold)]">لم نجد هذه الصفحة</h1>
      <p className="mt-2 max-w-md text-[var(--text-sm)] text-[var(--color-fg-muted)]">
        قد يكون الرابط قديماً أو تم حذف المحتوى. جرّب العودة إلى الرئيسية أو تصفّح الاستكشاف.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <LinkButton href="/home">الرئيسية</LinkButton>
        <LinkButton href="/explore" variant="secondary">استكشف</LinkButton>
      </div>
      <Link href="/" className="mt-6 text-[var(--text-xs)] text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)]">
        أو ارجع إلى صفحة الهبوط
      </Link>
    </div>
  );
}
