'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/compounds';
import { Alert, Avatar, Button, Field, Input, Slider, Switch, Tabs, Textarea, toast } from '@/components/ui';
import { api } from '@/lib/api-client';
import { useStore } from '@/lib/store';
import type { Theme } from '@/lib/types';
import { S } from '@/lib/strings';
import { cn } from '@/lib/utils';

/* ============================================================
   الإعدادات — الملف، المظهر، الحساب
   ============================================================ */

const TABS = [
  { id: 'profile', label: S.settings.tabProfile },
  { id: 'appearance', label: 'المظهر' },
  { id: 'account', label: S.settings.tabAccount }
];

const ACCENTS = ['#9333ea', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export function SettingsScreen() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const soundEnabled = useStore((s) => s.soundEnabled);
  const toggleSound = useStore((s) => s.toggleSound);
  const soundVolume = useStore((s) => s.soundVolume);
  const setSoundVolume = useStore((s) => s.setSoundVolume);
  const signout = useStore((s) => s.signout);

  const [tab, setTab] = useState('profile');

  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [coverUrl, setCoverUrl] = useState(user?.coverUrl ?? '');
  const [accentColor, setAccentColor] = useState(user?.accentColor ?? ACCENTS[0]!);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  async function saveProfile() {
    setProfileError(null);
    setSavingProfile(true);
    try {
      const updated = await api.updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim() || null,
        coverUrl: coverUrl.trim() || null,
        accentColor
      });
      setUser(updated);
      toast(S.settings.saved, 'success');
      router.refresh();
    } catch (e) {
      setProfileError(e instanceof Error && e.message ? e.message : S.states.error);
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    setSavingPassword(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      toast('تم تحديث كلمة المرور', 'success');
    } catch (e) {
      toast(e instanceof Error && e.message ? e.message : S.states.error, 'error');
    } finally {
      setSavingPassword(false);
    }
  }

  if (!user) return null;

  return (
    <div>
      <PageHeader title={S.nav.settings} description="تحكّم في ملفك وطريقة ظهور المنصة لك." />

      <Tabs items={TABS} active={tab} onChange={setTab} />

      <div className="mt-6 max-w-2xl">
        {tab === 'profile' ? (
          <div className="flex flex-col gap-5">
            {profileError ? <Alert kind="error">{profileError}</Alert> : null}

            <div className="flex items-center gap-4 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <Avatar src={avatarUrl || null} name={name || user.name} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-[var(--text-sm)] font-[var(--font-weight-semibold)]">{name || user.name}</p>
                <p className="text-[var(--text-xs)] text-[var(--color-fg-subtle)]">@{user.username}</p>
              </div>
            </div>

            <Field label={S.settings.displayName}>
              <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
            </Field>

            <Field label={S.settings.bio} hint={`${bio.length}/300`}>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={300} />
            </Field>

            <Field label="رابط الصورة الشخصية" hint="اتركه فارغاً لعرض الأحرف الأولى.">
              <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} dir="ltr" placeholder="https://…" />
            </Field>

            <Field label="رابط صورة الغلاف">
              <Input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} dir="ltr" placeholder="https://…" />
            </Field>

            <Field label={S.settings.accentColor}>
              <div className="flex flex-wrap gap-2">
                {ACCENTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`اللون ${c}`}
                    onClick={() => setAccentColor(c)}
                    style={{ backgroundColor: c }}
                    className={cn(
                      'h-8 w-8 rounded-full ring-offset-2 ring-offset-[var(--color-bg)] transition',
                      accentColor === c ? 'ring-2 ring-[var(--color-fg)]' : 'ring-1 ring-[var(--color-border)]'
                    )}
                  />
                ))}
              </div>
            </Field>

            <div>
              <Button onClick={saveProfile} loading={savingProfile}>{S.settings.save}</Button>
            </div>
          </div>
        ) : null}

        {tab === 'appearance' ? (
          <div className="flex flex-col gap-5">
            <Field label="المظهر">
              <div className="flex flex-wrap gap-2">
                {(['light', 'dark', 'system'] as Theme[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={cn(
                      'h-9 rounded-full border px-4 text-[var(--text-sm)] transition-colors',
                      theme === t
                        ? 'border-transparent bg-[var(--color-primary)] text-[var(--color-fg-on-brand)]'
                        : 'border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
                    )}
                  >
                    {t === 'light' ? 'فاتح' : t === 'dark' ? 'داكن' : 'حسب النظام'}
                  </button>
                ))}
              </div>
            </Field>

            <Switch
              label="أصوات التفاعل"
              hint="نغمة قصيرة عند الإعجاب والحفظ"
              checked={soundEnabled}
              onChange={toggleSound}
            />

            <Slider
              label="مستوى الصوت"
              showValue
              min={0}
              max={100}
              value={Math.round(soundVolume * 100)}
              onChange={(e) => setSoundVolume(Number(e.target.value) / 100)}
            />
          </div>
        ) : null}

        {tab === 'account' ? (
          <div className="flex flex-col gap-5">
            <Field label={S.settings.email}>
              <Input value={user.email ?? ''} readOnly disabled dir="ltr" />
            </Field>

            <Alert kind="info">
              معرّفك <span className="font-[var(--font-weight-semibold)]">@{user.username}</span> دائم ولا يمكن تغييره لتفادي الروابط المكسورة.
            </Alert>

            <div className="flex flex-col gap-3 rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-4">
              <h3 className="text-[var(--text-sm)] font-[var(--font-weight-semibold)]">تغيير كلمة المرور</h3>
              <Field label={S.settings.currentPassword}>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </Field>
              <Field label={S.settings.newPassword} hint="8 أحرف على الأقل">
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </Field>
              <div>
                <Button
                  variant="secondary"
                  onClick={changePassword}
                  loading={savingPassword}
                  disabled={currentPassword.length < 8 || newPassword.length < 8}
                >
                  تحديث كلمة المرور
                </Button>
              </div>
            </div>

            <div>
              <Button
                variant="danger"
                onClick={async () => {
                  await signout();
                  router.push('/');
                  router.refresh();
                }}
              >
                {S.nav.signout}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
