export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      {/* TODO: Add shared navigation */}
      <main>{children}</main>
    </div>
  );
}
