'use client';
import { PageHeader } from '@/components/compounds';
import { LinkButton } from '@/components/ui';
import { S } from '@/lib/strings';
import { FeedList } from './feed-list';

/* ============================================================
   المحفوظات — مكتبة المستخدم الخاصة
   ============================================================ */

export function BookmarksScreen() {
  return (
    <div>
      <PageHeader title={S.bookmarks.title} description="كل ما حفظته، مرتّباً حسب الأحدث." />
      <FeedList
        feedKey="bookmarks"
        options={{ source: 'bookmarks' }}
        layout="grid"
        emptyTitle={S.bookmarks.empty}
        emptyDescription="اضغط أيقونة الحفظ على أي منشور ليبقى هنا."
        emptyAction={<LinkButton href="/explore" variant="secondary">تصفّح البرومبتات</LinkButton>}
      />
    </div>
  );
}
