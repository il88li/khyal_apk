import { NextResponse, type NextRequest } from 'next/server';
import {
  err,
  rateLimit,
  handleSignup,
  handleMe,
  handleProfileUpdate,
  handleChangePassword,
  handleFeed,
  handlePostById,
  handleCreatePost,
  handleDeletePost,
  handleToggleLike,
  handleToggleSave,
  handleCopy,
  handleComment,
  handleDeleteComment,
  handleBookmarks,
  handleSearch,
  handleUserProfile,
  handleFollow,
  handleNotifications,
  handleMarkRead,
  handleConversations,
  handleMessages,
  handleSendMessage,
  handleStartConversation,
  handleReport,
  handleHealth,
  handleCronCleanup
} from '@/lib/server/routes';

/* ============================================================
   موجّه الـ API — يستقبل كل مسارات /api/* ويوزّعها على المعالجات.
   يعمل على Node (Prisma) ويفرض حدوداً للطلبات لحماية قاعدة البيانات
   عند ارتفاع عدد الزوار.
   ============================================================ */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** قراءة: 300 طلب/دقيقة لكل IP · كتابة: 60 طلب/دقيقة لكل IP */
const LIMITS = {
  read: { max: 300, windowMs: 60_000 },
  write: { max: 60, windowMs: 60_000 }
} as const;

function clientId(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]?.trim() || 'unknown';
  return req.headers.get('x-real-ip') ?? 'local';
}

async function readJson(req: NextRequest): Promise<unknown> {
  try {
    const text = await req.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function dispatch(req: NextRequest): Promise<Response> {
  const url = new URL(req.url);
  const segments = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);
  const [a, b, c] = segments;
  const method = req.method.toUpperCase();
  const isWrite = method !== 'GET' && method !== 'HEAD';

  // فحص الصحة لا يُقيَّد حتى يعمل مراقب الإنتاج دائماً
  if (a === 'health') return handleHealth();

  const limit = isWrite ? LIMITS.write : LIMITS.read;
  if (!rateLimit(`${clientId(req)}:${isWrite ? 'w' : 'r'}`, limit.max, limit.windowMs)) {
    return NextResponse.json({ error: 'طلبات كثيرة جداً، حاول بعد قليل' }, {
      status: 429,
      headers: { 'Retry-After': '30' }
    });
  }

  try {
    /* ---------- الحساب ---------- */
    if (a === 'signup' && method === 'POST') return handleSignup(await readJson(req));

    if (a === 'me') {
      if (!b && method === 'GET') return handleMe();
      if (!b && method === 'PATCH') return handleProfileUpdate(await readJson(req));
      if (b === 'password' && method === 'POST') return handleChangePassword(await readJson(req));
    }

    /* ---------- المنشورات ---------- */
    if (a === 'posts') {
      if (!b) {
        if (method === 'GET') return handleFeed(url);
        if (method === 'POST') return handleCreatePost(await readJson(req));
      }
      if (b && !c) {
        if (method === 'GET') return handlePostById(b);
        if (method === 'DELETE') return handleDeletePost(b);
      }
      if (b && c === 'like' && (method === 'POST' || method === 'DELETE')) {
        return handleToggleLike(b, method === 'POST');
      }
      if (b && c === 'save' && (method === 'POST' || method === 'DELETE')) {
        return handleToggleSave(b, method === 'POST');
      }
      if (b && c === 'copy' && method === 'POST') return handleCopy(b);
      if (b && c === 'comments' && method === 'POST') return handleComment(b, await readJson(req));
    }

    /* التعليق الواحد: /api/comments/[id]?postId=... */
    if (a === 'comments' && b && method === 'DELETE') {
      return handleDeleteComment(url.searchParams.get('postId') ?? '', b);
    }

    /* ---------- المحفوظات ---------- */
    if (a === 'bookmarks' && !b && method === 'GET') return handleBookmarks(url);

    /* ---------- المستخدمون ---------- */
    if (a === 'users') {
      if (b && !c && method === 'GET') return handleUserProfile(b);
      if (b && c === 'follow' && (method === 'POST' || method === 'DELETE')) {
        return handleFollow(b, method === 'POST');
      }
    }

    /* ---------- الاكتشاف ---------- */
    if (a === 'search' && method === 'GET') return handleSearch(url);

    /* ---------- الإشعارات ---------- */
    if (a === 'notifications') {
      if (!b && method === 'GET') return handleNotifications();
      if (b === 'read' && method === 'POST') return handleMarkRead(await readJson(req));
    }

    /* ---------- الرسائل ---------- */
    if (a === 'messages' && b === 'conversations') {
      if (!c) {
        if (method === 'GET') return handleConversations();
        if (method === 'POST') return handleStartConversation(await readJson(req));
      }
      if (c) {
        if (method === 'GET') return handleMessages(c);
        if (method === 'POST') return handleSendMessage(c, await readJson(req));
      }
    }

    /* ---------- البلاغات ---------- */
    if (a === 'reports' && method === 'POST') return handleReport(await readJson(req));

    /* ---------- المهام المجدولة ---------- */
    if (a === 'cron' && b === 'cleanup' && method === 'GET') {
      const secret = process.env.CRON_SECRET;
      if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
        return err('غير مصرح', 401);
      }
      return handleCronCleanup();
    }

    return err('المسار غير موجود', 404);
  } catch (error) {
    // requireUser ترمي Response عند غياب الجلسة
    if (error instanceof Response) return error;
    console.error('[api]', method, url.pathname, error);
    return err('حدث خطأ غير متوقع', 500);
  }
}

export const GET = dispatch;
export const POST = dispatch;
export const PATCH = dispatch;
export const PUT = dispatch;
export const DELETE = dispatch;
