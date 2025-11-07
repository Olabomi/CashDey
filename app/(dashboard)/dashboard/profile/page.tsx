import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsContent from "@/components/profile/SettingsContent";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [profileResult, subscriptionResult, expensesResult, goalsResult, survivalResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).single(),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).single(),
    supabase.from("expenses").select("*").eq("user_id", user.id),
    supabase.from("savings_goals").select("*").eq("user_id", user.id),
    supabase.from("survival_calculations").select("*").eq("user_id", user.id).single(),
  ]);

  return (
    <SettingsContent
      profile={profileResult.data}
      subscription={subscriptionResult.data}
      user={user}
      expenses={expensesResult.data || []}
      goals={goalsResult.data || []}
      survival={survivalResult.data}
    />
  );
}

