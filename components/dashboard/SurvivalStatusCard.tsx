"use client";

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
      textColor: "text-green-800",
      textSecondary: "text-green-600",
    },
    warning: {
      message: "Boss, make we watch your spending small. Money dey go quick!",
      emoji: "⚠️",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-800",
      textSecondary: "text-yellow-600",
    },
    critical: {
      message: "Omo! Things tight. Make we cut cost sharp sharp!",
      emoji: "🚨",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-800",
      textSecondary: "text-red-600",
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-2xl p-4 flex items-center space-x-3 mb-6`}>
      <div className="text-2xl">{config.emoji}</div>
      <div className="flex-1">
        <h3 className={`${config.textColor} font-semibold text-sm`}>
          Survival Status: {status.charAt(0).toUpperCase() + status.slice(1)}
        </h3>
        <p className={`${config.textSecondary} text-xs`}>{config.message}</p>
      </div>
    </div>
  );
}

