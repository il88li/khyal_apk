'use client';
import type { ReactNode } from 'react';
import { useStore } from '@/lib/store';
import { Header, Sidebar, BottomNav } from './shell';
import { SessionBootstrap, PwaBootstrap, OfflineBar } from './providers';
import { Composer } from './composer';
import type { User } from '@/lib/types';
import { S } from '@/lib/strings';

/* ============================================================
   إطار التطبيق الموحّد لكل الصفحات المحمية.
   ============================================================ */

export function AppFrame({ user, children }: { user: User; children: ReactNode }) {
  const composerOpen = useStore((s) => s.composerOpen);
  const openComposer = useStore((s) => s.openComposer);
  const closeComposer = useStore((s) => s.closeComposer);
  const prependPost = useStore((s) => s.prependPost);

  return (
    <>
      <SessionBootstrap user={user} />
      <PwaBootstrap />
      <OfflineBar />
      <Header />

      <div className="mx-auto flex max-w-[var(--container-wide)] gap-6 px-2 pb-[calc(var(--bottom-nav-height)+1.5rem)] md:px-4 md:pb-6">
        <Sidebar />
        <main id="main" className="mx-auto min-w-0 max-w-[var(--container-base)] flex-1 pt-4">
          {children}
        </main>
      </div>

      <BottomNav />

      <button
        type="button"
        onClick={openComposer}
        aria-label={S.nav.create}
        className="fixed bottom-[calc(var(--bottom-nav-height)+1rem)] end-4 z-[var(--z-sticky)] inline-flex h-14 items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 text-[var(--color-fg-on-brand)] font-[var(--font-weight-semibold)] shadow-[var(--shadow-brand)] transition-transform duration-[var(--duration-fast)] hover:bg-[var(--color-primary-hover)] active:scale-95 md:bottom-8"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
        <span className="hidden sm:inline">{S.nav.create}</span>
      </button>

      <Composer open={composerOpen} onClose={closeComposer} onCreated={prependPost} />
    </>
  );
}
