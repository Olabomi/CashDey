import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ExploreContent from "@/components/explore/ExploreContent";

export default async function ExplorePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [profileResult, subscriptionResult, newsPreferenceResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).single(),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).single(),
    supabase.from("user_settings").select("explore_preferences").eq("user_id", user.id).maybeSingle(),
  ]);

  return (
    <ExploreContent
      profile={profileResult.data}
      subscription={subscriptionResult.data}
      user={user}
      explorePreferences={newsPreferenceResult?.data?.explore_preferences ?? null}
    />
  );
}

