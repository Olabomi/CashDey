"use client";

import { Card, CardContent } from "@/components/ui/card";
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
  return (
    <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white mb-4">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm mb-1">Total Balance</p>
            <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
            <div className="mt-4">
              <p className="text-green-100 text-sm">Burn Rate</p>
              <p className="text-xl font-semibold">{formatCurrency(burnRate)}/day</p>
            </div>
            {daysRemaining !== null && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-green-400/30 rounded-full h-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((daysRemaining / 90) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-sm text-green-100">
                    You fit last {daysRemaining} more days at this rate.
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="text-4xl">😊</div>
        </div>
      </CardContent>
    </Card>
  );
}

