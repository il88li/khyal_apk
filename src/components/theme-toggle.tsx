'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import type { Theme } from '@/lib/types';
import { cn } from '@/lib/utils';

const ORDER: Theme[] = ['light', 'dark', 'system'];

const ICONS: Record<Theme, string> = {
  light: 'M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.41-1.41M4.93 19.07l1.41-1.41m0-11.32L4.93 4.93m14.14 14.14-1.41-1.41M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  dark: 'M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z',
  system: 'M4 5h16v11H4zM9 21h6M12 16v5'
};

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length] ?? 'system';
  const label = theme === 'light' ? 'فاتح' : theme === 'dark' ? 'داكن' : 'تلقائي';

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`المظهر: ${label}. اضغط للتبديل`}
      title={`المظهر: ${label}`}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full',
        'text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]',
        'hover:bg-[var(--color-surface-hover)] transition-colors duration-[var(--duration-fast)]',
        className
      )}
    >
      {mounted ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d={ICONS[theme]} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : <span className="h-[18px] w-[18px]" />}
    </button>
  );
}
