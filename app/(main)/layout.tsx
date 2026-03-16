import { Navbar } from '@/components/layout/navbar';
import { getUser } from '@/lib/auth';
import { getProfileById } from '@/lib/queries/profiles';

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  const profile = user ? (await getProfileById(user.id)).data : null;

  return (
    <div className="min-h-screen">
      <Navbar user={user} profile={profile} />
      <main>{children}</main>
    </div>
  );
}
