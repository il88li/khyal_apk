'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { PostCard } from '@/components/compounds';
import { Alert, Button, EmptyState, Skeleton } from '@/components/ui';
import { useFeed, type UseFeedOptions } from '@/lib/use-feed';
import { S } from '@/lib/strings';
import { cn } from '@/lib/utils';

/* ============================================================
   قائمة المنشورات — تحميل تدريجي عند التمرير (بلا مكتبات خارجية)
   ============================================================ */

export interface FeedListProps {
  feedKey: string;
  options?: UseFeedOptions;
  layout?: 'grid' | 'list';
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  skeletonCount?: number;
}

export function FeedList({
  feedKey,
  options,
  layout = 'grid',
  emptyTitle = S.states.empty,
  emptyDescription,
  emptyAction,
  skeletonCount = 6
}: FeedListProps) {
  const router = useRouter();
  const { items, status, hasMore, loadingMore, loadMore } = useFeed(feedKey, options);
  const sentinel = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) void loadMore(); },
      { rootMargin: '600px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  if (status === 'error' && !items.length) {
    return (
      <Alert kind="error" title={S.states.error}>
        تعذّر تحميل المحتوى. تحقّق من اتصالك ثم أعد المحاولة.
      </Alert>
    );
  }

  if (status === 'loading' && !items.length) {
    return (
      <div className={cn(layout === 'grid' ? 'grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4' : 'flex flex-col gap-4')}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Skeleton key={i} height={layout === 'grid' ? 240 : 340} rounded="xl" className="w-full" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={cn(layout === 'grid' ? 'grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4' : 'flex flex-col gap-5')}>
        {items.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            variant={layout === 'grid' ? 'grid' : 'feed'}
            onOpen={(id) => router.push(`/post/${id}`)}
          />
        ))}
      </div>

      <div ref={sentinel} aria-hidden className="h-px" />

      {hasMore ? (
        <div className="flex justify-center pt-1">
          <Button variant="secondary" onClick={() => void loadMore()} loading={loadingMore}>
            {S.actions.loadMore}
          </Button>
        </div>
      ) : (
        <p className="pt-2 text-center text-[var(--text-xs)] text-[var(--color-fg-subtle)]">{S.states.endOfList}</p>
      )}
    </div>
  );
}
