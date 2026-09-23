'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Avatar, Badge, Button, Drawer, IconButton } from './ui';
import { cn, formatCount } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { S } from '@/lib/strings';

/* ============================================================
   الأجزاء 24 – 26 — طبقات التنقّل والتبويبات والاستجابة
   ============================================================ */

const NAV_ITEMS: Array<{ href: string; label: string; icon: ReactNode }> = [
  { href: '/home', label: S.nav.home, icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2v-9Z"
        stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )},
  { href: '/explore', label: S.nav.explore, icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="m15 9-2 5-5 2 2-5 5-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )},
  { href: '/search', label: S.nav.search, icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )},
  { href: '/bookmarks', label: S.nav.bookmarks, icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4V4.5Z"
        stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )},
  { href: '/settings', label: S.nav.settings, icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )}
];

/* ---------- الشريط العلوي ---------- */
export function Header() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const unread = useStore((s) => s.unreadCount);

  return (
    <header className="sticky top-0 z-[var(--z-header)] h-[var(--header-height)] bg-[var(--color-bg)]/85 backdrop-blur border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-[var(--container-wide)] h-full flex items-center gap-3 px-4">
        <Link href="/home" className="flex items-center gap-2 shrink-0" aria-label={S.app.name}>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary)] text-white font-[var(--font-weight-bold)]">
            خ
          </span>
          <span className="hidden sm:inline text-[var(--text-lg)] font-[var(--font-weight-bold)]">{S.app.name}</span>
        </Link>

        <div className="flex-1" />

        <IconButton aria-label="الإشعارات" onClick={() => router.push('/notifications')}>
          <span className="relative inline-flex">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {unread > 0 ? (
              <span className="absolute -top-1 -end-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-danger-500)] text-white text-[10px] font-bold">
                {unread > 99 ? '99+' : unread}
              </span>
            ) : null}
          </span>
        </IconButton>

        {user ? (
          <Link href={`/u/${user.username}`} aria-label={S.nav.profile}>
            <Avatar src={user.avatarUrl} name={user.name} size="sm" />
          </Link>
        ) : (
          <Button size="sm" onClick={() => router.push('/signin')}>{S.auth.submitSignin}</Button>
        )}
      </div>
    </header>
  );
}

