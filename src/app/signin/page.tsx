import { Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth-shell';
import { SignInForm } from '@/components/auth-forms';
import { getSessionUser } from '@/lib/server/session';
import { S } from '@/lib/strings';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: S.auth.signinTitle };

export default async function SignInPage() {
  const user = await getSessionUser();
  if (user) redirect('/home');

  return (
    <AuthShell title={S.auth.signinTitle} subtitle="أهلاً بعودتك — أدخل بياناتك للمتابعة.">
      <Suspense fallback={<div className="h-56 w-full animate-pulse rounded-[var(--radius-xl)] bg-[var(--color-bg-muted)]" />}>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
