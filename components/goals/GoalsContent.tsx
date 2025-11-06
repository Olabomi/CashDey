"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { SavingsGoal } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { calculateGoalProgress } from "@/lib/dashboard/calculations";

interface GoalsContentProps {
  goals: SavingsGoal[];
}

export default function GoalsContent({ goals }: GoalsContentProps) {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Goals</h1>
        <Link href="/dashboard/goals/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        </Link>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No goals yet</p>
            <Link href="/dashboard/goals/new">
              <Button>Create Your First Goal</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = calculateGoalProgress(goal);
            return (
              <Card key={goal.id}>
                <CardHeader>
                  <CardTitle>{goal.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(goal.current_amount)} saved
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(goal.target_amount)} target
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(progress.remaining)} more to go
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

