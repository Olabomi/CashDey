"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Expense } from "@/types";
import { ShoppingCart, Car, ArrowDown, Play, Bus, Utensils } from "lucide-react";

interface RecentTransactionsProps {
  expenses: Expense[];
}

const categoryIcons: { [key: string]: any } = {
  "Food & Drinks": Utensils,
  Transport: Bus,
  Shopping: ShoppingCart,
  Bills: "💡",
  Entertainment: Play,
  Education: "📚",
  Healthcare: "🏥",
  Rent: "🏠",
  Utilities: "⚡",
  Income: ArrowDown,
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
  Income: { bg: "bg-green-100", text: "text-green-600" },
  Other: { bg: "bg-gray-100", text: "text-gray-600" },
};

export default function RecentTransactions({ expenses }: RecentTransactionsProps) {
  if (expenses.length === 0) {
    return null;
  }

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const expenseDate = new Date(date);
    const diffInHours = Math.floor(
      (now.getTime() - expenseDate.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - expenseDate.getTime()) / (1000 * 60)
      );
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `Today, ${expenseDate.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" })}`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return formatDate(date);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-dark">Recent Transactions</h3>
        <Link href="/dashboard/wallet">
          <button className="text-naija-green text-sm font-semibold hover:underline">
            View All
          </button>
        </Link>
      </div>
      
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 divide-y divide-gray-100">
        {expenses.slice(0, 4).map((expense) => {
          const Icon =
            typeof categoryIcons[expense.category] === "string"
              ? null
              : categoryIcons[expense.category];
          const iconEmoji =
            typeof categoryIcons[expense.category] === "string"
              ? categoryIcons[expense.category]
              : null;
          const colors = categoryColors[expense.category] || { bg: "bg-gray-100", text: "text-gray-600" };

          return (
            <div
              key={expense.id}
              className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {Icon ? (
                  <div className={`w-10 h-10 ${colors.bg} rounded-full flex items-center justify-center`}>
                    <Icon className={`${colors.text} text-sm`} />
                  </div>
                ) : (
                  <div className="text-2xl">{iconEmoji}</div>
                )}
                <div>
                  <p className="font-semibold text-sm text-text-dark">
                    {expense.description || expense.category}
                  </p>
                  <p className="text-xs text-gray-500">{getRelativeTime(expense.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-bold text-sm ${
                    expense.type === "income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {expense.type === "income" ? "+" : "-"}
                  {formatCurrency(expense.amount)}
                </p>
                <p className="text-xs text-gray-500">{expense.category}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

