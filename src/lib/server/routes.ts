import { z } from 'zod';
import { NextResponse } from 'next/server';
import { prisma } from './db';
import { auth, requireUser, hashPassword } from './auth';

/* ---------- استجابات موحّدة ---------- */
export const ok = <T>(data: T, init?: ResponseInit) => NextResponse.json(data, init);
export const err = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

/* ---------- محدّد الطلبات (في الذاكرة — كافٍ لـ single-region) ---------- */
const buckets = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (b.count >= max) return false;
  b.count += 1;
  return true;
}

/* ============================================================
   الجزء 37+38 — مخططات Zod
   ============================================================ */
export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(60),
  username: z.string().regex(/^[a-z0-9_]{3,30}$/)
});

export const PostCreateSchema = z.object({
  title: z.string().min(2).max(120),
  prompt: z.string().min(10).max(5000),
  imageUrl: z.string().url(),
  model: z.string().min(1).max(60),
  tags: z.array(z.string().min(1).max(40)).max(10)
});

export const CommentSchema = z.object({ body: z.string().min(1).max(1000) });

export const ProfileUpdateSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  bio: z.string().max(300).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  coverUrl: z.string().url().nullable().optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional()
});

export const ReportSchema = z.object({
  targetType: z.enum(['post', 'user', 'comment']),
  targetId: z.string().min(1),
  reason: z.string().min(2).max(200),
  note: z.string().max(500).optional()
});

/* ============================================================
   الجزء 40 — الحسابات
   ============================================================ */
export async function handleSignup(body: unknown) {
  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) return err('بيانات غير صالحة', 422);

  const exists = await prisma.user.findFirst({
    where: { OR: [{ email: parsed.data.email }, { username: parsed.data.username }] }
  });
  if (exists) return err('البريد أو المعرّف مستخدم بالفعل', 409);

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      username: parsed.data.username,
      name: parsed.data.name,
      passwordHash
    }
  });
  return ok({ id: user.id, email: user.email, username: user.username, name: user.name }, { status: 201 });
}

export async function handleMe() {
  const session = await auth();
  if (!session?.user?.id) return err('غير مصرح', 401);
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return err('غير موجود', 404);
  const { passwordHash: _p, ...rest } = user;
  return ok(rest);
}

export async function handleProfileUpdate(body: unknown) {
  const session = await requireUser();
  const parsed = ProfileUpdateSchema.safeParse(body);
  if (!parsed.success) return err('بيانات غير صالحة', 422);
  const updated = await prisma.user.update({ where: { id: session.id }, data: parsed.data });
  const { passwordHash: _p, ...rest } = updated;
  return ok(rest);
}

/* ============================================================
   الجزء 41 — المنشورات
   ============================================================ */
const POST_INCLUDE = {
  author: { select: { id: true, username: true, name: true, avatarUrl: true } }
} as const;

export async function handleFeed(url: URL) {
  const session = await auth();
  const uid = session?.user?.id ?? null;

  const sort = (url.searchParams.get('sort') ?? 'latest') as 'latest' | 'trending';
  const tags = url.searchParams.get('tags')?.split(',').filter(Boolean) ?? [];
  const models = url.searchParams.get('models')?.split(',').filter(Boolean) ?? [];
  const cursor = url.searchParams.get('cursor');

  const take = 24;
  const where: Record<string, unknown> = {};
  if (tags.length) where.tags = { hasSome: tags };
  if (models.length) where.model = { in: models };

  const posts = await prisma.post.findMany({
    where,
    orderBy: sort === 'trending'
      ? [{ likeCount: 'desc' }, { createdAt: 'desc' }]
      : [{ createdAt: 'desc' }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: POST_INCLUDE
  });

  const hasMore = posts.length > take;
  const items = hasMore ? posts.slice(0, take) : posts;

  let likedSet = new Set<string>();
  let savedSet = new Set<string>();
  if (uid) {
    const ids = items.map((p) => p.id);
    const [likes, saves] = await Promise.all([
      prisma.like.findMany({ where: { userId: uid, postId: { in: ids } }, select: { postId: true } }),
      prisma.bookmark.findMany({ where: { userId: uid, postId: { in: ids } }, select: { postId: true } })
    ]);
    likedSet = new Set(likes.map((l) => l.postId));
    savedSet = new Set(saves.map((b) => b.postId));
  }

  return ok({
    items: items.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      liked: likedSet.has(p.id),
      saved: savedSet.has(p.id)
    })),
    nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null
  });
}

