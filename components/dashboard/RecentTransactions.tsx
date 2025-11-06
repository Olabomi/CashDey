"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Expense } from "@/types";
import { ShoppingCart, Car, ArrowDown, Play } from "lucide-react";

interface RecentTransactionsProps {
  expenses: Expense[];
}

const categoryIcons: { [key: string]: any } = {
  "Food & Drinks": "🍽️",
  Transport: Car,
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

    if (diffInHours < 24) {
      return "Today";
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return formatDate(date);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Link href="/dashboard/wallet">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {expenses.map((expense) => {
            const Icon =
              typeof categoryIcons[expense.category] === "string"
                ? null
                : categoryIcons[expense.category];
            const iconEmoji =
              typeof categoryIcons[expense.category] === "string"
                ? categoryIcons[expense.category]
                : null;

            return (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  {Icon ? (
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="text-2xl">{iconEmoji}</div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{expense.description || expense.category}</p>
                    <p className="text-xs text-muted-foreground">
                      {getRelativeTime(expense.date)}
                    </p>
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
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

