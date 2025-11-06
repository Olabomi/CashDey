"use client";

import { formatCurrency } from "@/lib/utils";
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

const categoryColors: { [key: string]: { bg: string; text: string } } = {
  "House Rent": { bg: "bg-palm-gold/10", text: "text-palm-gold" },
  "Emergency Fund": { bg: "bg-green-100", text: "text-green-600" },
};

export default function GoalsWidget({ goals }: GoalsWidgetProps) {
  if (goals.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-dark">Your Goals</h3>
        <Link href="/dashboard/goals/new">
          <button className="text-naija-green text-sm font-semibold hover:underline">
            Add Goal
          </button>
        </Link>
      </div>
      
      <div className="space-y-4">
        {goals.slice(0, 2).map((goal) => {
          const progress = calculateGoalProgress(goal);
          const Icon = categoryIcons[goal.name] || categoryIcons[goal.category] || PiggyBank;
          const colors = categoryColors[goal.name] || categoryColors[goal.category] || { bg: "bg-gray-100", text: "text-gray-600" };
          const daysUntilDeadline = goal.deadline
            ? Math.ceil(
                (new Date(goal.deadline).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : null;

          const statusConfig = {
            urgent: { bg: "bg-orange-100", text: "text-orange-800", label: "Urgent" },
            completed: { bg: "bg-green-100", text: "text-green-800", label: "Completed" },
            on_track: { bg: "bg-green-100", text: "text-green-800", label: "On Track" },
          };
          const status = statusConfig[progress.status];

          return (
            <div key={goal.id} className="border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${colors.bg} rounded-full flex items-center justify-center`}>
                    <Icon className={`${colors.text} text-sm`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-text-dark">{goal.name}</h4>
                    {daysUntilDeadline !== null ? (
                      <p className="text-xs text-gray-500">Due in {daysUntilDeadline} days</p>
                    ) : (
                      <p className="text-xs text-gray-500">Long term</p>
                    )}
                  </div>
                </div>
                <span className={`text-xs ${status.bg} ${status.text} px-2 py-1 rounded-full font-medium`}>
                  {status.label}
                </span>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{formatCurrency(goal.current_amount)} saved</span>
                  <span>{formatCurrency(goal.target_amount)} target</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      progress.status === "urgent"
                        ? "bg-palm-gold"
                        : progress.status === "completed"
                        ? "bg-green-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <p className="text-xs text-gray-500">
                {formatCurrency(progress.remaining)} more to go
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

