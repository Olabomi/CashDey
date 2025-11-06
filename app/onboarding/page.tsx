import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if user already has a profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("preferred_name, communication_style")
    .eq("user_id", user.id)
    .single();

  // If profile exists and is complete, redirect to dashboard
  if (profile?.preferred_name && profile?.communication_style) {
    redirect("/dashboard");
  }

  return <OnboardingFlow userId={user.id} />;
}

