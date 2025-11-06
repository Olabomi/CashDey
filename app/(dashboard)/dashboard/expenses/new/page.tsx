"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BackButton from "@/components/ui/back-button";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function NewExpensePage() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
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

    // Validate category matches type - ensure income and expense use their respective categories
    const validCategories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const defaultCategory = type === "income" ? "Other" : "Other";
    const validCategory = validCategories.includes(category as any) ? category : defaultCategory;

    const { error } = await supabase.from("expenses").insert({
      user_id: user.id,
      amount: parseFloat(amount.replace(/,/g, "")),
      category: validCategory,
      description,
      date,
      type,
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
        description: `${type === "income" ? "Income" : "Expense"} logged successfully`,
      });
      router.push("/dashboard/wallet");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto bg-light-bg min-h-screen pb-24">
      <div className="sticky top-0 z-40 glass-effect px-4 py-4 border-b border-gray-200/50 shadow-sm">
        <BackButton href="/dashboard" className="mb-2" />
      </div>
      <div className="px-4 py-6">
        <Card className="shadow-soft border-gray-200/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Log {type === "income" ? "Income" : "Expense"}
            </CardTitle>
            <CardDescription className="text-text-muted font-medium">
              Track your {type === "income" ? "income" : "spending"}
            </CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === "expense" ? "default" : "outline"}
                onClick={() => {
                  setType("expense");
                  setCategory(""); // Reset category when switching types
                }}
                className="flex-1"
              >
                Expense
              </Button>
              <Button
                type="button"
                variant={type === "income" ? "default" : "outline"}
                onClick={() => {
                  setType("income");
                  setCategory(""); // Reset category when switching types
                }}
                className="flex-1"
              >
                Income
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₦)</Label>
              <Input
                id="amount"
                type="text"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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
                required
              >
                <option value="">Select category</option>
                {(type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                type="text"
                placeholder="What was this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
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

