"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  X,
  Crown,
  CheckCircle2,
  XCircle,
  LineChart,
  InfinityIcon,
  PieChart,
  FileText,
  ShieldCheck,
  Bot,
  Users,
  Star,
  CreditCard,
  Wallet,
  PhoneCall,
  Shield,
  Info,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

interface SubscriptionContentProps {
  subscription: {
    plan?: "free" | "monthly" | "yearly";
    status?: "active" | "inactive" | "cancelled";
    expires_at?: string | null;
  } | null;
}

type PaidPlan = "monthly" | "yearly";

type FeatureValue = boolean | string | ReactNode;

const plans = [
  {
    id: "free" as const,
    name: "Free",
    price: 0,
    cadenceLabel: "per month",
    badge: "Current Plan",
    description: "Limited features • Upgrade to unlock more",
    borderClass: "border border-gray-200 bg-gray-50",
    highlight: false,
    perks: [
      { label: "Basic expense tracking", available: true },
      { label: "Simple budget overview", available: true },
      { label: "Limited coach responses (100 words)", available: false },
      { label: "Basic analytics only", available: false },
    ],
  },
  {
    id: "monthly" as const,
    name: "Monthly",
    price: 2999,
    cadenceLabel: "per month",
    badge: "Most Popular",
    description: "Unlimited coach • Advanced analytics",
    borderClass: "border-2 border-naija-green bg-white",
    highlight: true,
    perks: [
      { label: "Everything in Free", available: true },
      { label: "Unlimited coach conversations", available: true },
      { label: "Advanced spending analytics", available: true },
      { label: "Custom budget categories", available: true },
      { label: "Export financial reports", available: true },
    ],
  },
  {
    id: "yearly" as const,
    name: "Yearly",
    price: 29999,
    cadenceLabel: "per year",
    badge: "Save 17%",
    description: "₦2,500/month when paid yearly",
    borderClass: "border border-palm-gold bg-white",
    highlight: false,
    perks: [
      { label: "Everything in Monthly", available: true },
      { label: "Priority customer support", available: true },
      { label: "Early access to new features", available: true },
      { label: "Annual financial health report", available: true },
    ],
  },
];

const featureMatrix: Array<{
  feature: string;
  free: FeatureValue;
  premium: FeatureValue;
}> = [
  { feature: "Basic expense tracking", free: true, premium: true },
  { feature: "Coach conversations", free: "Limited", premium: <InfinityIcon className="mx-auto h-4 w-4 text-naija-green" /> },
  { feature: "Advanced analytics", free: false, premium: true },
  { feature: "Custom categories", free: false, premium: true },
  { feature: "Export reports", free: false, premium: true },
  { feature: "Priority support", free: false, premium: true },
];

const premiumBenefits = [
  {
    title: "Unlimited Coach Access",
    description:
      "Ask your financial coach anything, anytime. Get detailed responses and personalized advice in Nigerian Pidgin or formal English.",
    icon: Bot,
    gradient: "from-green-50 to-emerald-50",
    border: "border-green-100",
  },
  {
    title: "Advanced Analytics",
    description:
      "Deep dive into your spending patterns with detailed charts, trends analysis, and predictive insights to help you save more.",
    icon: LineChart,
    gradient: "from-blue-50 to-cyan-50",
    border: "border-blue-100",
  },
  {
    title: "Custom Categories",
    description:
      "Create personalized spending categories that match your lifestyle. Track suya money, transport, or any expense that matters to you.",
    icon: PieChart,
    gradient: "from-purple-50 to-indigo-50",
    border: "border-purple-100",
  },
  {
    title: "Export Reports",
    description:
      "Download detailed financial reports for tax purposes, loan applications, or personal record keeping. PDF and Excel formats available.",
    icon: FileText,
    gradient: "from-orange-50 to-red-50",
    border: "border-orange-100",
  },
];

const testimonials = [
  {
    name: "Funmi A.",
    quote:
      "CashDey+ helped me save ₦150,000 in 6 months! The coach insights are so detailed and practical.",
    avatar: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg",
  },
  {
    name: "Kemi O.",
    quote:
      "The analytics showed me I was spending too much on transport. Now I budget better and save more!",
    avatar: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg",
  },
];

const paymentMethods = [
  { label: "Card", icon: CreditCard },
  { label: "Bank Transfer", icon: Wallet },
  { label: "USSD", icon: PhoneCall },
];

