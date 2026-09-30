'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, PostCard, UserCard } from '@/components/compounds';
import { Badge, EmptyState, SearchInput, Skeleton, Tabs } from '@/components/ui';
import { api } from '@/lib/api-client';
import type { Post, SearchTab, User } from '@/lib/types';
import { S } from '@/lib/strings';

/* ============================================================
   البحث — نتيجة موحّدة مع تبويبات، وتأخير ذكي (debounce)
   لتقليل الطلبات على الخادم عند الكتابة السريعة.
   ============================================================ */

const TABS = [
  { id: 'all', label: S.search.tabAll },
  { id: 'posts', label: S.search.tabPosts },
  { id: 'creators', label: S.search.tabCreators },
  { id: 'tags', label: S.search.tabTags }
];

interface Results { creators: User[]; posts: Post[]; tags: string[] }
const EMPTY: Results = { creators: [], posts: [], tags: [] };

export function SearchScreen() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<SearchTab>('all');
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Results>(EMPTY);
  const [searched, setSearched] = useState(false);

  const term = q.trim();

  useEffect(() => {
    if (!term) {
      setResults(EMPTY);
      setSearched(false);
      return;
    }
    let cancelled = false;
    setBusy(true);
    const timer = setTimeout(() => {
      api
        .search(term, tab)
        .then((res) => {
          if (cancelled) return;
          setResults(res);
          setSearched(true);
        })
        .catch(() => {
          if (!cancelled) setResults(EMPTY);
        })
        .finally(() => {
          if (!cancelled) setBusy(false);
        });
    }, 280);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [term, tab]);

  const showCreators = tab === 'all' || tab === 'creators';
  const showPosts = tab === 'all' || tab === 'posts';
  const showTags = tab === 'all' || tab === 'tags';
  const hasAny = results.creators.length + results.posts.length + results.tags.length > 0;

  return (
    <div>
      <PageHeader title={S.nav.search} description={S.search.placeholder} />

      <div className="sticky top-[var(--header-height)] z-[var(--z-sticky)] -mx-2 bg-[var(--color-bg)]/92 px-2 py-3 backdrop-blur">
        <SearchInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onClear={() => setQ('')}
          placeholder={S.search.placeholder}
          autoFocus
        />
        <div className="mt-3">
          <Tabs items={TABS} active={tab} onChange={(id) => setTab(id as SearchTab)} variant="pill" />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-6">
        {busy && !hasAny ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={72} rounded="xl" className="w-full" />)}
          </div>
        ) : null}

        {!term ? (
          <EmptyState
            title="ابحث في خَيال"
            description="اكتب عنوان برومبت، اسم مبدع، أو وسماً — ثم اختر التبويب الذي تريده."
          />
        ) : null}

        {term && searched && !hasAny && !busy ? (
          <EmptyState title={S.search.empty} description={S.search.emptyHint} />
        ) : null}

        {showTags && results.tags.length ? (
          <section>
            <h2 className="mb-3 text-[var(--text-sm)] font-[var(--font-weight-semibold)] text-[var(--color-fg-muted)]">
              {S.search.sectionTags}
            </h2>
            <div className="flex flex-wrap gap-2">
              {results.tags.map((t) => (
                <button key={t} type="button" onClick={() => { setQ(t); setTab('posts'); }}>
                  <Badge variant="brand">#{t}</Badge>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {showCreators && results.creators.length ? (
          <section>
            <h2 className="mb-2 text-[var(--text-sm)] font-[var(--font-weight-semibold)] text-[var(--color-fg-muted)]">
              {S.search.sectionCreators}
            </h2>
            <div className="flex flex-col gap-1">
              {results.creators.map((u) => <UserCard key={u.id} user={u} />)}
            </div>
          </section>
        ) : null}

        {showPosts && results.posts.length ? (
          <section>
            <h2 className="mb-3 text-[var(--text-sm)] font-[var(--font-weight-semibold)] text-[var(--color-fg-muted)]">
              {S.search.sectionPosts}
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {results.posts.map((p) => (
                <PostCard key={p.id} post={p} variant="grid" onOpen={(id) => router.push(`/post/${id}`)} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
