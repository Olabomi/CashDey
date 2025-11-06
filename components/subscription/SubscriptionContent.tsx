"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface SubscriptionContentProps {
  subscription: any;
}

export default function SubscriptionContent({ subscription }: SubscriptionContentProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpgrade = async (plan: "monthly" | "yearly") => {
    setLoading(true);
    try {
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = subscription?.plan || "free";
  const isPremium = currentPlan !== "free";

  const plans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      period: "forever",
      features: [
        "Basic expense tracking",
        "Simple budget overview",
        "Limited coach insights (100 words)",
      ],
      notIncluded: [
        "Advanced analytics",
        "Unlimited coach conversations",
        "Custom financial goals",
      ],
    },
    {
      id: "monthly",
      name: "Monthly",
      price: 2999,
      period: "month",
      popular: true,
      features: [
        "Everything in Free",
        "Unlimited coach insights",
        "Advanced spending analytics",
        "Custom financial goals",
        "Priority support",
        "Export financial reports",
      ],
    },
    {
      id: "yearly",
      name: "Yearly",
      price: 29999,
      period: "year",
      savings: 5000,
      features: [
        "Everything in Monthly",
        "50% discount (₦2,500/month)",
        "Exclusive yearly insights report",
        "Early access to new features",
        "Dedicated account manager",
        "Free financial consultation call",
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="text-center mb-8">
        <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
        <h1 className="text-3xl font-bold mb-2">Upgrade to CashDey+</h1>
        <p className="text-muted-foreground">
          Get unlimited coach insights, advanced analytics, and premium features
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`${
              plan.popular ? "border-primary border-2" : ""
            } ${currentPlan === plan.id ? "bg-primary/5" : ""}`}
          >
            <CardHeader>
              {plan.popular && (
                <span className="text-xs font-semibold text-primary mb-2">
                  POPULAR
                </span>
              )}
              <CardTitle>{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-3xl font-bold">
                  {plan.price === 0 ? "₦0" : `₦${plan.price.toLocaleString()}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-muted-foreground">/{plan.period}</span>
                )}
              </div>
              {plan.savings && (
                <p className="text-sm text-green-600 mt-2">
                  Save ₦{plan.savings.toLocaleString()}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
                {(plan as any).notIncluded?.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-red-500">×</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {currentPlan === plan.id ? (
                <Button disabled className="w-full">
                  Current Plan
                </Button>
              ) : plan.id === "free" ? (
                <Button variant="outline" disabled className="w-full">
                  Current Plan
                </Button>
              ) : (
                <Button
                  onClick={() => handleUpgrade(plan.id as "monthly" | "yearly")}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Processing..." : `Choose ${plan.name} Plan`}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