export async function handlePostById(id: string) {
  const session = await auth();
  const uid = session?.user?.id ?? null;

  const post = await prisma.post.findUnique({ where: { id }, include: POST_INCLUDE });
  if (!post) return err('المنشور غير موجود', 404);

  const [comments, related, liked, saved] = await Promise.all([
    prisma.comment.findMany({
      where: { postId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { author: { select: { id: true, username: true, name: true, avatarUrl: true } } }
    }),
    prisma.post.findMany({
      where: { id: { not: id }, tags: { hasSome: post.tags.length ? post.tags : ['__none__'] } },
      orderBy: { likeCount: 'desc' },
      take: 8,
      include: POST_INCLUDE
    }),
    uid ? prisma.like.findUnique({ where: { userId_postId: { userId: uid, postId: id } } }) : null,
    uid ? prisma.bookmark.findUnique({ where: { userId_postId: { userId: uid, postId: id } } }) : null
  ]);

  // زيادة عدد المشاهدات (fire and forget)
  prisma.post.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => undefined);

  const serialize = (p: typeof post) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString()
  });

  return ok({
    post: { ...serialize(post), liked: Boolean(liked), saved: Boolean(saved) },
    comments: comments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })),
    related: related.map(serialize)
  });
}

export async function handleCreatePost(body: unknown) {
  const session = await requireUser();
  const parsed = PostCreateSchema.safeParse(body);
  if (!parsed.success) return err('بيانات غير صالحة', 422);

  const post = await prisma.post.create({
    data: { ...parsed.data, authorId: session.id },
    include: POST_INCLUDE
  });
  return ok({
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString()
  }, { status: 201 });
}

export async function handleDeletePost(id: string) {
  const session = await requireUser();
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return err('غير موجود', 404);
  if (post.authorId !== session.id) return err('غير مصرح', 403);
  await prisma.post.delete({ where: { id } });
  return ok({ ok: true });
}

/* ============================================================
   الجزء 42 — التفاعلات
   ============================================================ */
export async function handleToggleLike(postId: string, on: boolean) {
  const session = await requireUser();
  if (on) {
    await prisma.$transaction([
      prisma.like.upsert({
        where: { userId_postId: { userId: session.id, postId } },
        create: { userId: session.id, postId },
        update: {}
      }),
      prisma.post.update({ where: { id: postId }, data: { likeCount: { increment: 1 } } }),
      prisma.notification.create({
        data: {
          userId: (await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } }))?.authorId ?? '',
          actorId: session.id,
          type: 'like',
          postId
        }
      }).catch(() => null)
    ]);
  } else {
    const existing = await prisma.like.findUnique({ where: { userId_postId: { userId: session.id, postId } } });
    if (existing) {
      await prisma.$transaction([
        prisma.like.delete({ where: { id: existing.id } }),
        prisma.post.update({ where: { id: postId }, data: { likeCount: { decrement: 1 } } })
      ]);
    }
  }
  return ok({ ok: true });
}

export async function handleToggleSave(postId: string, on: boolean) {
  const session = await requireUser();
  if (on) {
    await prisma.$transaction([
      prisma.bookmark.upsert({
        where: { userId_postId: { userId: session.id, postId } },
        create: { userId: session.id, postId },
        update: {}
      }),
      prisma.post.update({ where: { id: postId }, data: { saveCount: { increment: 1 } } })
    ]);
  } else {
    const existing = await prisma.bookmark.findUnique({ where: { userId_postId: { userId: session.id, postId } } });
    if (existing) {
      await prisma.$transaction([
        prisma.bookmark.delete({ where: { id: existing.id } }),
        prisma.post.update({ where: { id: postId }, data: { saveCount: { decrement: 1 } } })
      ]);
    }
  }
  return ok({ ok: true });
}

export async function handleCopy(postId: string) {
  await prisma.post.update({ where: { id: postId }, data: { copyCount: { increment: 1 } } });
  return ok({ ok: true });
}

