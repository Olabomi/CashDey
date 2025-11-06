"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Expense } from "@/types";
import { getMonthlySpending } from "@/lib/dashboard/calculations";

interface SpendingChartProps {
  expenses: Expense[];
}

export default function SpendingChart({ expenses }: SpendingChartProps) {
  const monthlySpending = getMonthlySpending(expenses);
  
  // Simple visual representation - you can enhance this with a chart library later
  const maxAmount = 200000; // Adjust based on typical spending
  const percentage = Math.min((monthlySpending / maxAmount) * 100, 100);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Spending Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-3xl font-bold">{formatCurrency(monthlySpending)}</div>
          
          {/* Visual bar chart */}
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          {/* Chart legend */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>₦0</span>
            <span>₦{maxAmount.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

