import type { Metadata } from 'next';
import { AppFrame } from '@/components/app-frame';
import { HomeScreen } from '@/components/screens/home';
import { requireSessionUser } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'الرئيسية' };

export default async function HomePage() {
  const user = await requireSessionUser('/home');
  return (
    <AppFrame user={user}>
      <HomeScreen />
    </AppFrame>
  );
}
