import Link from "next/link";

import { AuthErrorAlert } from "@/components/auth/auth-error-alert";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Routes } from "@/lib/constants/routes";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign up with your GitHub or Google account
        </p>
      </div>

      {error && <AuthErrorAlert message={error} />}

      <OAuthButtons />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={Routes.LOGIN}
          className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
