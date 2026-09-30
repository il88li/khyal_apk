import type { Metadata } from 'next';
import { AppFrame } from '@/components/app-frame';
import { ExploreScreen } from '@/components/screens/explore';
import { requireSessionUser } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'استكشف' };

export default async function ExplorePage() {
  const user = await requireSessionUser('/explore');
  return (
    <AppFrame user={user}>
      <ExploreScreen />
    </AppFrame>
  );
}
