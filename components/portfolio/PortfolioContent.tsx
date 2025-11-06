"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface PortfolioItem {
  type: "stocks" | "crypto" | "mutual_funds";
  label: string;
  amount: number;
  color: string;
  bgColor: string;
}

interface PortfolioData {
  totalValue: number;
  changePercent: number;
  items: PortfolioItem[];
}

// Mock data - in production, this would come from a database
const mockPortfolioData: PortfolioData = {
  totalValue: 876112,
  changePercent: 2.5,
  items: [
    {
      type: "stocks",
      label: "Stocks (NGX)",
      amount: 550000,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      type: "crypto",
      label: "Crypto",
      amount: 150000,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      type: "mutual_funds",
      label: "Mutual Funds",
      amount: 176112,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ],
};

export default function PortfolioContent() {
  const portfolio = mockPortfolioData;
  const isPositive = portfolio.changePercent >= 0;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Portfolio</h1>

      {/* Portfolio Snapshot Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Portfolio Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Total Value */}
            <div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold">{formatCurrency(portfolio.totalValue)}</span>
                <div className={`flex items-center gap-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
                  {isPositive ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  <span className="font-semibold">
                    {isPositive ? "+" : ""}
                    {portfolio.changePercent}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </div>

            {/* Portfolio Breakdown */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Breakdown</h3>
              {portfolio.items.map((item) => {
                const percentage = (item.amount / portfolio.totalValue) * 100;
                return (
                  <div key={item.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                          <BarChart3 className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div>
                          <p className="font-semibold">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}% of portfolio</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(item.amount)}</p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.bgColor.replace("50", "500")}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Insights</CardTitle>
          <CardDescription>Your investment performance overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              Your portfolio is diversified across {portfolio.items.length} asset classes, providing a balanced approach to wealth building.
            </p>
            <p>
              Consider reviewing your allocation regularly to ensure it aligns with your financial goals.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

