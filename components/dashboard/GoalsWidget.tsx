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
    <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100/50 mb-6 card-hover">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-text-dark tracking-tight">Your Goals</h3>
        <Link href="/dashboard/goals/new">
          <button className="text-naija-green text-sm font-bold hover:text-eko-teal transition-colors duration-200">
            Add Goal +
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
            urgent: { bg: "bg-orange-100", text: "text-orange-700", label: "Urgent", border: "border-orange-200" },
            completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed", border: "border-green-200" },
            on_track: { bg: "bg-green-100", text: "text-green-700", label: "On Track", border: "border-green-200" },
          };
          const status = statusConfig[progress.status];

          return (
            <div key={goal.id} className={`border-2 ${status.border} rounded-2xl p-4 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-soft transition-all duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`w-12 h-12 ${colors.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`${colors.text} text-base`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-text-dark truncate">{goal.name}</h4>
                    {daysUntilDeadline !== null ? (
                      <p className="text-xs text-text-muted font-medium">Due in {daysUntilDeadline} days</p>
                    ) : (
                      <p className="text-xs text-text-muted font-medium">Long term</p>
                    )}
                  </div>
                </div>
                <span className={`text-xs ${status.bg} ${status.text} px-3 py-1.5 rounded-full font-bold flex-shrink-0 ml-2`}>
                  {status.label}
                </span>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between text-xs font-bold text-text-dark mb-2">
                  <span>{formatCurrency(goal.current_amount)} saved</span>
                  <span>{formatCurrency(goal.target_amount)} target</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      progress.status === "urgent"
                        ? "bg-gradient-to-r from-palm-gold to-palm-gold-light"
                        : progress.status === "completed"
                        ? "bg-gradient-to-r from-green-500 to-green-600"
                        : "bg-gradient-to-r from-naija-green to-eko-teal"
                    }`}
                    style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <p className="text-xs text-text-muted font-bold">
                {formatCurrency(progress.remaining)} more to go
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

