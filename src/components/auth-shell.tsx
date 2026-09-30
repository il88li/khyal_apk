import type { ReactNode } from 'react';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { S } from '@/lib/strings';

/* ============================================================
   إطار صفحات الدخول — تصميم منقسم: لوحة هوية + نموذج
   ============================================================ */

export function AuthShell({
  title, subtitle, children, footer
}: {
  title: string; subtitle: string; children: ReactNode; footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* لوحة الهوية */}
      <aside className="k-auth-panel relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
        <Link href="/" className="relative z-10 flex items-center gap-2.5" aria-label={S.app.name}>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-lg)] bg-white/15 text-white font-[var(--font-weight-bold)] backdrop-blur">
            خ
          </span>
          <span className="text-[var(--text-lg)] font-[var(--font-weight-bold)] text-white">{S.app.name}</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <h2 className="text-[var(--text-3xl)] font-[var(--font-weight-bold)] leading-tight text-white">
            {S.landing.heroTitle}
          </h2>
          <p className="mt-4 text-[var(--text-md)] leading-relaxed text-white/80">{S.landing.heroLead}</p>
          <ul className="mt-8 flex flex-col gap-2.5">
            {['برومبتات جاهزة للنسخ', 'مكتبة خاصة تُبنى بذكائك', 'مجتمع عربي من اليمين لليسار'].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-[var(--text-sm)] text-white/90">
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-[var(--text-xs)] text-white/60">{S.app.description}</p>
      </aside>

      {/* النموذج */}
      <main className="flex flex-col">
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2 lg:invisible" aria-label={S.app.name}>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white font-[var(--font-weight-bold)]">
              خ
            </span>
            <span className="text-[var(--text-md)] font-[var(--font-weight-bold)]">{S.app.name}</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-10">
          <div className="w-full max-w-sm k-anim-rise">
            <h1 className="text-[var(--text-2xl)] font-[var(--font-weight-bold)]">{title}</h1>
            <p className="mt-2 text-[var(--text-sm)] text-[var(--color-fg-muted)]">{subtitle}</p>
            <div className="mt-7">{children}</div>
            {footer ? <div className="mt-6">{footer}</div> : null}
          </div>
        </div>
      </main>
    </div>
  );
}
