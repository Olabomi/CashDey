"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Shield, Smartphone, Plane, Building2, GraduationCap, Car, Heart, TrendingUp } from "lucide-react";
import { GOAL_CATEGORIES } from "@/types";

interface Step3FinancialGoalProps {
  goalName: string;
  goalTarget: number;
  goalCategory: string;
  onUpdate: (data: { goalName?: string; goalTarget?: number; goalCategory?: string }) => void;
  onNext: () => void;
  onSkip: () => void;
}

const popularGoals = [
  { name: "House Rent", icon: Home, avg: 150000, category: "House Rent" },
  { name: "Emergency Fund", icon: Shield, avg: 200000, category: "Emergency Fund" },
  { name: "New Gadget", icon: Smartphone, avg: 80000, category: "New Gadget" },
  { name: "Vacation", icon: Plane, avg: 100000, category: "Vacation" },
];

const moreGoals = [
  { name: "Start Business", icon: Building2, avg: 500000, category: "Start Business" },
  { name: "Education", icon: GraduationCap, avg: 300000, category: "Education" },
  { name: "Buy Car", icon: Car, avg: 1500000, category: "Buy Car" },
  { name: "Wedding", icon: Heart, avg: 800000, category: "Wedding" },
  { name: "Investment", icon: TrendingUp, avg: 250000, category: "Investment" },
];

export default function Step3FinancialGoal({
  goalName,
  goalTarget,
  goalCategory,
  onUpdate,
  onNext,
  onSkip,
}: Step3FinancialGoalProps) {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState("");

  const handleGoalSelect = (goal: typeof popularGoals[0] | typeof moreGoals[0]) => {
    setSelectedGoal(goal.name);
    onUpdate({
      goalName: goal.name,
      goalTarget: goal.avg,
      goalCategory: goal.category,
    });
    setCustomAmount(goal.avg.toString());
  };

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value.replace(/,/g, ""));
    if (!isNaN(numValue) && numValue > 0) {
      onUpdate({ goalTarget: numValue });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Set Your Financial Goal</CardTitle>
        <CardDescription>
          Choose what you want to achieve with your money. We&apos;ll help you reach it!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="mb-3 block">Popular Goals</Label>
          <div className="grid grid-cols-2 gap-3">
            {popularGoals.map((goal) => {
              const Icon = goal.icon;
              const isSelected = selectedGoal === goal.name;
              return (
                <button
                  key={goal.name}
                  onClick={() => handleGoalSelect(goal)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 hover:border-primary/50"
                  }`}
                >
                  <Icon className="w-6 h-6 mb-2" />
                  <div className="font-semibold">{goal.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Avg: ₦{goal.avg.toLocaleString()}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label className="mb-3 block">More Goals</Label>
          <div className="space-y-2">
            {moreGoals.map((goal) => {
              const Icon = goal.icon;
              const isSelected = selectedGoal === goal.name;
              return (
                <button
                  key={goal.name}
                  onClick={() => handleGoalSelect(goal)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left flex items-center justify-between ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <div>
                      <div className="font-semibold">{goal.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Avg: ₦{goal.avg.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {(selectedGoal || goalName) && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="amount">Target Amount (₦)</Label>
              <Input
                id="amount"
                type="text"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => handleCustomAmount(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={onNext}
            disabled={!goalName || !goalTarget || goalTarget <= 0}
            className="flex-1"
          >
            Continue to Next Step
          </Button>
          <Button onClick={onSkip} variant="outline">
            Skip for now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

