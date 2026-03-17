import Link from 'next/link';

import { AuthErrorAlert } from '@/components/auth/auth-error-alert';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { HardhatIcon } from '@/components/ui/icons';
import { Routes } from '@/lib/constants/routes';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-border bg-card p-8">
        {/* Logo + heading */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex size-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <HardhatIcon size={28} />
          </div>
          <h1 className="mb-1 font-display text-2xl text-foreground">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <AuthErrorAlert message={error} />
          </div>
        )}

        <OAuthButtons />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href={Routes.SIGNUP}
            className="font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
