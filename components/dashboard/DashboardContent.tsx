"use client";

import { useEffect, useMemo } from "react";
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
  const supabase = useMemo(() => createClient(), []);
  const balance = survival?.balance || 0;

  const greeting = getGreeting();
  const preferredName = profile?.preferred_name || "Chief";
  
  const totalBalance = calculateTotalBalance(expenses, balance);
  const survivalStats = calculateSurvivalStats(totalBalance, expenses);
  const weeklySpending = getWeeklySpending(expenses);

  // Extract primitive values for dependency array
  const dailyBurnRate = survivalStats.dailyBurnRate;
  const daysRemaining = survivalStats.daysRemaining;

  // Update survival calculations
  useEffect(() => {
    const updateSurvival = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("survival_calculations")
          .upsert({
            user_id: user.id,
            balance: totalBalance,
            daily_spend: dailyBurnRate,
            days_remaining: daysRemaining,
          });
      }
    };
    updateSurvival();
  }, [totalBalance, dailyBurnRate, daysRemaining, supabase]);

  return (
    <div className="max-w-sm mx-auto bg-light-bg min-h-screen relative pb-24">
      {/* Header Section with Enhanced Glass Effect */}
      <div className="glass-effect sticky top-0 z-50 px-4 py-4 border-b border-gray-200/50 shadow-sm">
        <div className="flex items-center justify-between animate-slide-down">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-naija-green to-eko-teal rounded-2xl flex items-center justify-center shadow-glow">
              <span className="text-white text-base font-bold">₦</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-dark tracking-tight">CashDey</h1>
              <p className="text-xs text-text-muted font-medium">
                {greeting}, {preferredName}!
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <Bell className="text-gray-600 text-xl" />
              </button>
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold shadow-lg animate-pulse-slow">
                3
              </span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-naija-green/20 to-eko-teal/20 border-2 border-naija-green/30 flex items-center justify-center shadow-sm">
              <span className="text-sm font-bold text-naija-green">
                {preferredName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Balance & Survival Status Section */}
      <div className="px-4 pt-6 pb-4 animate-fade-in">
        <BalanceCard
          balance={totalBalance}
          burnRate={survivalStats.dailyBurnRate}
          daysRemaining={survivalStats.daysRemaining}
        />
      </div>

      {/* Survival Status Banner */}
      <div className="px-4 mb-5 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <SurvivalStatusCard status={survivalStats.status} />
      </div>

      {/* Quick Actions Section */}
      <div className="px-4 mb-5 animate-slide-up" style={{ animationDelay: "0.15s" }}>
        <QuickActions />
      </div>

      {/* Spending Overview Section */}
      <div className="px-4 mb-5 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <WeeklySpendingWidget weeklySpending={weeklySpending} />
      </div>

      {/* Goals Progress Section */}
      <div className="px-4 mb-5 animate-slide-up" style={{ animationDelay: "0.25s" }}>
        <GoalsWidget goals={goals} />
      </div>

      {/* Recent Transactions Section */}
      <div className="px-4 mb-5 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <RecentTransactions expenses={expenses.slice(0, 4)} />
      </div>

      {/* Coach Insights Section */}
      <div className="px-4 mb-5 animate-slide-up" style={{ animationDelay: "0.35s" }}>
        <CoachInsights />
      </div>

      {/* Premium Upgrade Banner */}
      <div className="px-4 mb-5 animate-slide-up" style={{ animationDelay: "0.4s" }}>
        <PremiumBanner />
      </div>

      {/* Tips & Education Section */}
      <div className="px-4 mb-24 animate-slide-up" style={{ animationDelay: "0.45s" }}>
        <MoneyTips />
      </div>
    </div>
  );
}

