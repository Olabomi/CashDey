"use client";

import Link from "next/link";
import { Plus, TrendingUp, Bot, Bell } from "lucide-react";

const actions = [
  {
    icon: Plus,
    label: "Log Expense",
    description: "Track your spending",
    href: "/dashboard/expenses/new",
    color: "text-naija-green",
    bgColor: "bg-naija-green/10",
  },
  {
    icon: TrendingUp,
    label: "See Report",
    description: "View analytics",
    href: "/dashboard/wallet",
    color: "text-eko-teal",
    bgColor: "bg-eko-teal/10",
  },
  {
    icon: Bot,
    label: "Ask Coach",
    description: "Get advice",
    href: "/dashboard/coach",
    color: "text-palm-gold",
    bgColor: "bg-palm-gold/10",
  },
  {
    icon: Bell,
    label: "Remind Me",
    description: "Set alerts",
    href: "/dashboard/profile",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
];

export default function QuickActions() {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-text-dark mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} href={action.href}>
              <button className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-shadow w-full text-left">
                <div className={`w-12 h-12 ${action.bgColor} rounded-2xl flex items-center justify-center mb-3 mx-auto`}>
                  <Icon className={`${action.color} text-lg`} />
                </div>
                <h4 className="font-semibold text-sm text-text-dark mb-1">{action.label}</h4>
                <p className="text-xs text-gray-500">{action.description}</p>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

