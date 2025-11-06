"use client";

import { useState } from "react";
import { Expense } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { calculateTotalBalance, getWeeklySpending } from "@/lib/dashboard/calculations";

interface WalletContentProps {
  expenses: Expense[];
  initialBalance: number;
}

export default function WalletContent({ expenses, initialBalance }: WalletContentProps) {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  
  const totalBalance = calculateTotalBalance(expenses, initialBalance);
  const monthlyIncome = expenses
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const monthlyExpenses = expenses
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const monthlySavings = monthlyIncome - monthlyExpenses;

  const filteredExpenses = expenses.filter((e) => {
    if (filter === "all") return true;
    return e.type === filter;
  });

  const groupedExpenses = filteredExpenses.reduce((acc, expense) => {
    const date = formatDate(expense.date);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(expense);
    return acc;
  }, {} as { [key: string]: Expense[] });

  return (
    <div className="max-w-sm mx-auto bg-light-bg min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-effect px-4 py-4 border-b border-gray-200/50 shadow-sm">
        <h1 className="text-2xl font-bold text-text-dark tracking-tight">Wallet</h1>
      </div>
      
      <div className="px-4 py-6 space-y-6">
      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-naija-green via-naija-green to-eko-teal text-white shadow-elevated shadow-glow">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <div>
              <p className="text-white/90 text-sm font-medium mb-1">Current Balance</p>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight">{formatCurrency(totalBalance)}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-white/90 text-sm font-medium">This Month</p>
              <p className="text-xl sm:text-2xl font-bold">+{formatCurrency(monthlySavings)}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-white/90 text-xs sm:text-sm font-medium">Income</p>
              <p className="text-base sm:text-lg font-bold">{formatCurrency(monthlyIncome)}</p>
            </div>
            <div>
              <p className="text-white/90 text-xs sm:text-sm font-medium">Expenses</p>
              <p className="text-base sm:text-lg font-bold">{formatCurrency(monthlyExpenses)}</p>
            </div>
            <div>
              <p className="text-white/90 text-xs sm:text-sm font-medium">Savings</p>
              <p className="text-base sm:text-lg font-bold">{formatCurrency(monthlySavings)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          className="flex-shrink-0"
        >
          All
        </Button>
        <Button
          variant={filter === "income" ? "default" : "outline"}
          onClick={() => setFilter("income")}
          className="flex-shrink-0"
        >
          Income
        </Button>
        <Button
          variant={filter === "expense" ? "default" : "outline"}
          onClick={() => setFilter("expense")}
          className="flex-shrink-0"
        >
          Expenses
        </Button>
      </div>

      {/* Transaction List */}
      <div className="space-y-6">
        {Object.entries(groupedExpenses).map(([date, dateExpenses]) => (
          <div key={date}>
            <h3 className="font-bold text-text-dark mb-3 text-sm tracking-tight">{date}</h3>
            <div className="space-y-2">
              {dateExpenses.map((expense) => (
                <Card key={expense.id} className="shadow-soft border-gray-200/50 card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-naija-green/20 to-eko-teal/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <span className="text-naija-green font-bold text-sm">
                            {expense.category.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-text-dark truncate">
                            {expense.description || expense.category}
                          </p>
                          <p className="text-xs text-text-muted font-medium">{expense.category}</p>
                        </div>
                      </div>
                      <p
                        className={`font-bold text-base flex-shrink-0 ${
                          expense.type === "income" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {expense.type === "income" ? "+" : "-"}
                        {formatCurrency(expense.amount)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

