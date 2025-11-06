import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PortfolioContent from "@/components/portfolio/PortfolioContent";

export default async function PortfolioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // In the future, you can fetch portfolio data from a database table here
  // For now, the component uses mock data

  return <PortfolioContent />;
}

