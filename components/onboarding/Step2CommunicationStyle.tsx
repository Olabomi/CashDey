"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Heart, Sparkles } from "lucide-react";

interface Step2CommunicationStyleProps {
  communicationStyle: "formal" | "pidgin" | "auto";
  onUpdate: (style: "formal" | "pidgin" | "auto") => void;
  onNext: () => void;
  onSkip: () => void;
}

export default function Step2CommunicationStyle({
  communicationStyle,
  onUpdate,
  onNext,
  onSkip,
}: Step2CommunicationStyleProps) {
  const styles = [
    {
      id: "formal" as const,
      icon: Briefcase,
      title: "Formal & Professional",
      subtitle: "Business-like communication",
      example: "Good morning! Your spending analysis shows a 15% increase in food expenses this week. I recommend creating a meal budget to optimize your finances.",
      tags: ["Professional", "Structured", "Clear"],
    },
    {
      id: "pidgin" as const,
      icon: Heart,
      title: "Casual Pidgin",
      subtitle: "Friendly Nigerian style",
      example: "Boss, your food money don increase by 15% this week o! Maybe na time to plan your meals well so money no go finish quick quick 😉",
      tags: ["Friendly", "Local", "Relatable"],
    },
    {
      id: "auto" as const,
      icon: Sparkles,
      title: "Auto Adaptive",
      subtitle: "Smart tone matching",
      example: "I'll match your communication style! Formal for business topics, casual for daily chats, and always respectful of your preferences.",
      tags: ["Adaptive", "Smart", "Flexible"],
      recommended: true,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Choose Your Communication Style</CardTitle>
        <CardDescription>
          How should your CashDey coach talk to you? Pick what matches your vibe.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {styles.map((style) => {
          const Icon = style.icon;
          const isSelected = communicationStyle === style.id;
          return (
            <button
              key={style.id}
              onClick={() => onUpdate(style.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-gray-200 hover:border-primary/50"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Icon className="w-6 h-6" />
                  <div>
                    <div className="font-semibold">{style.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {style.subtitle}
                    </div>
                  </div>
                </div>
                {style.recommended && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3">{style.example}</p>
              <div className="flex gap-2 flex-wrap">
                {style.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-muted rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {isSelected && (
                <div className="mt-3 text-sm text-primary font-medium">
                  ✓ Selected
                </div>
              )}
            </button>
          );
        })}

        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium mb-1">Most Popular Choice</p>
          <p className="text-xs text-muted-foreground">
            85% of users prefer Casual Pidgin for daily conversations
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={onNext} className="flex-1">
            Continue to Goals
          </Button>
          <Button onClick={onSkip} variant="outline">
            Skip for now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

