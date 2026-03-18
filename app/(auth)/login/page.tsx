import { AuthErrorAlert } from '@/components/auth/auth-error-alert';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { HardhatIcon } from '@/components/ui/icons';

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
            Welcome to Bob the Builder
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in or create an account to start building
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <AuthErrorAlert message={error} />
          </div>
        )}

        <OAuthButtons />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing, you agree to our terms of service.
        </p>
      </div>
    </div>
  );
}
