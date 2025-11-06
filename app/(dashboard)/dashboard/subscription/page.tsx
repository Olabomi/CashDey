import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SubscriptionContent from "@/components/subscription/SubscriptionContent";

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return <SubscriptionContent subscription={subscription} />;
}