/* ---------- الشريط الجانبي (سطح المكتب) ---------- */
export function Sidebar() {
  const pathname = usePathname();
  const user = useStore((s) => s.user);
  return (
    <aside className="hidden md:flex flex-col gap-1 w-[var(--sidebar-width)] shrink-0 sticky top-[var(--header-height)] h-[calc(100dvh-var(--header-height))] p-4">
      {NAV_ITEMS.map((it) => {
        const active = pathname?.startsWith(it.href);
        return (
          <Link key={it.href} href={it.href}
            className={cn(
              'flex items-center gap-3 px-3 h-11 rounded-[var(--radius-xl)]',
              'transition-colors duration-[var(--duration-fast)]',
              active ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                     : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-fg)]'
            )}>
            <span className="shrink-0">{it.icon}</span>
            <span className="text-[var(--text-sm)] font-[var(--font-weight-medium)]">{it.label}</span>
          </Link>
        );
      })}
      <div className="flex-1" />
      {user ? (
        <div className="p-3 rounded-[var(--radius-xl)] bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
          <div className="flex items-center gap-2.5">
            <Avatar src={user.avatarUrl} name={user.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-[var(--text-sm)] font-[var(--font-weight-semibold)] truncate">{user.name}</p>
              <p className="text-[var(--text-xs)] text-[var(--color-fg-subtle)] truncate">@{user.username}</p>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

/* ---------- القائمة السفلية (جوال) ---------- */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-[var(--z-header)] h-[var(--bottom-nav-height)] bg-[var(--color-bg)]/95 backdrop-blur border-t border-[var(--color-border)] pb-[env(safe-area-inset-bottom)]"
      aria-label="التنقل الرئيسي"
    >
      <ul className="grid grid-cols-5 h-full">
        {NAV_ITEMS.map((it) => {
          const active = pathname?.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link href={it.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 h-full',
                  active ? 'text-[var(--color-primary)]' : 'text-[var(--color-fg-muted)]'
                )}>
                {it.icon}
                <span className="text-[var(--text-2xs)]">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ---------- شريط الترتيب والفلترة (الجزء 25) ---------- */
export function SortFilterBar({
  sort, onSortChange,
  tags, models, activeTags, activeModels,
  onToggleTag, onToggleModel, onClear
}: {
  sort: 'latest' | 'trending';
  onSortChange: (s: 'latest' | 'trending') => void;
  tags: string[];
  models: string[];
  activeTags: string[];
  activeModels: string[];
  onToggleTag: (t: string) => void;
  onToggleModel: (m: string) => void;
  onClear: () => void;
}) {
  const hasFilters = activeTags.length + activeModels.length > 0;
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-2">
      <div className="inline-flex rounded-full bg-[var(--color-bg-muted)] p-0.5 shrink-0">
        {(['latest', 'trending'] as const).map((s) => (
          <button key={s} type="button" onClick={() => onSortChange(s)}
            className={cn(
              'px-3.5 h-8 rounded-full text-[var(--text-sm)] font-[var(--font-weight-medium)]',
              'transition-colors duration-[var(--duration-fast)] whitespace-nowrap',
              sort === s ? 'bg-[var(--color-surface)] text-[var(--color-fg)] shadow-sm'
                         : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
            )}>
            {s === 'latest' ? S.home.sortLatest : S.home.sortTrending}
          </button>
        ))}
      </div>

      {models.slice(0, 6).map((m) => (
        <button key={m} type="button" onClick={() => onToggleModel(m)}
          className={cn(
            'shrink-0 h-8 px-3 rounded-full border text-[var(--text-sm)] whitespace-nowrap transition-colors',
            activeModels.includes(m)
              ? 'bg-[var(--color-primary)] text-white border-transparent'
              : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
          )}>
          {m}
        </button>
      ))}

      {tags.slice(0, 8).map((t) => (
        <button key={t} type="button" onClick={() => onToggleTag(t)}
          className={cn(
            'shrink-0 h-8 px-3 rounded-full border text-[var(--text-sm)] whitespace-nowrap transition-colors',
            activeTags.includes(t)
              ? 'bg-[var(--color-brand-600)] text-white border-transparent'
              : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
          )}>
          #{t}
        </button>
      ))}

      {hasFilters ? (
        <button type="button" onClick={onClear}
          className="shrink-0 h-8 px-3 rounded-full text-[var(--text-sm)] text-[var(--color-danger-600)] hover:bg-[var(--color-danger-50)]">
          مسح ({formatCount(activeTags.length + activeModels.length)})
        </button>
      ) : null}
    </div>
  );
}

/* ---------- حاوية المحتوى العام ---------- */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-[var(--container-wide)] flex gap-6 px-2 md:px-4 pb-[calc(var(--bottom-nav-height)+1rem)] md:pb-6">
      <Sidebar />
      <main className="flex-1 min-w-0 max-w-[var(--container-base)] mx-auto pt-4">
        {children}
      </main>
    </div>
  );
}

/* ---------- بطاقة الإجراءات العامة (Sidebar موبايل) ---------- */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useStore((s) => s.user);
  const signout = useStore((s) => s.signout);
  return (
    <Drawer open={open} onClose={onClose} side="end" title={S.app.name}>
      <div className="flex flex-col gap-2">
        {user ? (
          <div className="flex items-center gap-3 p-3 rounded-[var(--radius-xl)] bg-[var(--color-bg-subtle)]">
            <Avatar src={user.avatarUrl} name={user.name} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-[var(--text-sm)] font-[var(--font-weight-semibold)] truncate">{user.name}</p>
              <p className="text-[var(--text-xs)] text-[var(--color-fg-subtle)] truncate">@{user.username}</p>
            </div>
          </div>
        ) : null}
        {NAV_ITEMS.map((it) => (
          <Link key={it.href} href={it.href} onClick={onClose}
            className="flex items-center gap-3 px-3 h-11 rounded-[var(--radius-xl)] hover:bg-[var(--color-surface-hover)]">
            {it.icon}
            <span className="text-[var(--text-sm)]">{it.label}</span>
          </Link>
        ))}
        {user ? (
          <Button variant="secondary" onClick={async () => { await signout(); onClose(); }}>
            {S.nav.signout}
          </Button>
        ) : null}
      </div>
    </Drawer>
  );
}