import type { Metadata } from 'next';
import { AppFrame } from '@/components/app-frame';
import { SearchScreen } from '@/components/screens/search';
import { requireSessionUser } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'بحث' };

export default async function SearchPage() {
  const user = await requireSessionUser('/search');
  return (
    <AppFrame user={user}>
      <SearchScreen />
    </AppFrame>
  );
}
