"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Step1NameSelection from "./Step1NameSelection";
import Step2CommunicationStyle from "./Step2CommunicationStyle";
import Step3FinancialGoal from "./Step3FinancialGoal";
import Step4Completion from "./Step4Completion";

interface OnboardingFlowProps {
  userId: string;
}

export default function OnboardingFlow({ userId }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    preferredName: "",
    communicationStyle: "auto" as "formal" | "pidgin" | "auto",
    goalName: "",
    goalTarget: 0,
    goalCategory: "",
  });
  const router = useRouter();
  const supabase = createClient();

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      // Save preferred name
      await supabase
        .from("profiles")
        .update({ preferred_name: formData.preferredName })
        .eq("user_id", userId);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Save communication style
      await supabase
        .from("profiles")
        .update({ communication_style: formData.communicationStyle })
        .eq("user_id", userId);
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Save financial goal
      if (formData.goalName && formData.goalTarget > 0) {
        await supabase.from("savings_goals").insert({
          user_id: userId,
          name: formData.goalName,
          target_amount: formData.goalTarget,
          current_amount: 0,
          category: formData.goalCategory || "Other",
          status: "on_track",
        });
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleSkip = () => {
    if (currentStep === 4) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Step {currentStep} of 4
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {Math.round((currentStep / 4) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Step content */}
          {currentStep === 1 && (
            <Step1NameSelection
              preferredName={formData.preferredName}
              onUpdate={(name) => updateFormData({ preferredName: name })}
              onNext={handleNext}
              onSkip={handleSkip}
            />
          )}
          {currentStep === 2 && (
            <Step2CommunicationStyle
              communicationStyle={formData.communicationStyle}
              onUpdate={(style) => updateFormData({ communicationStyle: style })}
              onNext={handleNext}
              onSkip={handleSkip}
            />
          )}
          {currentStep === 3 && (
            <Step3FinancialGoal
              goalName={formData.goalName}
              goalTarget={formData.goalTarget}
              goalCategory={formData.goalCategory}
              onUpdate={(data) => updateFormData(data)}
              onNext={handleNext}
              onSkip={handleSkip}
            />
          )}
          {currentStep === 4 && (
            <Step4Completion
              preferredName={formData.preferredName}
              onComplete={handleNext}
            />
          )}
        </div>
      </div>
    </div>
  );
}

