"use client";

import { Lightbulb, TrendingUp } from "lucide-react";

const tips = [
  {
    icon: Lightbulb,
    title: "What is Esusu?",
    description: "Traditional Nigerian saving system where groups contribute money regularly...",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: TrendingUp,
    title: "Understanding MPR",
    description: "Monetary Policy Rate affects your savings and loan interest rates...",
    color: "bg-green-100 text-green-600",
  },
];

export default function MoneyTips() {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-text-dark mb-4">Money Tips</h3>
      <div className="space-y-3">
        {tips.map((tip, index) => {
          const Icon = tip.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 flex items-start space-x-3"
            >
              <div className={`w-8 h-8 ${tip.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                <Icon className="text-sm" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-text-dark mb-1">{tip.title}</h4>
                <p className="text-xs text-gray-600 mb-2">{tip.description}</p>
                <button className="text-naija-green text-xs font-medium hover:underline">
                  Read More
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

