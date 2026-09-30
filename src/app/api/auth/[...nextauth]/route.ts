import { handlers } from '@/lib/server/auth';

/* مسار NextAuth — يعمل على Node لأن مُهايئ Prisma يحتاج القاعدة */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const { GET, POST } = handlers;