const faqs = [
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, you can cancel your subscription anytime from your profile settings. No hidden fees or cancellation charges.",
  },
  {
    question: "Is my bank data secure?",
    answer:
      "We use bank-level 256-bit SSL encryption and never store your banking passwords. All data is NDPA compliant.",
  },
  {
    question: "What if I change my mind?",
    answer:
      "We offer a 7-day money-back guarantee. If you're not satisfied, contact support for a full refund.",
  },
];

export default function SubscriptionContent({ subscription }: SubscriptionContentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<PaidPlan | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PaidPlan | null>(
    subscription?.plan && subscription.plan !== "free" ? subscription.plan : "monthly"
  );

  const currentPlan = subscription?.plan ?? "free";
  const isPremium = currentPlan !== "free" && subscription?.status === "active";

  const currentPlanLabel = useMemo(() => {
    if (currentPlan === "monthly") return "Monthly";
    if (currentPlan === "yearly") return "Yearly";
    return "Free";
  }, [currentPlan]);

  const handleUpgrade = async (plan: PaidPlan) => {
    setLoadingPlan(plan);
    try {
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to initialize payment");
      }

      const data = await response.json();

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
        return;
      }

      toast({
        title: "Almost there",
        description: "We couldn't redirect you automatically. Please try again.",
      });
    } catch (error: any) {
      toast({
        title: "Payment error",
        description: error.message || "We couldn't start the upgrade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleStartTrial = () => {
    setSelectedPlan("monthly");
    handleUpgrade("monthly");
  };

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen relative overflow-hidden pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Upgrade to CashDey+</h1>
              <p className="text-xs text-gray-500">Choose your plan</p>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-6 bg-gradient-to-br from-naija-green to-eko-teal text-white text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Unlock Your Financial Potential</h2>
        <p className="text-white/90 text-sm mb-6">
          Get unlimited insights, advanced analytics, and personalized coaching to master your money like a boss!
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <CheckCircle2 className="h-4 w-4 text-green-300" />
            <span>Unlimited Coach</span>
          </div>
          <div className="flex items-center space-x-1">
            <LineChart className="h-4 w-4 text-blue-200" />
            <span>Advanced Analytics</span>
          </div>
        </div>
      </section>

      {/* Current Plan */}
      <section className="px-4 py-4">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Current Plan: {currentPlanLabel}</p>
            <p className="text-sm text-gray-600">
              {isPremium ? "Enjoying CashDey+ perks" : "Limited features • Upgrade to unlock more"}
            </p>
          </div>
        </div>
      </section>

      {/* Plan Comparison */}
      <section className="px-4 py-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Plan</h3>
        <div className="space-y-4">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const isSelected = selectedPlan === plan.id;
            const isFree = plan.id === "free";
            const isYearly = plan.id === "yearly";
            const priceLabel = plan.price === 0 ? "₦0" : formatCurrency(plan.price);

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 transition-shadow ${plan.borderClass} ${
                  plan.highlight ? "shadow-lg" : "shadow-sm"
                } ${isSelected ? "ring-2 ring-naija-green" : ""}`}
              >
                {plan.badge && (
                  <span
                    className={`absolute -top-3 ${
                      plan.id === "monthly" ? "left-1/2 -translate-x-1/2" : "right-4"
                    } rounded-full px-4 py-1 text-xs font-medium ${
                      plan.id === "yearly" ? "bg-palm-gold text-white" : "bg-naija-green text-white"
                    }`}
                  >
                    {plan.badge}
                  </span>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-2xl font-bold text-gray-900">{priceLabel}</p>
                      <span className="text-sm font-normal text-gray-500">{plan.cadenceLabel}</span>
                      {plan.id === "yearly" && (
                        <span className="text-xs text-gray-500 line-through">₦35,988</span>
                      )}
                    </div>
                    {plan.id === "yearly" && (
                      <p className="text-sm text-palm-gold font-medium">{plan.description}</p>
                    )}
                  </div>
                  {!isFree && (
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? "border-naija-green" : "border-gray-300"
                      }`}
                    >
                      {isSelected && <div className="w-3 h-3 bg-naija-green rounded-full" />}
                    </div>
                  )}
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.perks.map((perk) => (
                    <li key={perk.label} className="flex items-center space-x-3 text-sm">
                      {perk.available ? (
                        <CheckCircle2 className="h-4 w-4 text-naija-green" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      <span className={perk.available ? "text-gray-700" : "text-gray-400"}>{perk.label}</span>
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <Button disabled variant={isFree ? "outline" : "default"} className="w-full">
                    Current Plan
                  </Button>
                ) : isFree ? (
                  <Button disabled variant="outline" className="w-full">
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setSelectedPlan(plan.id);
                      handleUpgrade(plan.id);
                    }}
                    disabled={loadingPlan !== null}
                    className={`w-full ${isYearly ? "bg-palm-gold hover:bg-palm-gold/90" : ""}`}
                  >
                    {loadingPlan === plan.id ? "Redirecting..." : `Select ${plan.name} Plan`}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Matrix */}
      <section className="px-4 py-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Comparison</h3>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 font-medium text-gray-900">Features</th>
                  <th className="text-center py-3 font-medium text-gray-500">Free</th>
                  <th className="text-center py-3 font-medium text-naija-green">Premium</th>
                </tr>
              </thead>
              <tbody>
                {featureMatrix.map((row) => (
                  <tr key={row.feature} className="border-b border-gray-100 last:border-b-0">
                    <td className="py-3 text-gray-700 text-left">{row.feature}</td>
                    <td className="py-3 text-center">
                      {row.free === true && <CheckCircle2 className="mx-auto h-4 w-4 text-green-500" />}
                      {row.free === false && <XCircle className="mx-auto h-4 w-4 text-red-400" />}
                      {typeof row.free === "string" && row.free !== "limited" && (
                        <span className="text-gray-500 text-xs">{row.free}</span>
                      )}
                      {typeof row.free === "string" && row.free === "Limited" && (
                        <span className="text-gray-400 text-xs">Limited</span>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      {row.premium === true && <CheckCircle2 className="mx-auto h-4 w-4 text-naija-green" />}
                      {row.premium === false && <XCircle className="mx-auto h-4 w-4 text-red-400" />}
                      {typeof row.premium === "string" && (
                        <span className="text-naija-green text-xs font-medium">{row.premium}</span>
                      )}
                      {typeof row.premium !== "boolean" && typeof row.premium !== "string" && row.premium}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Premium Benefits */}
      <section className="px-4 py-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What You&apos;ll Get</h3>
        <div className="space-y-4">
          {premiumBenefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className={`rounded-xl p-4 border ${benefit.border} bg-gradient-to-r ${benefit.gradient}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-naija-green" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{benefit.title}</h4>
                    <p className="text-sm text-gray-700">{benefit.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What Our Users Say</h3>
        <div className="space-y-4">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
              <div className="flex items-start space-x-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h5 className="font-semibold text-gray-900">{testimonial.name}</h5>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, index) => (
                        <Star key={index} className="h-3 w-3 text-yellow-400" fill="#FACC15" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">“{testimonial.quote}”</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Payment Methods */}
      <section className="px-4 py-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="grid grid-cols-3 gap-4">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <div
                  key={method.label}
                  className="flex flex-col items-center p-3 border border-gray-200 rounded-lg"
                >
                  <Icon className="h-6 w-6 text-naija-green mb-2" />
                  <span className="text-xs text-gray-600 text-center">{method.label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Secure payments powered by Paystack</p>
            <div className="flex items-center justify-center space-x-2 mt-2 text-xs text-gray-500">
              <Shield className="h-4 w-4 text-green-500" />
              <span>SSL Encrypted • NDPA Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="px-4 py-4">
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Your Data is Safe</h4>
          <p className="text-sm text-gray-700 mb-4">
            Bank-level security with 256-bit SSL encryption. NDPA compliant data protection for all Nigerian users.
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <Lock className="h-3.5 w-3.5 text-green-500" />
              <span>Encrypted</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              <span>NDPA Compliant</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="h-3.5 w-3.5 text-green-500" />
              <span>Secure Servers</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked</h3>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details key={faq.question} className="bg-white rounded-xl p-4 border border-gray-200">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h5 className="font-medium text-gray-900">{faq.question}</h5>
                <Info className="h-4 w-4 text-gray-400" />
              </summary>
              <p className="text-sm text-gray-600 mt-2">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 py-6 pb-24">
        <div className="bg-gradient-to-r from-naija-green to-eko-teal rounded-2xl p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Ready to Level Up?</h3>
          <p className="text-white/90 text-sm mb-6">
            Join thousands of Nigerians already crushing their financial goals with CashDey+
          </p>
          <button
            onClick={handleStartTrial}
            className="w-full bg-white text-naija-green py-4 rounded-xl font-semibold text-lg mb-3 hover:bg-gray-100 transition-colors"
            disabled={loadingPlan !== null}
          >
            {loadingPlan === "monthly" ? "Redirecting..." : "Start Free Trial - 7 Days"}
          </button>
          <p className="text-xs text-white/80">No commitment • Cancel anytime • Full refund guarantee</p>
        </div>
      </section>
    </div>
  );
}

