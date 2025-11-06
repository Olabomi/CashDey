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
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Wallet</h1>
      
      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-green-100 text-sm">Current Balance</p>
              <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
            </div>
            <div className="text-right">
              <p className="text-green-100 text-sm">This Month</p>
              <p className="text-xl font-semibold">+{formatCurrency(monthlySavings)}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-green-400/30">
            <div>
              <p className="text-green-100 text-sm">Income</p>
              <p className="text-lg font-semibold">{formatCurrency(monthlyIncome)}</p>
            </div>
            <div>
              <p className="text-green-100 text-sm">Expenses</p>
              <p className="text-lg font-semibold">{formatCurrency(monthlyExpenses)}</p>
            </div>
            <div>
              <p className="text-green-100 text-sm">Savings</p>
              <p className="text-lg font-semibold">{formatCurrency(monthlySavings)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "income" ? "default" : "outline"}
          onClick={() => setFilter("income")}
        >
          Income
        </Button>
        <Button
          variant={filter === "expense" ? "default" : "outline"}
          onClick={() => setFilter("expense")}
        >
          Expenses
        </Button>
      </div>

      {/* Transaction List */}
      <div className="space-y-6">
        {Object.entries(groupedExpenses).map(([date, dateExpenses]) => (
          <div key={date}>
            <h3 className="font-semibold mb-3">{date}</h3>
            <div className="space-y-2">
              {dateExpenses.map((expense) => (
                <Card key={expense.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          {expense.category.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{expense.description || expense.category}</p>
                          <p className="text-sm text-muted-foreground">{expense.category}</p>
                        </div>
                      </div>
                      <p
                        className={`font-semibold ${
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
  );
}

