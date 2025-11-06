"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface WeeklySpendingWidgetProps {
  weeklySpending: { [category: string]: { amount: number; count: number } };
}

const categoryIcons: { [key: string]: string } = {
  "Food & Drinks": "🍽️",
  Transport: "🚗",
  Shopping: "🛍️",
  Bills: "💡",
  Entertainment: "🎬",
  Education: "📚",
  Healthcare: "🏥",
  Rent: "🏠",
  Utilities: "⚡",
  Other: "📦",
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
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>This Week&apos;s Spending</CardTitle>
            <p className="text-sm text-muted-foreground">{getWeekRange()}</p>
          </div>
          <Link href="/dashboard/wallet">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedCategories.slice(0, 3).map(([category, data]) => (
            <div
              key={category}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{categoryIcons[category] || "📦"}</span>
                <div>
                  <p className="font-medium text-sm">{category}</p>
                  <p className="text-xs text-muted-foreground">
                    {data.count} transaction{data.count !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(data.amount)}</p>
              </div>
            </div>
          ))}
        </div>
        <Link href="/dashboard/wallet">
          <Button variant="outline" className="w-full mt-4">
            View Full Breakdown
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

