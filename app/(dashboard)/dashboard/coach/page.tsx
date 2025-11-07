import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CoachChat from "@/components/coach/CoachChat";
import { calculateTotalBalance } from "@/lib/dashboard/calculations";

export default async function CoachPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [profileResult, conversationResult, expensesResult, goalsResult, survivalResult, subscriptionResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).single(),
    supabase.from("ai_conversations").select("*").eq("user_id", user.id).single(),
    supabase.from("expenses").select("*").eq("user_id", user.id),
    supabase.from("savings_goals").select("*").eq("user_id", user.id),
    supabase.from("survival_calculations").select("*").eq("user_id", user.id).single(),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).single(),
  ]);

  const expenses = expensesResult.data || [];
  const survival = survivalResult.data;
  const balance = calculateTotalBalance(expenses, survival?.balance || 0);

  return (
    <CoachChat
      profile={profileResult.data}
      initialMessages={(conversationResult.data?.messages as any) || []}
      userExpenses={expenses}
      userGoals={goalsResult.data || []}
      balance={balance}
      subscription={subscriptionResult.data}
    />
  );
}

