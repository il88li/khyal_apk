'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Avatar, Badge, Button, Divider, Dropdown, IconButton, toast } from './ui';
import { cn, formatRelativeTime, formatCount, truncate, copyToClipboard } from '@/lib/utils';
import type { Post, User, Comment, Notification, Conversation } from '@/lib/types';
import { S } from '@/lib/strings';
import { useStore } from '@/lib/store';

/* ============================================================
   الأجزاء 9 – 13 — المركّبات
   ============================================================ */

/* ---------- أيقونات SVG صغيرة مشتركة ---------- */
const I = {
  heart: (filled: boolean) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} aria-hidden>
      <path d="M12 21s-7-4.35-9.33-8.5C.9 9.5 3 6 6.5 6c2 0 3.5 1.1 4.5 2.5C12 7.1 13.5 6 15.5 6 19 6 21.1 9.5 21.33 12.5 19 16.65 12 21 12 21Z"
        stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  bookmark: (filled: boolean) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} aria-hidden>
      <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4V4.5Z"
        stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  copy: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  comment: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-7a8 8 0 0 1 8-8h2a8 8 0 0 1 8 4Z"
        stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  share: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 3v13M8 7l4-4 4 4"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  more: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" />
    </svg>
  ),
  follow: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="m4 12 5 5L20 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  trash: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  flag: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 21V4m0 0h13l-2 4 2 4H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
};

/* ---------- تفاعلات الصوت/الاهتزاز ---------- */
function ping(kind: 'tap' | 'success' | 'error' = 'tap') {
  const { soundEnabled, soundVolume } = useStore.getState();
  if (soundEnabled) {
    import('@/lib/utils').then(({ playTone, haptic }) => {
      playTone(kind, soundVolume);
      haptic(kind === 'error' ? 20 : 6);
    });
  }
}

/* ============================================================
   الجزء 9 — بطاقة المنشور
   ============================================================ */
export interface PostCardProps {
  post: Post;
  variant?: 'feed' | 'grid';
  onOpen?: (id: string) => void;
}

