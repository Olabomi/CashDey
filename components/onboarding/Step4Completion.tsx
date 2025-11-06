"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, TrendingUp, Brain, PiggyBank, Bell } from "lucide-react";

interface Step4CompletionProps {
  preferredName: string;
  onComplete: () => void;
}

export default function Step4Completion({ preferredName, onComplete }: Step4CompletionProps) {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <CardTitle className="text-3xl">
          Chei! You Don Set Am!
        </CardTitle>
        <CardDescription className="text-lg">
          Welcome to your financial freedom journey
        </CardDescription>
        <p className="text-sm text-muted-foreground mt-2">
          CashDey is now ready to be your personal money survival coach.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="font-semibold mb-3">Your Setup Complete!</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>We&apos;ll call you &apos;{preferredName}&apos; as requested</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Communication style selected</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Financial goal set</span>
            </div>
          </div>
        </div>

        <div>
          <p className="font-semibold mb-3">What&apos;s Next?</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted rounded-lg">
              <TrendingUp className="w-5 h-5 mb-2" />
              <p className="text-sm font-medium">Track Spending</p>
              <p className="text-xs text-muted-foreground">
                Monitor your daily expenses easily
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <Brain className="w-5 h-5 mb-2" />
              <p className="text-sm font-medium">AI Coach</p>
              <p className="text-xs text-muted-foreground">
                Get personalized financial advice
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <PiggyBank className="w-5 h-5 mb-2" />
              <p className="text-sm font-medium">Save Smart</p>
              <p className="text-xs text-muted-foreground">
                Reach your goals faster
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <Bell className="w-5 h-5 mb-2" />
              <p className="text-sm font-medium">Get Alerts</p>
              <p className="text-xs text-muted-foreground">
                Never miss important deadlines
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg">
          <p className="font-semibold mb-2">Quick Start Tips</p>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Log your first expense - even if it&apos;s just ₦50 for pure water!</li>
            <li>Add your current account balance so CashDey can help you budget properly</li>
            <li>Try asking your coach: &quot;How much should I save monthly?&quot;</li>
          </ol>
        </div>

        <Button onClick={onComplete} className="w-full" size="lg">
          Continue to CashDey →
        </Button>
      </CardContent>
    </Card>
  );
}

