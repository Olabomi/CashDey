"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Profile } from "@/types";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface ProfileContentProps {
  profile: Profile | null;
  subscription: any;
  user: any;
}

export default function ProfileContent({
  profile,
  subscription,
  user,
}: ProfileContentProps) {
  const [preferredName, setPreferredName] = useState(profile?.preferred_name || "");
  const [communicationStyle, setCommunicationStyle] = useState(
    profile?.communication_style || "auto"
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        preferred_name: preferredName,
        communication_style: communicationStyle,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      router.refresh();
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredName">Preferred Name</Label>
              <Input
                id="preferredName"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="communicationStyle">Communication Style</Label>
              <select
                id="communicationStyle"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={communicationStyle}
                onChange={(e) =>
                  setCommunicationStyle(
                    e.target.value as "formal" | "pidgin" | "auto"
                  )
                }
              >
                <option value="formal">Formal</option>
                <option value="pidgin">Pidgin</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  Current Plan: {subscription?.plan || "Free"}
                </p>
                {subscription?.expires_at && (
                  <p className="text-sm text-muted-foreground">
                    Expires: {new Date(subscription.expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Link href="/dashboard/subscription">
                <Button variant="outline">Manage</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleSignOut}>
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

