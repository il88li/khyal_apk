'use client';
import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import type { User } from '@/lib/types';

/* ============================================================
   مزامنة الجلسة: يُمرَّر المستخدم من الخادم (Server Component)
   ويُخزَّن محلياً حتى تستعمله المكوّنات التفاعلية بلا طلبات إضافية.
   ============================================================ */

export function SessionBootstrap({ user }: { user: User | null }) {
  const setUser = useStore((s) => s.setUser);
  const id = user?.id ?? '';

  useEffect(() => {
    setUser(user);
    // نعتمد المعرّف وحده كمُشغّل: كائن الخادم يتغيّر مرجعياً بين الطلبات
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, setUser]);

  return null;
}

/* ============================================================
   تثبيت التطبيق (PWA) + حالة الاتصال
   ============================================================ */

export function PwaBootstrap() {
  const setInstallPrompt = useStore((s) => s.setInstallPrompt);
  const setOnline = useStore((s) => s.setOnline);

  useEffect(() => {
    setOnline(navigator.onLine);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, [setInstallPrompt, setOnline]);

  return null;
}

export function OfflineBar() {
  const online = useStore((s) => s.online);
  if (online) return null;
  return (
    <div role="status" className="sticky top-0 z-[var(--z-toast)] bg-[var(--color-warning-600)] text-white text-center text-[var(--text-xs)] py-1.5 px-4">
      أنت غير متصل بالإنترنت — سنحاول المزامنة عند عودة الاتصال.
    </div>
  );
}
