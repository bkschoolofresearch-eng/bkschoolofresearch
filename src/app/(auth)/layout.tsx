export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main id="main-content" className="min-h-svh min-w-0 flex-1">
      {children}
    </main>
  );
}
