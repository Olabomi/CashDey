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
    <div className="bg-gradient-to-br from-naija-green via-naija-green to-eko-teal rounded-3xl p-6 shadow-elevated shadow-glow relative overflow-hidden mb-6 animate-fade-in">
      {/* Animated decorative circles */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-12 -mt-12 animate-pulse-slow"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-8 -mb-8"></div>
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white opacity-5 rounded-full"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div className="animate-slide-up">
            <p className="text-white/90 text-sm font-medium mb-2 tracking-wide">Total Balance</p>
            <h2 className="text-white text-4xl font-bold tracking-tight">{formatCurrency(balance)}</h2>
          </div>
          <div className="text-5xl animate-bounce-subtle">😊</div>
        </div>
        
        <div className="bg-white/25 rounded-2xl p-4 backdrop-blur-md border border-white/20 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/95 text-sm font-medium">Daily Burn Rate</span>
            <span className="text-white font-bold text-base">{formatCurrency(burnRate)}/day</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5 mb-3 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          {daysRemaining !== null && (
            <p className="text-white/95 text-xs font-medium">
              You fit last <span className="font-bold">{daysRemaining}</span> more days at this rate
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

