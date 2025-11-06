"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BackButton from "@/components/ui/back-button";
import { GOAL_CATEGORIES } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function NewGoalPage() {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [category, setCategory] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { error } = await supabase.from("savings_goals").insert({
      user_id: user.id,
      name,
      target_amount: parseFloat(targetAmount.replace(/,/g, "")),
      current_amount: 0,
      category: category || "Other",
      deadline: deadline || null,
      status: "on_track",
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Goal created successfully",
      });
      router.push("/dashboard/goals");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto bg-light-bg min-h-screen pb-24">
      <div className="sticky top-0 z-40 glass-effect px-4 py-4 border-b border-gray-200/50 shadow-sm">
        <BackButton href="/dashboard/goals" className="mb-2" />
      </div>
      <div className="px-4 py-6">
        <Card className="shadow-soft border-gray-200/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">Create New Goal</CardTitle>
            <CardDescription className="text-text-muted font-medium">Set a new financial goal</CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Goal Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., House Rent"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="font-semibold text-text-dark">Category</Label>
              <select
                id="category"
                className="flex h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-naija-green focus-visible:border-naija-green transition-all duration-200 hover:border-gray-300"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select category</option>
                {GOAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount (₦)</Label>
              <Input
                id="targetAmount"
                type="text"
                placeholder="0.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline (Optional)</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Creating..." : "Create Goal"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/goals")}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