export async function handleComment(postId: string, body: unknown) {
  const session = await requireUser();
  const parsed = CommentSchema.safeParse(body);
  if (!parsed.success) return err('بيانات غير صالحة', 422);

  const comment = await prisma.comment.create({
    data: { postId, authorId: session.id, body: parsed.data.body },
    include: { author: { select: { id: true, username: true, name: true, avatarUrl: true } } }
  });

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
  if (post && post.authorId !== session.id) {
    await prisma.notification.create({
      data: { userId: post.authorId, actorId: session.id, type: 'comment', postId, body: parsed.data.body.slice(0, 80) }
    }).catch(() => null);
  }

  return ok({ ...comment, createdAt: comment.createdAt.toISOString() }, { status: 201 });
}

export async function handleDeleteComment(postId: string, id: string) {
  const session = await requireUser();
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment || comment.postId !== postId) return err('غير موجود', 404);
  if (comment.authorId !== session.id) return err('غير مصرح', 403);
  await prisma.comment.delete({ where: { id } });
  return ok({ ok: true });
}

/* ============================================================
   الجزء 43 — الاكتشاف
   ============================================================ */
export async function handleSearch(url: URL) {
  const q = (url.searchParams.get('q') ?? '').trim();
  const tab = (url.searchParams.get('tab') ?? 'all') as 'all' | 'posts' | 'creators' | 'tags';
  if (q.length < 1) return ok({ creators: [], posts: [], tags: [] });

  const [creators, posts] = await Promise.all([
    tab === 'all' || tab === 'creators'
      ? prisma.user.findMany({
          where: {
            OR: [
              { username: { contains: q, mode: 'insensitive' } },
              { name: { contains: q, mode: 'insensitive' } }
            ]
          },
          take: 12,
          select: { id: true, username: true, name: true, avatarUrl: true, bio: true }
        })
      : Promise.resolve([]),
    tab === 'all' || tab === 'posts'
      ? prisma.post.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { prompt: { contains: q, mode: 'insensitive' } },
              { tags: { has: q } }
            ]
          },
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: POST_INCLUDE
        })
      : Promise.resolve([])
  ]);

  // استخراج الوسوم من نتائج المنشورات
  const tagSet = new Set<string>();
  posts.forEach((p) => p.tags.forEach((t) => { if (t.includes(q)) tagSet.add(t); }));

  return ok({
    creators,
    posts: posts.map((p) => ({ ...p, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() })),
    tags: tab === 'all' || tab === 'tags' ? Array.from(tagSet).slice(0, 30) : []
  });
}

export async function handleUserProfile(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: { select: { posts: true, followsTo: true, followsFrom: true } }
    }
  });
  if (!user) return err('المستخدم غير موجود', 404);

  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
    include: POST_INCLUDE
  });

  const { passwordHash: _p, ...u } = user;
  return ok({
    user: {
      ...u,
      createdAt: u.createdAt.toISOString(),
      postsCount: user._count.posts,
      followersCount: user._count.followsTo,
      followingCount: user._count.followsFrom
    },
    posts: posts.map((p) => ({ ...p, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() }))
  });
}

export async function handleFollow(userId: string, on: boolean) {
  const session = await requireUser();
  if (userId === session.id) return err('لا يمكنك متابعة نفسك', 400);

  if (on) {
    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId: session.id, followingId: userId } },
      create: { followerId: session.id, followingId: userId },
      update: {}
    });
    await prisma.notification.create({
      data: { userId, actorId: session.id, type: 'follow' }
    }).catch(() => null);
  } else {
    await prisma.follow.deleteMany({
      where: { followerId: session.id, followingId: userId }
    });
  }
  return ok({ ok: true });
}

/* ============================================================
   الجزء 44 — الإشعارات
   ============================================================ */
export async function handleNotifications() {
  const session = await requireUser();
  const items = await prisma.notification.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  const actorIds = Array.from(new Set(items.map((n) => n.actorId).filter((x): x is string => Boolean(x))));
  const actors = actorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, username: true, name: true, avatarUrl: true }
      })
    : [];
  const actorMap = new Map(actors.map((a) => [a.id, a]));

  return ok(items.map((n) => ({
    id: n.id,
    type: n.type as 'like' | 'comment' | 'follow' | 'mention' | 'system',
    body: n.body,
    postId: n.postId,
    readAt: n.readAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
    actor: n.actorId ? actorMap.get(n.actorId) ?? null : null
  })));
}

