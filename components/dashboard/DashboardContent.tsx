"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getGreeting } from "@/lib/utils";
import {
  calculateSurvivalStats,
  calculateTotalBalance,
  getWeeklySpending,
} from "@/lib/dashboard/calculations";
import { Profile, Expense, SavingsGoal } from "@/types";
import { Bell } from "lucide-react";
import BalanceCard from "./BalanceCard";
import SurvivalStatusCard from "./SurvivalStatusCard";
import QuickActions from "./QuickActions";
import WeeklySpendingWidget from "./WeeklySpendingWidget";
import GoalsWidget from "./GoalsWidget";
import RecentTransactions from "./RecentTransactions";
import CoachInsights from "./CoachInsights";
import PremiumBanner from "./PremiumBanner";
import MoneyTips from "./MoneyTips";

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
  const supabase = createClient();
  const balance = survival?.balance || 0;

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
    <div className="max-w-sm mx-auto bg-white min-h-screen relative pb-20">
      {/* Header Section with Glass Effect */}
      <div className="glass-effect sticky top-0 z-50 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-naija-green to-eko-teal rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">₦</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-dark">CashDey</h1>
              <p className="text-xs text-gray-500">
                {greeting}, {preferredName}!
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bell className="text-gray-600 text-lg" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-naija-green/10 border-2 border-naija-green flex items-center justify-center">
              <span className="text-sm font-semibold text-naija-green">
                {preferredName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Balance & Survival Status Section */}
      <div className="px-4 pt-6 pb-4">
        <BalanceCard
          balance={totalBalance}
          burnRate={survivalStats.dailyBurnRate}
          daysRemaining={survivalStats.daysRemaining}
        />
      </div>

      {/* Survival Status Banner */}
      <div className="px-4 mb-6">
        <SurvivalStatusCard status={survivalStats.status} />
      </div>

      {/* Quick Actions Section */}
      <div className="px-4 mb-6">
        <QuickActions />
      </div>

      {/* Spending Overview Section */}
      <div className="px-4 mb-6">
        <WeeklySpendingWidget weeklySpending={weeklySpending} />
      </div>

      {/* Goals Progress Section */}
      <div className="px-4 mb-6">
        <GoalsWidget goals={goals} />
      </div>

      {/* Recent Transactions Section */}
      <div className="px-4 mb-6">
        <RecentTransactions expenses={expenses.slice(0, 4)} />
      </div>

      {/* Coach Insights Section */}
      <div className="px-4 mb-6">
        <CoachInsights />
      </div>

      {/* Premium Upgrade Banner */}
      <div className="px-4 mb-6">
        <PremiumBanner />
      </div>

      {/* Tips & Education Section */}
      <div className="px-4 mb-20">
        <MoneyTips />
      </div>
    </div>
  );
}

