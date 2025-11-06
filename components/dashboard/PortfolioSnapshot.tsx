"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PortfolioSnapshotProps {
  totalValue?: number;
  changePercent?: number;
}

// Mock data - in production, this would come from props or database
const defaultPortfolio = {
  totalValue: 876112,
  changePercent: 2.5,
};

export default function PortfolioSnapshot({
  totalValue = defaultPortfolio.totalValue,
  changePercent = defaultPortfolio.changePercent,
}: PortfolioSnapshotProps) {
  const isPositive = changePercent >= 0;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Portfolio Snapshot</CardTitle>
          <Link href="/dashboard/portfolio">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Value */}
          <div>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-2xl font-bold">{formatCurrency(totalValue)}</span>
              <div className={`flex items-center gap-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="font-semibold text-sm">
                  {isPositive ? "+" : ""}
                  {changePercent}%
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Total Value</p>
          </div>

          {/* Quick Breakdown */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Stocks (NGX)</p>
              <p className="font-semibold text-sm">{formatCurrency(550000)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Crypto</p>
              <p className="font-semibold text-sm">{formatCurrency(150000)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Mutual Funds</p>
              <p className="font-semibold text-sm">{formatCurrency(176112)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

