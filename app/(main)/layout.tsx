import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { getUser } from '@/lib/auth';
import { getProfileById } from '@/lib/queries/profiles';

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  const profile = user
    ? await getProfileById(user.id)
        .then((r) => r.data)
        .catch(() => null)
    : null;

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto]">
      <Navbar user={user} profile={profile} />
      <main className="pb-16">{children}</main>
      <Footer />
    </div>
  );
}
