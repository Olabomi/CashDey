"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Target, Bot } from "lucide-react";

const actions = [
  {
    icon: Plus,
    label: "Add Expense",
    description: "Track your spending",
    href: "/dashboard/expenses/new",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: Target,
    label: "Set Savings Goal",
    description: "Plan your future",
    href: "/dashboard/goals/new",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Bot,
    label: "Talk to Advisor",
    description: "Get advice",
    href: "/dashboard/coach",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
];

export default function QuickActions() {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} href={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className={`w-12 h-12 ${action.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                    <Icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <p className="font-semibold text-sm">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

