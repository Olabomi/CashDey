import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CoachChat from "@/components/coach/CoachChat";

export default async function CoachPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: conversation } = await supabase
    .from("ai_conversations")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id);

  const { data: goals } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("user_id", user.id);

  return (
    <CoachChat
      profile={profile}
      initialMessages={(conversation?.messages as any) || []}
      userExpenses={expenses || []}
      userGoals={goals || []}
    />
  );
}

