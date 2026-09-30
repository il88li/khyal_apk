import type { Metadata } from 'next';
import { AppFrame } from '@/components/app-frame';
import { PostDetailScreen } from '@/components/screens/post-detail';
import { requireSessionUser } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'منشور' };

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSessionUser(`/post/${id}`);

  return (
    <AppFrame user={user}>
      <PostDetailScreen postId={id} />
    </AppFrame>
  );
}