export async function handleMarkRead(body: unknown) {
  const session = await requireUser();
  const parsed = z.object({ ids: z.union([z.array(z.string()), z.literal('all')]) }).safeParse(body);
  if (!parsed.success) return err('بيانات غير صالحة', 422);

  const now = new Date();
  if (parsed.data.ids === 'all') {
    await prisma.notification.updateMany({ where: { userId: session.id, readAt: null }, data: { readAt: now } });
  } else {
    await prisma.notification.updateMany({
      where: { userId: session.id, id: { in: parsed.data.ids }, readAt: null },
      data: { readAt: now }
    });
  }
  return ok({ ok: true });
}

/* ============================================================
   الجزء 45 — الرسائل
   ============================================================ */
export async function handleConversations() {
  const session = await requireUser();
  const convos = await prisma.conversation.findMany({
    where: { OR: [{ userAId: session.id }, { userBId: session.id }] },
    orderBy: { lastMessageAt: 'desc' },
    take: 50,
    include: {
      userA: { select: { id: true, username: true, name: true, avatarUrl: true } },
      userB: { select: { id: true, username: true, name: true, avatarUrl: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 }
    }
  });

  const unreadCounts = await prisma.message.groupBy({
    by: ['conversationId'],
    where: {
      conversationId: { in: convos.map((c) => c.id) },
      senderId: { not: session.id },
      readAt: null
    },
    _count: { _all: true }
  });
  const countMap = new Map(unreadCounts.map((u) => [u.conversationId, u._count._all]));

  return ok(convos.map((c) => {
    const peer = c.userAId === session.id ? c.userB : c.userA;
    const last = c.messages[0];
    return {
      id: c.id,
      peer,
      lastMessage: last?.body ?? null,
      lastMessageAt: c.lastMessageAt.toISOString(),
      unreadCount: countMap.get(c.id) ?? 0
    };
  }));
}

export async function handleMessages(conversationId: string) {
  const session = await requireUser();
  const convo = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!convo) return err('المحادثة غير موجودة', 404);
  if (convo.userAId !== session.id && convo.userBId !== session.id) return err('غير مصرح', 403);

  const msgs = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: 200
  });

  // تعليم الرسائل الواردة كمقروءة
  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: session.id }, readAt: null },
    data: { readAt: new Date() }
  });

  return ok(msgs.map((m) => ({
    id: m.id,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
    readAt: m.readAt?.toISOString() ?? null,
    senderId: m.senderId
  })));
}

export async function handleSendMessage(conversationId: string, body: unknown) {
  const session = await requireUser();
  const parsed = z.object({ body: z.string().min(1).max(2000) }).safeParse(body);
  if (!parsed.success) return err('بيانات غير صالحة', 422);

  const convo = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!convo) return err('المحادثة غير موجودة', 404);
  if (convo.userAId !== session.id && convo.userBId !== session.id) return err('غير مصرح', 403);

  const [msg] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId, senderId: session.id, body: parsed.data.body }
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    })
  ]);

  return ok({
    id: msg.id,
    body: msg.body,
    createdAt: msg.createdAt.toISOString(),
    readAt: null,
    senderId: msg.senderId
  }, { status: 201 });
}

/* ============================================================
   الجزء 46 — البلاغات
   ============================================================ */
export async function handleReport(body: unknown) {
  const session = await requireUser();
  const parsed = ReportSchema.safeParse(body);
  if (!parsed.success) return err('بيانات غير صالحة', 422);

  const existing = await prisma.report.findUnique({
    where: {
      reporterId_targetType_targetId: {
        reporterId: session.id,
        targetType: parsed.data.targetType,
        targetId: parsed.data.targetId
      }
    }
  });
  if (existing) return err('سبق أن أرسلت بلاغاً على هذا العنصر', 409);

  await prisma.report.create({
    data: { ...parsed.data, reporterId: session.id }
  });
  return ok({ ok: true }, { status: 201 });
}

/* ============================================================
   الجزء 47 — الصحة والصيانة
   ============================================================ */
export async function handleHealth() {
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }
  return ok({
    ok: dbOk,
    timestamp: new Date().toISOString(),
    db: dbOk ? 'connected' : 'unreachable'
  }, { status: dbOk ? 200 : 503 });
}

export async function handleCronCleanup() {
  const cutoff = new Date(Date.now() - 1000 * 60 * 60 * 24 * 90);
  const deleted = await prisma.notification.deleteMany({
    where: { readAt: { not: null, lt: cutoff } }
  });
  return ok({ deletedNotifications: deleted.count });
}