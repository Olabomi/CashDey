"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, User, UserCircle, Heart } from "lucide-react";

interface Step1NameSelectionProps {
  preferredName: string;
  onUpdate: (name: string) => void;
  onNext: () => void;
  onSkip: () => void;
}

export default function Step1NameSelection({
  preferredName,
  onUpdate,
  onNext,
  onSkip,
}: Step1NameSelectionProps) {
  const [customName, setCustomName] = useState("");
  const quickOptions = [
    { name: "Boss", icon: Crown, description: "Professional vibes" },
    { name: "Madam", icon: User, description: "Respectful tone" },
    { name: "Chief", icon: UserCircle, description: "Traditional respect" },
    { name: "Friend", icon: Heart, description: "Casual & friendly" },
  ];

  const handleSelect = (name: string) => {
    onUpdate(name);
    setCustomName("");
  };

  const handleCustomName = () => {
    if (customName.trim().length >= 2 && customName.trim().length <= 20) {
      onUpdate(customName.trim());
    }
  };

  const canProceed = preferredName.length >= 2;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">What should I call you?</CardTitle>
        <CardDescription>
          Choose how you&apos;d like me to address you. Don&apos;t worry, you can change this anytime in your profile settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick options */}
        <div>
          <Label className="mb-3 block">Quick Options</Label>
          <div className="grid grid-cols-2 gap-3">
            {quickOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = preferredName === option.name;
              return (
                <button
                  key={option.name}
                  onClick={() => handleSelect(option.name)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 hover:border-primary/50"
                  }`}
                >
                  <Icon className="w-6 h-6 mb-2" />
                  <div className="font-semibold">{option.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {option.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">OR</span>
          </div>
        </div>

        {/* Custom name input */}
        <div className="space-y-2">
          <Label htmlFor="customName">Enter Your Preferred Name</Label>
          <Input
            id="customName"
            placeholder="e.g., Chidi, Amaka, Tunde..."
            value={customName}
            onChange={(e) => {
              setCustomName(e.target.value);
              if (e.target.value.trim().length >= 2) {
                onUpdate(e.target.value.trim());
              }
            }}
            maxLength={20}
          />
          <p className="text-xs text-muted-foreground">
            {customName.length}/20 characters
          </p>
        </div>

        {/* Preview */}
        {preferredName && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Preview: How I&apos;ll greet you</p>
            <p className="text-sm text-muted-foreground">
              &quot;Good morning, {preferredName}! Your money dey flow well today o!&quot;
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={onNext} disabled={!canProceed} className="flex-1">
            Continue
          </Button>
          <Button onClick={onSkip} variant="outline">
            Skip for now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

