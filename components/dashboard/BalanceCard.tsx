"use client";

import { formatCurrency } from "@/lib/utils";

interface BalanceCardProps {
  balance: number;
  burnRate: number;
  daysRemaining: number | null;
}

export default function BalanceCard({
  balance,
  burnRate,
  daysRemaining,
}: BalanceCardProps) {
  const progressPercentage = daysRemaining !== null 
    ? Math.min((daysRemaining / 90) * 100, 100) 
    : 0;

  return (
    <div className="bg-gradient-to-br from-naija-green to-eko-teal rounded-3xl p-6 shadow-custom relative overflow-hidden mb-6">
      {/* Decorative circle */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm font-medium mb-1">Total Balance</p>
            <h2 className="text-white text-3xl font-bold">{formatCurrency(balance)}</h2>
          </div>
          <div className="text-4xl">😊</div>
        </div>
        
        <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/90 text-sm">Burn Rate</span>
            <span className="text-white font-semibold">{formatCurrency(burnRate)}/day</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 mb-2">
            <div 
              className="bg-white h-2 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          {daysRemaining !== null && (
            <p className="text-white/90 text-xs">
              You fit last {daysRemaining} more days at this rate
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

