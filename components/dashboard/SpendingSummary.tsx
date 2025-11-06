"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Expense } from "@/types";
import { getMonthlySpending } from "@/lib/dashboard/calculations";

interface SpendingSummaryProps {
  expenses: Expense[];
}

export default function SpendingSummary({ expenses }: SpendingSummaryProps) {
  const monthlySpending = getMonthlySpending(expenses);
  const now = new Date();
  const monthName = now.toLocaleDateString("en-NG", { month: "long" });

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Spending Summary</CardTitle>
        <p className="text-sm text-muted-foreground">This month so far</p>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{formatCurrency(monthlySpending)}</div>
        <p className="text-sm text-muted-foreground mt-1">Total spent in {monthName}</p>
      </CardContent>
    </Card>
  );
}