export function PostCard({ post, variant = 'feed', onOpen }: PostCardProps) {
  const patchPost = useStore((s) => s.patchPost);
  const removePost = useStore((s) => s.removePost);
  const currentUser = useStore((s) => s.user);

  const isOwner = currentUser?.id === post.author.id;

  async function toggleLike() {
    const liked = post.liked === true;
    patchPost(post.id, {
      liked: !liked,
      likeCount: post.likeCount + (liked ? -1 : 1)
    });
    ping('tap');
    toast(liked ? S.toast.likeRemoved : S.toast.likeAdded, 'success');
    try {
      await fetch(`/api/posts/${post.id}/like`, { method: liked ? 'DELETE' : 'POST' });
    } catch {
      patchPost(post.id, { liked, likeCount: post.likeCount });
      toast(S.states.error, 'error');
    }
  }

  async function toggleSave() {
    const saved = post.saved === true;
    patchPost(post.id, {
      saved: !saved,
      saveCount: post.saveCount + (saved ? -1 : 1)
    });
    ping('tap');
    toast(saved ? S.toast.unsaved : S.toast.saved, 'success');
    try {
      await fetch(`/api/posts/${post.id}/save`, { method: saved ? 'DELETE' : 'POST' });
    } catch {
      patchPost(post.id, { saved, saveCount: post.saveCount });
      toast(S.states.error, 'error');
    }
  }

  async function copyPrompt() {
    const ok = await copyToClipboard(post.prompt);
    if (ok) {
      patchPost(post.id, { copyCount: post.copyCount + 1 });
      ping('success');
      toast(S.toast.copied, 'success');
      fetch(`/api/posts/${post.id}/copy`, { method: 'POST' }).catch(() => { /* غير حرج */ });
    } else {
      toast(S.states.error, 'error');
    }
  }

  async function deletePost() {
    if (!window.confirm('هل تريد حذف هذا المنشور؟ لا يمكن التراجع.')) return;
    const prev = post;
    removePost(post.id);
    toast('تم حذف المنشور', 'success');
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('failed');
    } catch {
      patchPost(prev.id, prev);
      toast(S.states.error, 'error');
    }
  }

  if (variant === 'grid') {
    return (
      <article className="group relative aspect-[4/5] overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-bg-muted)]">
        <button
          type="button"
          onClick={() => onOpen?.(post.id)}
          className="absolute inset-0 w-full h-full"
          aria-label={`افتح ${post.title}`}
        >
          <Image
            src={post.imageUrl} alt={post.title} fill sizes="(min-width:768px) 25vw, 50vw"
            className="object-cover transition-transform duration-[var(--duration-slow)] group-hover:scale-[1.04]"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <span className="absolute bottom-0 inset-x-0 p-3 text-start">
            <span className="block text-white text-[var(--text-sm)] font-[var(--font-weight-semibold)] line-clamp-2">
              {truncate(post.title, 60)}
            </span>
            <span className="mt-1 flex items-center gap-1.5 text-white/80 text-[var(--text-2xs)]">
              {I.heart(false)} {formatCount(post.likeCount)}
            </span>
          </span>
        </button>
      </article>
    );
  }

  return (
    <article className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] overflow-hidden transition-shadow hover:shadow-md">
      {/* رأس البطاقة */}
      <header className="flex items-center gap-3 p-4">
        <Link href={`/u/${post.author.username}`} className="shrink-0">
          <Avatar src={post.author.avatarUrl} name={post.author.name} size="md" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/u/${post.author.username}`} className="block hover:underline">
            <span className="text-[var(--text-sm)] font-[var(--font-weight-semibold)] truncate block">{post.author.name}</span>
          </Link>
          <span className="block text-[var(--text-xs)] text-[var(--color-fg-subtle)]">
            <span>@{post.author.username}</span>
            <span aria-hidden> · </span>
            <time dateTime={post.createdAt}>{formatRelativeTime(post.createdAt)}</time>
          </span>
        </div>
        <Dropdown
          label="خيارات المنشور"
          trigger={<IconButton aria-label="خيارات المنشور" size="sm">{I.more}</IconButton>}
          items={[
            ...(isOwner ? [{ id: 'delete', label: S.actions.delete, icon: I.trash, danger: true, onSelect: deletePost }] : []),
            { id: 'copy', label: 'نسخ رابط المنشور', icon: I.copy, onSelect: () => {
              copyToClipboard(`${window.location.origin}/post/${post.id}`);
              toast('تم نسخ الرابط', 'success');
            }},
            { id: 'report', label: S.actions.report, icon: I.flag, onSelect: () => toast(S.toast.reported, 'success') }
          ]}
        />
      </header>

      {/* الصورة */}
      <button
        type="button"
        onClick={() => onOpen?.(post.id)}
        className="relative block w-full aspect-[4/5] bg-[var(--color-bg-muted)]"
        aria-label={`افتح ${post.title}`}
      >
        <Image
          src={post.imageUrl} alt={post.title} fill sizes="(min-width:768px) 640px, 100vw"
          className="object-cover"
        />
        {/* شريط الموديل */}
        <span className="absolute top-3 start-3 inline-flex items-center gap-1 px-2.5 h-7 rounded-full bg-black/60 backdrop-blur text-white text-[var(--text-xs)] font-[var(--font-weight-medium)]">
          {post.model}
        </span>
        {/* أزرار التفاعل العائمة */}
        <span className="absolute bottom-3 end-3 flex flex-col gap-2">
          <span
            role="button"
            aria-label={post.liked ? 'إلغاء الإعجاب' : 'إعجاب'}
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); void toggleLike(); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); void toggleLike(); } }}
            className={cn(
              'inline-flex items-center justify-center h-10 w-10 rounded-full backdrop-blur',
              'bg-black/55 text-white transition-transform active:scale-90',
              post.liked && 'text-[var(--color-danger-500)] animate-heart'
            )}
          >
            {I.heart(post.liked === true)}
          </span>
          <span
            role="button"
            aria-label={post.saved ? 'إزالة الحفظ' : 'حفظ'}
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); void toggleSave(); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); void toggleSave(); } }}
            className={cn(
              'inline-flex items-center justify-center h-10 w-10 rounded-full backdrop-blur',
              'bg-black/55 text-white transition-transform active:scale-90',
              post.saved && 'text-[var(--color-accent-400)]'
            )}
          >
            {I.bookmark(post.saved === true)}
          </span>
        </span>
      </button>

      {/* الجسم */}
      <div className="p-4 flex flex-col gap-3">
        <h3 className="text-[var(--text-lg)] font-[var(--font-weight-bold)] leading-snug">{post.title}</h3>

        {/* مقتطف البرومبت */}
        <p dir="auto" className="text-[var(--text-sm)] text-[var(--color-fg-muted)] line-clamp-3">
          {truncate(post.prompt, 180)}
        </p>

        {/* الوسوم */}
        {post.tags.length ? (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 4).map((t) => (
              <Badge key={t} variant="brand" size="sm">#{t}</Badge>
            ))}
          </div>
        ) : null}

        <Divider className="my-1" />

        {/* شريط التفاعل السفلي */}
        <footer className="flex items-center gap-1">
          <IconButton
            aria-label={post.liked ? 'إلغاء الإعجاب' : 'إعجاب'}
            size="sm"
            onClick={toggleLike}
            className={post.liked ? 'text-[var(--color-danger-500)]' : ''}
          >
            {I.heart(post.liked === true)}
          </IconButton>
          <span className="text-[var(--text-xs)] text-[var(--color-fg-subtle)] num">{formatCount(post.likeCount)}</span>

          <IconButton aria-label="تعليق" size="sm">
            {I.comment}
          </IconButton>
          <span className="text-[var(--text-xs)] text-[var(--color-fg-subtle)] num">0</span>

          <IconButton aria-label={S.post.copy} size="sm" onClick={copyPrompt}>
            {I.copy}
          </IconButton>
          <span className="text-[var(--text-xs)] text-[var(--color-fg-subtle)] num">{formatCount(post.copyCount)}</span>

          <div className="flex-1" />

          <IconButton
            aria-label={post.saved ? 'إزالة الحفظ' : 'حفظ'}
            size="sm"
            onClick={toggleSave}
            className={post.saved ? 'text-[var(--color-accent-500)]' : ''}
          >
            {I.bookmark(post.saved === true)}
          </IconButton>
        </footer>
      </div>
    </article>
  );
}

/* ============================================================
   الجزء 10 — بطاقة المستخدم
   ============================================================ */
export interface UserCardProps {
  user: Pick<User, 'id' | 'username' | 'name' | 'avatarUrl' | 'bio'>;
  isFollowing?: boolean;
  onToggleFollow?: (id: string, following: boolean) => void;
}

export function UserCard({ user, isFollowing = false, onToggleFollow }: UserCardProps) {
  const [following, setFollowing] = useState(isFollowing);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const next = !following;
    setFollowing(next);
    ping(next ? 'success' : 'tap');
    try {
      await fetch(`/api/users/${user.id}/follow`, { method: next ? 'POST' : 'DELETE' });
      toast(next ? S.toast.followed : S.toast.unfollowed, 'success');
      onToggleFollow?.(user.id, next);
    } catch {
      setFollowing(!next);
      toast(S.states.error, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-[var(--radius-xl)] hover:bg-[var(--color-surface-hover)] transition-colors">
      <Link href={`/u/${user.username}`} className="shrink-0">
        <Avatar src={user.avatarUrl} name={user.name} size="md" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/u/${user.username}`} className="block hover:underline">
          <span className="text-[var(--text-sm)] font-[var(--font-weight-semibold)] truncate block">{user.name}</span>
        </Link>
        <span className="block text-[var(--text-xs)] text-[var(--color-fg-subtle)] truncate">
          @{user.username}{user.bio ? ` — ${truncate(user.bio, 40)}` : ''}
        </span>
      </div>
      <Button
        variant={following ? 'secondary' : 'primary'}
        size="sm"
        onClick={toggle}
        loading={busy}
        leadingIcon={following ? I.check : I.follow}
      >
        {following ? S.profile.following : S.profile.follow}
      </Button>
    </div>
  );
}

/* ============================================================
   الجزء 11 — التعليق
   ============================================================ */
export interface CommentRowProps {
  comment: Comment;
  canDelete?: boolean;
  onDelete?: (id: string) => void;
}

export function CommentRow({ comment, canDelete, onDelete }: CommentRowProps) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Link href={`/u/${comment.author.username}`} className="shrink-0">
        <Avatar src={comment.author.avatarUrl} name={comment.author.name} size="sm" />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <Link href={`/u/${comment.author.username}`} className="text-[var(--text-sm)] font-[var(--font-weight-semibold)] hover:underline">
            {comment.author.name}
          </Link>
          <time dateTime={comment.createdAt} className="text-[var(--text-xs)] text-[var(--color-fg-subtle)]">
            {formatRelativeTime(comment.createdAt)}
          </time>
        </div>
        <p dir="auto" className="mt-1 text-[var(--text-sm)] text-[var(--color-fg)] whitespace-pre-wrap break-words">
          {comment.body}
        </p>
      </div>
      {canDelete ? (
        <IconButton aria-label={S.actions.delete} size="sm" onClick={() => onDelete?.(comment.id)}>
          {I.trash}
        </IconButton>
      ) : null}
    </div>
  );