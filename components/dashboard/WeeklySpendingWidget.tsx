"use client";

import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Utensils, Car, ShoppingBag, Zap, Gamepad2 } from "lucide-react";

interface WeeklySpendingWidgetProps {
  weeklySpending: { [category: string]: { amount: number; count: number } };
}

const categoryIcons: { [key: string]: any } = {
  "Food & Drinks": Utensils,
  Transport: Car,
  Shopping: ShoppingBag,
  Bills: Zap,
  Entertainment: Gamepad2,
  Education: "📚",
  Healthcare: "🏥",
  Rent: "🏠",
  Utilities: "⚡",
  Other: "📦",
};

const categoryColors: { [key: string]: { bg: string; text: string } } = {
  "Food & Drinks": { bg: "bg-red-100", text: "text-red-600" },
  Transport: { bg: "bg-blue-100", text: "text-blue-600" },
  Shopping: { bg: "bg-purple-100", text: "text-purple-600" },
  Bills: { bg: "bg-yellow-100", text: "text-yellow-600" },
  Entertainment: { bg: "bg-purple-100", text: "text-purple-600" },
  Education: { bg: "bg-indigo-100", text: "text-indigo-600" },
  Healthcare: { bg: "bg-pink-100", text: "text-pink-600" },
  Rent: { bg: "bg-orange-100", text: "text-orange-600" },
  Utilities: { bg: "bg-cyan-100", text: "text-cyan-600" },
  Other: { bg: "bg-gray-100", text: "text-gray-600" },
};

// Calculate percentage change (simplified - in real app, compare with previous week)
const getPercentageChange = (): number => {
  // For demo purposes, return random percentage. In production, compare with previous week data
  const changes = [12, -5, 25, -8, 15];
  return changes[Math.floor(Math.random() * changes.length)];
};

export default function WeeklySpendingWidget({
  weeklySpending,
}: WeeklySpendingWidgetProps) {
  const sortedCategories = Object.entries(weeklySpending).sort(
    (a, b) => b[1].amount - a[1].amount
  );

  if (sortedCategories.length === 0) {
    return null;
  }

  const getWeekRange = () => {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    return `${weekAgo.toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
    })} - ${today.toLocaleDateString("en-NG", { month: "short", day: "numeric" })}`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-dark">This Week&apos;s Spending</h3>
        <span className="text-sm text-gray-500">{getWeekRange()}</span>
      </div>
      
      <div className="space-y-4">
        {sortedCategories.slice(0, 3).map(([category, data], index) => {
          const Icon = typeof categoryIcons[category] === "string" ? null : categoryIcons[category];
          const iconEmoji = typeof categoryIcons[category] === "string" ? categoryIcons[category] : null;
          const colors = categoryColors[category] || { bg: "bg-gray-100", text: "text-gray-600" };
          const percentageChange = getPercentageChange();
          const isPositive = percentageChange > 0;

          return (
            <div key={category} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {Icon ? (
                  <div className={`w-10 h-10 ${colors.bg} rounded-full flex items-center justify-center`}>
                    <Icon className={`${colors.text} text-sm`} />
                  </div>
                ) : (
                  <div className="text-2xl">{iconEmoji}</div>
                )}
                <div>
                  <p className="font-semibold text-sm text-text-dark">{category}</p>
                  <p className="text-xs text-gray-500">{data.count} transactions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-text-dark">{formatCurrency(data.amount)}</p>
                <p className={`text-xs ${isPositive ? "text-red-600" : "text-green-600"}`}>
                  {isPositive ? "+" : ""}{percentageChange}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      <Link href="/dashboard/wallet">
        <button className="w-full mt-4 py-3 bg-naija-green/10 text-naija-green font-semibold text-sm rounded-xl hover:bg-naija-green/20 transition-colors">
          View Full Breakdown
        </button>
      </Link>
    </div>
  );
}

