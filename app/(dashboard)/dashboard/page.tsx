import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardContent from "@/components/dashboard/DashboardContent";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already protects this route, but double-check for safety
  if (!user) {
    redirect("/auth/login");
  }

  // Fetch all data in parallel for better performance
  const [profileResult, expensesResult, goalsResult, survivalResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).single(),
    supabase.from("expenses").select("*").eq("user_id", user.id).order("date", { ascending: false }),
    supabase.from("savings_goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("survival_calculations").select("*").eq("user_id", user.id).single(),
  ]);

  return (
    <DashboardContent
      profile={profileResult.data}
      expenses={expensesResult.data || []}
      goals={goalsResult.data || []}
      survival={survivalResult.data}
    />
  );
}

