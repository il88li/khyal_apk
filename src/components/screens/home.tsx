'use client';
import Link from 'next/link';
import { PageHeader } from '@/components/compounds';
import { SortFilterBar } from '@/components/shell';
import { Avatar, Button, LinkButton } from '@/components/ui';
import { useStore } from '@/lib/store';
import { MODELS, TAGS } from '@/lib/taxonomy';
import { S } from '@/lib/strings';
import { FeedList } from './feed-list';

/* ============================================================
   الرئيسية — تدفّق المنشورات مع الترتيب والفلاتر
   ============================================================ */

export function HomeScreen() {
  const user = useStore((s) => s.user);
  const sort = useStore((s) => s.sort);
  const setSort = useStore((s) => s.setSort);
  const activeTags = useStore((s) => s.activeTags);
  const activeModels = useStore((s) => s.activeModels);
  const toggleTag = useStore((s) => s.toggleTag);
  const toggleModel = useStore((s) => s.toggleModel);
  const clearFilters = useStore((s) => s.clearFilters);
  const openComposer = useStore((s) => s.openComposer);

  // المفتاح يضم الترتيب والفلاتر: تغييرها يجلب قائمة جديدة ويحفظ السابقة
  const feedKey = `home:${sort}:${[...activeTags].sort().join('|')}:${[...activeModels].sort().join('|')}`;

  return (
    <div className="flex flex-col">
      <PageHeader
        title={user ? `${S.home.greeting} ${user.name}` : S.app.name}
        description="أحدث البرومبتات من المجتمع، مرتّبة كما تحب."
        action={<Button onClick={openComposer} className="hidden sm:inline-flex">{S.nav.create}</Button>}
      />

      {user ? (
        <button
          type="button"
          onClick={openComposer}
          className="mb-4 flex w-full items-center gap-3 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 text-start transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-hover)]"
        >
          <Avatar src={user.avatarUrl} name={user.name} size="md" />
          <span className="flex-1 text-[var(--text-sm)] text-[var(--color-fg-subtle)]">{S.home.composerPlaceholder}</span>
          <span className="inline-flex h-8 items-center rounded-full bg-[var(--color-primary-soft)] px-3 text-[var(--text-xs)] font-[var(--font-weight-semibold)] text-[var(--color-primary)]">
            نشر
          </span>
        </button>
      ) : null}

      <SortFilterBar
        sort={sort}
        onSortChange={setSort}
        tags={[...TAGS]}
        models={[...MODELS]}
        activeTags={activeTags}
        activeModels={activeModels}
        onToggleTag={toggleTag}
        onToggleModel={toggleModel}
        onClear={clearFilters}
      />

      <div className="mt-3">
        <FeedList
          feedKey={feedKey}
          options={{ sort, tags: activeTags, models: activeModels }}
          layout="list"
          emptyTitle={S.home.empty}
          emptyDescription="لم تصل منشورات مطابقة لاختياراتك بعد."
          emptyAction={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button onClick={openComposer}>{S.home.emptyCta}</Button>
              <LinkButton href="/explore" variant="secondary">استكشف الآخرين</LinkButton>
            </div>
          }
        />
      </div>

      <p className="mt-6 text-center text-[var(--text-xs)] text-[var(--color-fg-subtle)]">
        تريد رؤية أفضل ما نشره المبدعون؟{' '}
        <Link href="/explore" className="text-[var(--color-primary)] hover:underline">اذهب إلى الاستكشاف</Link>
      </p>
    </div>
  );
}
