"use client";

import Link from "next/link";
import { Bot } from "lucide-react";

interface CoachInsightsProps {
  insight?: string;
}

export default function CoachInsights({ insight }: CoachInsightsProps) {
  const defaultInsight = "Boss, your food spending don increase by 12% this week o! Maybe na time to cook more at home? 🍳";

  const displayInsight = insight || defaultInsight;

  return (
    <div className="bg-gradient-to-br from-palm-gold/10 to-palm-gold/5 rounded-2xl p-6 border border-palm-gold/20 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-palm-gold rounded-full flex items-center justify-center">
          <Bot className="text-white text-lg" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-text-dark">Coach Says</h3>
          <p className="text-xs text-gray-600">AI Financial Advisor</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 mb-4">
        <p className="text-sm text-text-dark mb-3">&quot;{displayInsight}&quot;</p>
        <div className="flex space-x-2">
          <Link href="/dashboard/coach">
            <button className="bg-naija-green/10 text-naija-green px-3 py-2 rounded-xl text-xs font-medium hover:bg-naija-green/20 transition-colors">
              Tell me more
            </button>
          </Link>
          <button className="bg-gray-100 text-gray-600 px-3 py-2 rounded-xl text-xs font-medium hover:bg-gray-200 transition-colors">
            Set reminder
          </button>
        </div>
      </div>

      <Link href="/dashboard/coach">
        <button className="w-full py-3 bg-palm-gold text-white font-semibold text-sm rounded-xl hover:bg-palm-gold/90 transition-colors">
          Chat with Coach
        </button>
      </Link>
    </div>
  );
}

