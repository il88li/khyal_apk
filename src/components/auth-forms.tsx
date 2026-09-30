'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Alert, Button, Field, Input } from './ui';
import { api } from '@/lib/api-client';
import { S } from '@/lib/strings';
import { isValidUsername } from '@/lib/utils';

/* ============================================================
   نماذج الدخول والتسجيل — تتحقق محلياً أولاً لتقليل الطلبات
   الفاشلة على الخادم، مع رسائل عربية واضحة.
   ============================================================ */

function safeReturnTo(value: string | null): string {
  if (!value) return '/home';
  // نسمح فقط بالمسارات الداخلية لمنع إعادة التوجيه المفتوح
  return value.startsWith('/') && !value.startsWith('//') ? value : '/home';
}

export function SignInForm() {
  const router = useRouter();
  const search = useSearchParams();
  const returnTo = safeReturnTo(search.get('returnTo'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await signIn('credentials', { email: email.trim(), password, redirect: false });
      if (res?.error) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        return;
      }
      router.push(returnTo);
      router.refresh();
    } catch {
      setError(S.states.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      {error ? <Alert kind="error">{error}</Alert> : null}

      <Field label={S.auth.email} required>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          dir="ltr"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </Field>

      <Field label={S.auth.password} required>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </Field>

      <Button type="submit" size="lg" fullWidth loading={busy} disabled={!email || password.length < 8}>
        {S.auth.submitSignin}
      </Button>

      <p className="text-center text-[var(--text-sm)] text-[var(--color-fg-muted)]">
        {S.auth.toSignup}{' '}
        <Link href="/signup" className="text-[var(--color-primary)] hover:underline">إنشاء حساب</Link>
      </p>
    </form>
  );
}

export function SignUpForm() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usernameOk = isValidUsername(username);
  const canSubmit = name.trim().length >= 2 && usernameOk && /\S+@\S+\.\S+/.test(email) && password.length >= 8;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!canSubmit) return;
    setBusy(true);
    try {
      await api.signup({ name: name.trim(), username, email: email.trim(), password });
      const res = await signIn('credentials', { email: email.trim(), password, redirect: false });
      if (res?.error) {
        router.push('/signin');
        return;
      }
      router.push('/home');
      router.refresh();
    } catch (e2) {
      setError(e2 instanceof Error && e2.message ? e2.message : S.states.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      {error ? <Alert kind="error">{error}</Alert> : null}

      <Field label={S.auth.name} required>
        <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={60} required />
      </Field>

      <Field
        label={S.auth.username}
        required
        hint={usernameOk ? 'المعرّف صالح ✓' : 'أحرف إنجليزية صغيرة وأرقام و _ فقط (3–30)'}
        error={username && !usernameOk ? 'المعرّف غير صالح' : undefined}
      >
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
          dir="ltr"
          autoComplete="username"
          maxLength={30}
          required
        />
      </Field>

      <Field label={S.auth.email} required>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          dir="ltr"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </Field>

      <Field label={S.auth.password} required hint="8 أحرف على الأقل">
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
      </Field>

      <Button type="submit" size="lg" fullWidth loading={busy} disabled={!canSubmit}>
        {S.auth.submitSignup}
      </Button>

      <p className="text-center text-[var(--text-sm)] text-[var(--color-fg-muted)]">
        {S.auth.toSignin}{' '}
        <Link href="/signin" className="text-[var(--color-primary)] hover:underline">تسجيل الدخول</Link>
      </p>
    </form>
  );
}
