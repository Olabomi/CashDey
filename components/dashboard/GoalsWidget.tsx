"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SavingsGoal } from "@/types";
import { calculateGoalProgress } from "@/lib/dashboard/calculations";
import { Home, PiggyBank } from "lucide-react";

interface GoalsWidgetProps {
  goals: SavingsGoal[];
}

const categoryIcons: { [key: string]: any } = {
  "House Rent": Home,
  "Emergency Fund": PiggyBank,
};

export default function GoalsWidget({ goals }: GoalsWidgetProps) {
  if (goals.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Goals</CardTitle>
          <Link href="/dashboard/goals">
            <Button variant="ghost" size="sm">
              Add Goal
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.slice(0, 2).map((goal) => {
            const progress = calculateGoalProgress(goal);
            const Icon = categoryIcons[goal.category] || PiggyBank;
            const daysUntilDeadline = goal.deadline
              ? Math.ceil(
                  (new Date(goal.deadline).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : null;

            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-sm">{goal.name}</p>
                      {daysUntilDeadline !== null && (
                        <p className="text-xs text-muted-foreground">
                          Due in {daysUntilDeadline} days
                        </p>
                      )}
                      {!goal.deadline && (
                        <p className="text-xs text-muted-foreground">Long term</p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      progress.status === "urgent"
                        ? "bg-orange-100 text-orange-800"
                        : progress.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {progress.status === "urgent"
                      ? "Urgent"
                      : progress.status === "completed"
                      ? "Completed"
                      : "On Track"}
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      {formatCurrency(goal.current_amount)} saved
                    </span>
                    <span className="font-bold text-lg">
                      {Math.round(progress.percentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        progress.status === "urgent"
                          ? "bg-orange-500"
                          : progress.status === "completed"
                          ? "bg-green-500"
                          : "bg-primary"
                      }`}
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{formatCurrency(progress.remaining)} more to go</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

