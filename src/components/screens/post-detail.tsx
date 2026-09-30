'use client';
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CommentRow, PostCard } from '@/components/compounds';
import { Alert, Avatar, Badge, Button, Divider, EmptyState, Skeleton, Textarea, toast } from '@/components/ui';
import { api } from '@/lib/api-client';
import { useStore } from '@/lib/store';
import type { Comment, Post } from '@/lib/types';
import { S } from '@/lib/strings';
import { copyToClipboard, formatCount, formatRelativeTime } from '@/lib/utils';

/* ============================================================
   صفحة المنشور — الصورة، البرومبت، التفاعل، التعليقات، ومقترحات
   ============================================================ */

export function PostDetailScreen({ postId }: { postId: string }) {
  const router = useRouter();
  const me = useStore((s) => s.user);
  const patchPost = useStore((s) => s.patchPost);

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [related, setRelated] = useState<Post[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'notfound' | 'error'>('loading');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setStatus('loading');
    api
      .post(postId)
      .then((res) => {
        setPost(res.post);
        setComments(res.comments);
        setRelated(res.related);
        setStatus('ready');
      })
      .catch(() => setStatus('notfound'));
  }, [postId]);

  useEffect(() => { load(); }, [load]);

  async function toggleLike() {
    if (!post || busy) return;
    const liked = post.liked === true;
    setBusy(true);
    setPost({ ...post, liked: !liked, likeCount: post.likeCount + (liked ? -1 : 1) });
    patchPost(post.id, { liked: !liked, likeCount: post.likeCount + (liked ? -1 : 1) });
    try {
      await api.like(post.id, !liked);
    } catch {
      setPost(post);
      patchPost(post.id, { liked: post.liked, likeCount: post.likeCount });
      toast(S.states.error, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function toggleSave() {
    if (!post || busy) return;
    const saved = post.saved === true;
    setBusy(true);
    setPost({ ...post, saved: !saved, saveCount: post.saveCount + (saved ? -1 : 1) });
    patchPost(post.id, { saved: !saved });
    try {
      await api.save(post.id, !saved);
      toast(saved ? S.toast.unsaved : S.toast.saved, 'success');
    } catch {
      setPost(post);
      toast(S.states.error, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function copyPrompt() {
    if (!post) return;
    const ok = await copyToClipboard(post.prompt);
    if (!ok) return toast(S.states.error, 'error');
    toast(S.toast.copied, 'success');
    setPost({ ...post, copyCount: post.copyCount + 1 });
    patchPost(post.id, { copyCount: post.copyCount + 1 });
    api.copy(post.id).catch(() => undefined);
  }

  async function share() {
    if (!post) return;
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: post.title, url }); return; } catch { /* المستخدم أغلق النافذة */ }
    }
    const ok = await copyToClipboard(url);
    toast(ok ? 'تم نسخ الرابط' : S.states.error, ok ? 'success' : 'error');
  }

  async function addComment() {
    const body = draft.trim();
    if (!post || !body || sending) return;
    setSending(true);
    try {
      const created = await api.comment(post.id, body);
      setComments((cur) => [created, ...cur]);
      setDraft('');
    } catch {
      toast(S.states.error, 'error');
    } finally {
      setSending(false);
    }
  }

  async function removeComment(id: string) {
    if (!post) return;
    const prev = comments;
    setComments((cur) => cur.filter((c) => c.id !== id));
    try {
      await api.deleteComment(post.id, id);
    } catch {
      setComments(prev);
      toast(S.states.error, 'error');
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton height={380} rounded="xl" className="w-full" />
        <Skeleton height={120} rounded="xl" className="w-full" />
      </div>
    );
  }

  if (status !== 'ready' || !post) {
    return (
      <EmptyState
        title="المنشور غير متاح"
        description="ربما حُذف أو أن الرابط غير صحيح."
        action={<Button variant="secondary" onClick={() => router.push('/explore')}>تصفّح الاستكشاف</Button>}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <button type="button" onClick={() => router.back()} className="w-fit text-[var(--text-sm)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]">
        ← رجوع
      </button>

      <article className="overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        {/* رأس المنشور */}
        <header className="flex items-center gap-3 p-4">
          <Link href={`/u/${post.author.username}`} className="shrink-0">
            <Avatar src={post.author.avatarUrl} name={post.author.name} size="md" />
          </Link>
          <div className="min-w-0 flex-1">
            <Link href={`/u/${post.author.username}`} className="block truncate text-[var(--text-sm)] font-[var(--font-weight-semibold)] hover:underline">
              {post.author.name}
            </Link>
            <p className="text-[var(--text-xs)] text-[var(--color-fg-subtle)]">
              @{post.author.username} · {formatRelativeTime(post.createdAt)}
            </p>
          </div>
          <Badge variant="brand">{post.model}</Badge>
        </header>

        {/* الصورة */}
        <div className="relative aspect-[4/5] w-full bg-[var(--color-bg-muted)]">
          <Image src={post.imageUrl} alt={post.title} fill sizes="(min-width:768px) 640px, 100vw" className="object-contain" priority />
        </div>

        <div className="flex flex-col gap-4 p-4">
          <h1 className="text-[var(--text-2xl)] font-[var(--font-weight-bold)] leading-snug">{post.title}</h1>

          {/* البرومبت */}
          <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3.5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-[var(--text-xs)] font-[var(--font-weight-semibold)] text-[var(--color-fg-subtle)]">{S.post.prompt}</h2>
              <Button size="sm" variant="secondary" onClick={copyPrompt}>{S.post.copy}</Button>
            </div>
            <p dir="auto" className="whitespace-pre-wrap break-words font-mono text-[var(--text-sm)] leading-relaxed">
              {post.prompt}
            </p>
          </section>

          {post.tags.length ? (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((t) => <Badge key={t} variant="brand" size="sm">#{t}</Badge>)}
            </div>
          ) : null}

          <Divider />

          <footer className="flex items-center gap-2">
            <Button
              variant={post.liked ? 'primary' : 'secondary'}
              size="sm"
              onClick={toggleLike}
            >
              إعجاب · {formatCount(post.likeCount)}
            </Button>
            <Button variant={post.saved ? 'primary' : 'secondary'} size="sm" onClick={toggleSave}>
              {post.saved ? 'محفوظ' : S.post.save}
            </Button>
            <Button variant="secondary" size="sm" onClick={share}>{S.post.share}</Button>
            <span className="flex-1" />
            <span className="num text-[var(--text-xs)] text-[var(--color-fg-subtle)]">{formatCount(post.copyCount)} نسخة</span>
          </footer>
        </div>
      </article>

      {/* التعليقات */}
      <section className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="text-[var(--text-lg)] font-[var(--font-weight-bold)]">{S.post.comments}</h2>

        {me ? (
          <div className="mt-3 flex flex-col gap-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              placeholder={S.post.commentPlaceholder}
              maxLength={1000}
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={addComment} loading={sending} disabled={!draft.trim()}>نشر التعليق</Button>
            </div>
          </div>
        ) : (
          <Alert kind="info">سجّل الدخول لتشارك بتعليق.</Alert>
        )}

        <Divider className="my-4" />

        {comments.length ? (
          <div className="flex flex-col divide-y divide-[var(--color-border)]">
            {comments.map((c) => (
              <CommentRow key={c.id} comment={c} canDelete={me?.id === c.author.id} onDelete={removeComment} />
            ))}
          </div>
        ) : (
          <EmptyState title={S.post.emptyComments} description={S.post.emptyCommentsHint} />
        )}
      </section>

      {/* منشورات ذات صلة */}
      {related.length ? (
        <section>
          <h2 className="mb-3 text-[var(--text-lg)] font-[var(--font-weight-bold)]">{S.post.related}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {related.map((p) => (
              <PostCard key={p.id} post={p} variant="grid" onOpen={(id) => router.push(`/post/${id}`)} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
