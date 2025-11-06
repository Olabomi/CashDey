"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles } from "lucide-react";

interface Perk {
  id: string;
  title: string;
  description: string;
  discount?: string;
  badge?: string;
  actionLabel: string;
}

const perks: Perk[] = [
  {
    id: "1",
    title: "15% off Bolt rides",
    description: "Exclusive for CashDey users this weekend. Ride smart, save money.",
    discount: "15%",
    badge: "Weekend Special",
    actionLabel: "Claim Perk",
  },
];

export default function LatestPerks() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <CardTitle>Latest Perks</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {perks.map((perk) => (
            <div
              key={perk.id}
              className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  {perk.badge && (
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-yellow-200 text-yellow-800 rounded-full mb-2">
                      {perk.badge}
                    </span>
                  )}
                  <h3 className="font-semibold text-lg mb-1">{perk.title}</h3>
                  <CardDescription className="text-sm">{perk.description}</CardDescription>
                </div>
                {perk.discount && (
                  <div className="ml-4 text-right">
                    <div className="text-2xl font-bold text-yellow-600">{perk.discount}</div>
                    <div className="text-xs text-muted-foreground">OFF</div>
                  </div>
                )}
              </div>
              <Button className="w-full mt-3" variant="default">
                <Gift className="w-4 h-4 mr-2" />
                {perk.actionLabel}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

