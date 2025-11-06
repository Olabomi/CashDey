import Navigation from "@/components/dashboard/Navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already handles auth check, no need to duplicate
  return (
    <div className="min-h-screen bg-light-bg pb-20">
      {children}
      <Navigation />
    </div>
  );
}

