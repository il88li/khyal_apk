import type { Metadata } from 'next';
import { AppFrame } from '@/components/app-frame';
import { SettingsScreen } from '@/components/screens/settings';
import { requireSessionUser } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'الإعدادات' };

export default async function SettingsPage() {
  const user = await requireSessionUser('/settings');
  return (
    <AppFrame user={user}>
      <SettingsScreen />
    </AppFrame>
  );
}
