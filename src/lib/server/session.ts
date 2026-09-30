import { redirect } from 'next/navigation';
import { auth } from './auth';
import { prisma } from './db';
import type { User } from '@/lib/types';

/* ============================================================
   جلسات الصفحات — تُقرأ على الخادم مرة واحدة لكل تحميل،
   ثم تُمرَّر للمكوّنات التفاعلية بلا طلبات إضافية.
   ============================================================ */

export async function getSessionUser(): Promise<User | null> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;

  const row = await prisma.user.findUnique({ where: { id } });
  if (!row) return null;

  return {
    id: row.id,
    username: row.username,
    name: row.name,
    email: row.email,
    bio: row.bio,
    avatarUrl: row.avatarUrl,
    coverUrl: row.coverUrl,
    accentColor: row.accentColor,
    createdAt: row.createdAt.toISOString()
  };
}

export async function requireSessionUser(returnTo = '/home'): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect(`/signin?returnTo=${encodeURIComponent(returnTo)}`);
  return user;
}
