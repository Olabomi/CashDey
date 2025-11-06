"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getGreeting, formatCurrency } from "@/lib/utils";
import {
  calculateSurvivalStats,
  calculateTotalBalance,
  getWeeklySpending,
  calculateGoalProgress,
} from "@/lib/dashboard/calculations";
import { Profile, Expense, SavingsGoal } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Bot, Bell, Smile } from "lucide-react";
import Link from "next/link";
import BalanceCard from "./BalanceCard";
import SurvivalStatusCard from "./SurvivalStatusCard";
import QuickActions from "./QuickActions";
import WeeklySpendingWidget from "./WeeklySpendingWidget";
import GoalsWidget from "./GoalsWidget";
import RecentTransactions from "./RecentTransactions";

interface DashboardContentProps {
  profile: Profile | null;
  expenses: Expense[];
  goals: SavingsGoal[];
  survival: any;
}

export default function DashboardContent({
  profile,
  expenses,
  goals,
  survival,
}: DashboardContentProps) {
  const [balance, setBalance] = useState(survival?.balance || 0);
  const supabase = createClient();

  const greeting = getGreeting();
  const preferredName = profile?.preferred_name || "Chief";
  
  const totalBalance = calculateTotalBalance(expenses, balance);
  const survivalStats = calculateSurvivalStats(totalBalance, expenses);
  const weeklySpending = getWeeklySpending(expenses);

  // Update survival calculations
  useEffect(() => {
    const updateSurvival = async () => {
      await supabase
        .from("survival_calculations")
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          balance: totalBalance,
          daily_spend: survivalStats.dailyBurnRate,
          days_remaining: survivalStats.daysRemaining,
        });
    };
    updateSurvival();
  }, [totalBalance, survivalStats, supabase]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">CashDey</h1>
          <p className="text-muted-foreground">
            {greeting}, {preferredName}!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold">
              {preferredName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <BalanceCard
        balance={totalBalance}
        burnRate={survivalStats.dailyBurnRate}
        daysRemaining={survivalStats.daysRemaining}
      />

      {/* Survival Status */}
      <SurvivalStatusCard status={survivalStats.status} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Weekly Spending */}
      <WeeklySpendingWidget weeklySpending={weeklySpending} />

      {/* Goals */}
      <GoalsWidget goals={goals} />

      {/* Recent Transactions */}
      <RecentTransactions expenses={expenses.slice(0, 4)} />
    </div>
  );
}

