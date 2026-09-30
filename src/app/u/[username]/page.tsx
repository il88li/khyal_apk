import type { Metadata } from 'next';
import { AppFrame } from '@/components/app-frame';
import { ProfileScreen } from '@/components/screens/profile';
import { requireSessionUser } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await requireSessionUser(`/u/${username}`);

  return (
    <AppFrame user={user}>
      <ProfileScreen username={username} />
    </AppFrame>
  );
}
