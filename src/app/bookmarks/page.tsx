import type { Metadata } from 'next';
import { AppFrame } from '@/components/app-frame';
import { BookmarksScreen } from '@/components/screens/bookmarks';
import { requireSessionUser } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'محفوظات' };

export default async function BookmarksPage() {
  const user = await requireSessionUser('/bookmarks');
  return (
    <AppFrame user={user}>
      <BookmarksScreen />
    </AppFrame>
  );
}
