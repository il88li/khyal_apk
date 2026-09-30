'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/compounds';
import { Button, Tabs } from '@/components/ui';
import { useStore } from '@/lib/store';
import { S } from '@/lib/strings';
import { FeedList } from './feed-list';

/* ============================================================
   الاستكشاف — الأكثر رواجاً وجديد اليوم
   ============================================================ */

const TABS = [
  { id: 'trending', label: S.explore.trending },
  { id: 'today', label: S.explore.today },
  { id: 'latest', label: 'الأحدث' }
];

export function ExploreScreen() {
  const [tab, setTab] = useState('trending');
  const openComposer = useStore((s) => s.openComposer);

  const options =
    tab === 'trending' ? { sort: 'trending' as const } : { sort: 'latest' as const };

  return (
    <div>
      <PageHeader
        title={S.explore.title}
        description="تصفّح ما يلهم المبدعين هذه الأيام."
        action={<Button onClick={openComposer} className="hidden sm:inline-flex">{S.nav.create}</Button>}
      />

      <Tabs items={TABS} active={tab} onChange={setTab} variant="pill" />

      <div className="mt-4">
        <FeedList
          feedKey={`explore:${tab}`}
          options={options}
          layout="grid"
          emptyTitle={S.explore.empty}
          emptyDescription="جرّب تبويباً آخر، أو كن أول من ينشر."
          emptyAction={<Button onClick={openComposer}>{S.home.emptyCta}</Button>}
        />
      </div>
    </div>
  );
}
