"use client";

import { Card, CardContent } from "@/components/ui/card";

interface SurvivalStatusCardProps {
  status: "balanced" | "warning" | "critical";
}

export default function SurvivalStatusCard({ status }: SurvivalStatusCardProps) {
  const statusConfig = {
    balanced: {
      message: "Your money dey flow well. Keep am up!",
      emoji: "😊",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    warning: {
      message: "Boss, make we watch your spending small. Money dey go quick!",
      emoji: "⚠️",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    critical: {
      message: "Omo! Things tight. Make we cut cost sharp sharp!",
      emoji: "🚨",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
  };

  const config = statusConfig[status];

  return (
    <Card className={`${config.bgColor} ${config.borderColor} mb-4`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.emoji}</span>
          <div>
            <p className="font-semibold">Survival Status: {status.charAt(0).toUpperCase() + status.slice(1)}</p>
            <p className="text-sm text-muted-foreground">{config.message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

