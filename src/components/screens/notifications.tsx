'use client';
import { useEffect, useState } from 'react';
import { NotificationRow, PageHeader } from '@/components/compounds';
import { Alert, Button, EmptyState, Skeleton } from '@/components/ui';
import { api } from '@/lib/api-client';
import { useStore } from '@/lib/store';
import { S } from '@/lib/strings';

/* ============================================================
   الإشعارات — تُقرأ مرة عند الفتح، والتحديث فوري محلياً
   حتى لا نُثقل الخادم بطلبات متكرّرة.
   ============================================================ */

export function NotificationsScreen() {
  const items = useStore((s) => s.items);
  const setItems = useStore((s) => s.setItems);
  const setUnreadCount = useStore((s) => s.setUnreadCount);
  const markAllRead = useStore((s) => s.markAllRead);
  const markOneRead = useStore((s) => s.markOneRead);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    api
      .notifications()
      .then((list) => {
        if (cancelled) return;
        setItems(list);
        setUnreadCount(list.filter((n) => !n.readAt).length);
        setStatus('ready');
      })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [setItems, setUnreadCount]);

  const unread = items.filter((n) => !n.readAt).length;

  async function markAll() {
    markAllRead();
    try {
      await api.markNotificationsRead('all');
    } catch {
      /* التحديث المحلي يكفي */
    }
  }

  async function markOne(id: string) {
    markOneRead(id);
    try {
      await api.markNotificationsRead([id]);
    } catch {
      /* نتجاهل */
    }
  }

  return (
    <div>
      <PageHeader
        title="الإشعارات"
        description={unread ? `لديك ${unread} إشعار غير مقروء` : 'كل شيء مقروء'}
        action={unread ? <Button variant="secondary" size="sm" onClick={markAll}>تعليم الكل كمقروء</Button> : undefined}
      />

      {status === 'loading' ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={64} rounded="xl" className="w-full" />)}
        </div>
      ) : null}

      {status === 'error' ? <Alert kind="error">{S.states.error}</Alert> : null}

      {status === 'ready' && !items.length ? (
        <EmptyState title="لا إشعارات بعد" description="ستظهر هنا تفاعلات الآخرين مع منشوراتك." />
      ) : null}

      {items.length ? (
        <div className="flex flex-col gap-1">
          {items.map((n) => (
            <NotificationRow key={n.id} item={n} onRead={markOne} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
