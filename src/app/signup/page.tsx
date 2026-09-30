import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth-shell';
import { SignUpForm } from '@/components/auth-forms';
import { getSessionUser } from '@/lib/server/session';
import { S } from '@/lib/strings';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: S.auth.signupTitle };

export default async function SignUpPage() {
  const user = await getSessionUser();
  if (user) redirect('/home');

  return (
    <AuthShell title={S.auth.signupTitle} subtitle="دقيقة واحدة تفصلك عن أول برومبت تشاركه.">
      <SignUpForm />
    </AuthShell>
  );
}
