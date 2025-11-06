import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileContent from "@/components/profile/ProfileContent";

export default async function ProfilePage() {
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

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return <ProfileContent profile={profile} subscription={subscription} user={user} />;
}

