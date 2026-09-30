'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api-client';
import { useStore } from './store';
import type { Post, PostSort, Paginated } from './types';

/* ============================================================
   خطّاف موحّد لكل القوائم المرقّمة (الرئيسية، الاستكشاف،
   المحفوظات، ملف المستخدم). الترقيم بالمؤشّر يمنع تكرار العناصر
   ويحافظ على الأداء مع ملايين المنشورات.
   ============================================================ */

export type FeedSource = 'feed' | 'bookmarks' | 'custom';

export interface UseFeedOptions {
  sort?: PostSort;
  tags?: string[];
  models?: string[];
  source?: FeedSource;
  /** دالة تحميل مخصّصة (ملف مستخدم مثلاً) */
  loader?: (cursor: string | null) => Promise<Paginated<Post>>;
  enabled?: boolean;
}

const EMPTY: Paginated<Post> = { items: [], nextCursor: null };

export function useFeed(key: string, options: UseFeedOptions = {}) {
  const { sort = 'latest', source = 'feed', enabled = true } = options;
  const tagsKey = (options.tags ?? []).join(',');
  const modelsKey = (options.models ?? []).join(',');

  const setFeed = useStore((s) => s.setFeed);
  const appendFeed = useStore((s) => s.appendFeed);
  const resetFeed = useStore((s) => s.resetFeed);
  const data = useStore((s) => s.feeds[key]) ?? EMPTY;

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadingMore, setLoadingMore] = useState(false);
  const [tick, setTick] = useState(0);
  const loaderRef = useRef(options.loader);
  loaderRef.current = options.loader;

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setStatus('loading');

    const tags = tagsKey ? tagsKey.split(',') : [];
    const models = modelsKey ? modelsKey.split(',') : [];
    const run = (): Promise<Paginated<Post>> => {
      if (loaderRef.current) return loaderRef.current(null);
      if (source === 'bookmarks') return api.bookmarks(null);
      return api.feed({ sort, tags, models, cursor: null });
    };

    run()
      .then((res) => {
        if (cancelled) return;
        setFeed(key, res);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => { cancelled = true; };
  }, [key, enabled, sort, source, tagsKey, modelsKey, setFeed, tick]);

  const loadMore = useCallback(async () => {
    const cursor = useStore.getState().feeds[key]?.nextCursor;
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const tags = tagsKey ? tagsKey.split(',') : [];
      const models = modelsKey ? modelsKey.split(',') : [];
      const res = loaderRef.current
        ? await loaderRef.current(cursor)
        : source === 'bookmarks'
          ? await api.bookmarks(cursor)
          : await api.feed({ sort, tags, models, cursor });
      appendFeed(key, res);
    } catch {
      /* نتجاهل: زر «المزيد» يبقى متاحاً لإعادة المحاولة */
    } finally {
      setLoadingMore(false);
    }
  }, [key, loadingMore, tagsKey, modelsKey, sort, source, appendFeed]);

  const refresh = useCallback(() => {
    resetFeed(key);
    setTick((t) => t + 1);
  }, [key, resetFeed]);

  return {
    items: data.items,
    hasMore: Boolean(data.nextCursor),
    status,
    loadingMore,
    loadMore,
    refresh
  };
}
