import type { Metadata } from 'next';
import { AppFrame } from '@/components/app-frame';
import { MessagesScreen } from '@/components/screens/messages';
import { requireSessionUser } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'الرسائل' };

export default async function MessagesPage() {
  const user = await requireSessionUser('/messages');
  return (
    <AppFrame user={user}>
      <MessagesScreen />
    </AppFrame>
  );
}
