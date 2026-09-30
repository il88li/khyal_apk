import type { Metadata } from 'next';
import { AppFrame } from '@/components/app-frame';
import { NotificationsScreen } from '@/components/screens/notifications';
import { requireSessionUser } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'الإشعارات' };

export default async function NotificationsPage() {
  const user = await requireSessionUser('/notifications');
  return (
    <AppFrame user={user}>
      <NotificationsScreen />
    </AppFrame>
  );
}
