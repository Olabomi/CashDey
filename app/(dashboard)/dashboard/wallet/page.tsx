import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import WalletContent from "@/components/wallet/WalletContent";

export default async function WalletPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  const { data: survival } = await supabase
    .from("survival_calculations")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return <WalletContent expenses={expenses || []} initialBalance={survival?.balance || 0} />;
}

