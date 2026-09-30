'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PostCard } from '@/components/compounds';
import { Alert, Avatar, Button, EmptyState, Skeleton, Tabs, toast } from '@/components/ui';
import { api } from '@/lib/api-client';
import { useStore } from '@/lib/store';
import type { Post, User } from '@/lib/types';
import { S } from '@/lib/strings';
import { formatCount, formatRelativeTime } from '@/lib/utils';

/* ============================================================
   الملف الشخصي — ترويسة، إحصاءات، وشبكة المنشورات
   ============================================================ */

const TABS = [
  { id: 'posts', label: S.profile.tabPosts },
  { id: 'about', label: S.profile.tabAbout }
];

export function ProfileScreen({ username }: { username: string }) {
  const router = useRouter();
  const me = useStore((s) => s.user);

  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'notfound' | 'error'>('loading');
  const [tab, setTab] = useState('posts');
  const [followBusy, setFollowBusy] = useState(false);
  const [messageBusy, setMessageBusy] = useState(false);

  const load = useCallback(() => {
    setStatus('loading');
    api
      .profile(username)
      .then((res) => {
        setProfile(res.user);
        setPosts(res.posts);
        setStatus('ready');
      })
      .catch(() => setStatus('notfound'));
  }, [username]);

  useEffect(() => { load(); }, [load]);

  async function toggleFollow() {
    if (!profile || followBusy) return;
    const next = !profile.isFollowing;
    setFollowBusy(true);
    setProfile({ ...profile, isFollowing: next, followersCount: (profile.followersCount ?? 0) + (next ? 1 : -1) });
    try {
      await api.follow(profile.id, next);
      toast(next ? S.toast.followed : S.toast.unfollowed, 'success');
    } catch {
      setProfile({ ...profile, isFollowing: !next, followersCount: profile.followersCount });
      toast(S.states.error, 'error');
    } finally {
      setFollowBusy(false);
    }
  }

  async function startChat() {
    if (!profile || messageBusy) return;
    setMessageBusy(true);
    try {
      await api.startConversation(profile.id);
      router.push('/messages');
    } catch {
      toast(S.states.error, 'error');
    } finally {
      setMessageBusy(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton height={160} rounded="xl" className="w-full" />
        <Skeleton height={80} rounded="xl" className="w-full" />
      </div>
    );
  }

  if (status !== 'ready' || !profile) {
    return (
      <EmptyState
        title="لم نجد هذا الملف"
        description="تأكّد من كتابة المعرّف بشكل صحيح."
        action={<Button variant="secondary" onClick={() => router.push('/explore')}>تصفّح المبدعين</Button>}
      />
    );
  }

  const isMe = me?.id === profile.id;

  return (
    <div className="flex flex-col gap-4">
      {/* الغلاف */}
      <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)]">
        <div
          className="h-32 w-full md:h-44"
          style={{
            background: profile.coverUrl
              ? `center / cover no-repeat url("${profile.coverUrl}")`
              : `linear-gradient(135deg, ${profile.accentColor}66, var(--color-bg-muted))`
          }}
        />
        <div className="flex flex-wrap items-end gap-4 bg-[var(--color-surface)] p-4">
          <div className="-mt-12">
            <Avatar src={profile.avatarUrl} name={profile.name} size="xl" ring />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[var(--text-xl)] font-[var(--font-weight-bold)]">{profile.name}</h1>
            <p className="text-[var(--text-xs)] text-[var(--color-fg-subtle)]">
              @{profile.username} · انضم {formatRelativeTime(profile.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isMe ? (
              <Button variant="secondary" size="sm" onClick={() => router.push('/settings')}>{S.profile.editProfile}</Button>
            ) : (
              <>
                <Button
                  variant={profile.isFollowing ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={toggleFollow}
                  loading={followBusy}
                >
                  {profile.isFollowing ? S.profile.following : S.profile.follow}
                </Button>
                <Button variant="secondary" size="sm" onClick={startChat} loading={messageBusy}>رسالة</Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* الإحصاءات */}
      <dl className="grid grid-cols-3 gap-3">
        {[
          { label: 'منشور', value: profile.postsCount ?? posts.length },
          { label: 'متابع', value: profile.followersCount ?? 0 },
          { label: 'يتابع', value: profile.followingCount ?? 0 }
        ].map((s) => (
          <div key={s.label} className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center">
            <dd className="num text-[var(--text-lg)] font-[var(--font-weight-bold)]">{formatCount(s.value)}</dd>
            <dt className="text-[var(--text-2xs)] text-[var(--color-fg-subtle)]">{s.label}</dt>
          </div>
        ))}
      </dl>

      <Tabs items={TABS} active={tab} onChange={setTab} />

      {tab === 'posts' ? (
        posts.length ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} variant="grid" onOpen={(id) => router.push(`/post/${id}`)} />
            ))}
          </div>
        ) : (
          <EmptyState title={S.profile.empty} description="لم ينشر هذا المبدع شيئاً بعد." />
        )
      ) : (
        <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          {profile.bio ? (
            <p dir="auto" className="text-[var(--text-sm)] leading-relaxed text-[var(--color-fg-muted)]">{profile.bio}</p>
          ) : (
            <Alert kind="info">لم يكتب هذا المبدع نبذة بعد.</Alert>
          )}
        </div>
      )}
    </div>
  );
}
