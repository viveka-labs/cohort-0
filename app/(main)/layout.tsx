import { SignOutButton } from "@/components/auth/sign-out-button";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="text-lg font-semibold">Nexus</span>
          <SignOutButton />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
