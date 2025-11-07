"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Search,
  Crown,
  BookOpen,
  ShieldCheck,
  BellRing,
  Rocket,
  Calculator,
  GraduationCap,
  FileOutput,
  Share2,
  Sparkles,
  CreditCard,
  Users,
  Info,
  Target,
  Lightbulb,
  Flame,
  CircleDollarSign,
  TrendingUp,
  Compass,
  Heart,
} from "lucide-react";
import ExploreTools from "@/components/explore/ExploreTools";
import MarketNews from "@/components/explore/MarketNews";
import VisualAnalyzer from "@/components/explore/VisualAnalyzer";
import { Profile, SubscriptionPlan } from "@/types";
import { Button } from "@/components/ui/button";

type ExploreView = "overview" | "tools" | "analyzer" | "news";

interface ExploreContentProps {
  profile: Profile | null;
  subscription: { plan?: SubscriptionPlan; status?: string } | null;
  user: { email?: string | null } | null;
  explorePreferences?: any;
}

export default function ExploreContent({ profile, subscription, user }: ExploreContentProps) {
  const router = useRouter();
  const [view, setView] = useState<ExploreView>("overview");
  const [search, setSearch] = useState("");

  const preferredName = useMemo(() => {
    if (profile?.preferred_name) return profile.preferred_name;
    if (user?.email) return user.email.split("@")[0];
    return "Boss";
  }, [profile?.preferred_name, user?.email]);

  const plan = subscription?.plan ?? "free";
  const isPremium = plan !== "free" && subscription?.status === "active";

  if (view === "tools") {
    return (
      <FeatureLayout title="Explore Tools" onBack={() => setView("overview")}> 
        <ExploreTools />
      </FeatureLayout>
    );
  }

  if (view === "analyzer") {
    return (
      <FeatureLayout title="Visual Analyzer" onBack={() => setView("overview")}>
        <VisualAnalyzer />
      </FeatureLayout>
    );
  }

  if (view === "news") {
    return (
      <FeatureLayout title="Market News" onBack={() => setView("overview")}>
        <MarketNews />
      </FeatureLayout>
    );
  }

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Explore</h1>
              <p className="text-xs text-gray-500">Discover features & tools</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="relative p-2 rounded-full hover:bg-gray-100" aria-label="Notifications">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 space-y-6">
        {/* Search */}
        <section>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search features, tools, or help..."
              className="w-full bg-gray-100 rounded-xl px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-naija-green focus:bg-white transition-all"
            />
          </div>
        </section>

        {/* Premium Banner */}
        <section>
          <div className="bg-gradient-to-r from-palm-gold to-yellow-500 rounded-2xl p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">{isPremium ? "CashDey+ Member" : "Free Plan"}</h3>
                <p className="text-xs text-white/90">
                  {isPremium ? "Enjoy all premium features" : "Limited features available"}
                </p>
              </div>
            </div>
            {!isPremium && (
              <Button
                size="sm"
                className="bg-white text-palm-gold hover:bg-white/90"
                onClick={() => router.push("/dashboard/subscription")}
              >
                Upgrade
              </Button>
            )}
          </div>
        </section>

        {/* Main features grid */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Main Features</h2>
          <div className="grid grid-cols-2 gap-3">
            <GradientFeatureCard
              title="Upgrade to CashDey+"
              subtitle="Unlock premium features"
              accent="from-naija-green to-eko-teal"
              icon={<Rocket className="h-5 w-5 text-white" />}
              footer={<span className="text-xs">Starting <span className="font-bold">₦2,999/mo</span></span>}
              onClick={() => router.push("/dashboard/subscription")}
            />

            <PreviewCard
              title="Financial Dictionary"
              subtitle="Learn Naija money terms"
              icon={<BookOpen className="h-5 w-5 text-blue-600" />}
              meta="150+ terms"
            />

            <PreviewCard
              title="Security Center"
              subtitle="Privacy & data protection"
              icon={<ShieldCheck className="h-5 w-5 text-green-600" />}
              meta="All secure"
            />

            <PreviewCard
              title="Smart Reminders"
              subtitle="Never miss a payment"
              icon={<BellRing className="h-5 w-5 text-orange-600" />}
              meta="5 active"
            />
          </div>
        </section>

        {/* Advanced tools shortcuts */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Advanced Tools</h2>
          <FeatureShortcut
            title="Explore Tools"
            description="Deeper insights and market intelligence"
            icon={<Compass className="h-5 w-5 text-naija-green" />}
            onOpen={() => setView("tools")}
          />
          <FeatureShortcut
            title="Visual Analyzer"
            description="Get financial insights from images"
            icon={<Sparkles className="h-5 w-5 text-naija-green" />}
            onOpen={() => setView("analyzer")}
          />
          <FeatureShortcut
            title="Market News"
            description="Real-time financial news and analysis"
            icon={<TrendingUp className="h-5 w-5 text-naija-green" />}
            onOpen={() => setView("news")}
          />
        </section>

        {/* Tools & calculators */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Tools & Calculators</h2>
          <SimpleListItem icon={<Calculator className="h-5 w-5 text-purple-600" />} title="Budget Calculator" subtitle="Plan your monthly spending" />
          <SimpleListItem icon={<Target className="h-5 w-5 text-blue-600" />} title="Savings Goal Tracker" subtitle="Track your financial goals" />
          <SimpleListItem icon={<CircleDollarSign className="h-5 w-5 text-green-600" />} title="Emergency Fund Calculator" subtitle="How much should you save?" />
          <SimpleListItem icon={<Flame className="h-5 w-5 text-red-500" />} title="Interest Calculator" subtitle="Loan & investment returns" />
        </section>

        {/* Learning Hub */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Learning Hub</h2>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Financial Literacy</h3>
                <p className="text-sm text-gray-600">Master your money skills</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: "Budgeting 101", read: "5 min read" },
                { title: "Saving Tips", read: "3 min read" },
                { title: "Investment Basics", read: "8 min read" },
                { title: "Debt Management", read: "6 min read" },
              ].map((lesson) => (
                <button key={lesson.title} className="bg-white rounded-lg p-3 text-left shadow-sm">
                  <h4 className="font-medium text-sm text-gray-900">{lesson.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{lesson.read}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            <QuickAction icon={<FileOutput className="h-5 w-5 text-red-600" />} label="Export Data" />
            <QuickAction icon={<Sparkles className="h-5 w-5 text-blue-600" />} label="Sync Data" />
            <QuickAction icon={<Share2 className="h-5 w-5 text-green-600" />} label="Share App" />
          </div>
        </section>

        {/* Coming soon */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Coming Soon</h2>
          <ComingSoonItem icon={<CreditCard className="h-5 w-5 text-gray-500" />} title="Bill Pay Integration" subtitle="Pay bills directly from the app" />
          <ComingSoonItem icon={<Users className="h-5 w-5 text-gray-500" />} title="Family Budgets" subtitle="Shared expense tracking" />
          <ComingSoonItem icon={<Sparkles className="h-5 w-5 text-gray-500" />} title="Advanced Analytics" subtitle="Detailed spending insights" />
        </section>

        {/* Support */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Support & Help</h2>
          <SupportItem icon={<Info className="h-5 w-5 text-blue-600" />} title="FAQ" subtitle="Common questions answered" />
          <SupportItem icon={<ShieldCheck className="h-5 w-5 text-green-600" />} title="Contact Support" subtitle="Get help from our team" />
          <SupportItem icon={<BookOpen className="h-5 w-5 text-purple-600" />} title="User Guide" subtitle="Learn how to use CashDey" />
          <SupportItem icon={<Heart className="h-5 w-5 text-yellow-600" />} title="Rate CashDey" subtitle="Share your experience" />
        </section>

        {/* Community */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Join the Community</h2>
          <div className="bg-gradient-to-r from-naija-green to-eko-teal rounded-2xl p-6 text-white">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">CashDey Community</h3>
                <p className="text-sm text-white/90">Connect with other users</p>
              </div>
            </div>
            <p className="text-sm text-white/90 mb-4">
              Share tips, ask questions, and learn from fellow Nigerians on their financial journey.
            </p>
            <div className="flex space-x-3">
              <button className="flex-1 bg-white/20 rounded-lg py-2 px-4 text-sm font-medium">Telegram</button>
              <button className="flex-1 bg-white/20 rounded-lg py-2 px-4 text-sm font-medium">WhatsApp</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureLayout({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <div className="max-w-sm mx-auto bg-light-bg min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100" aria-label="Back to Explore">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          <div className="w-8" />
        </div>
      </header>
      <div className="px-4 py-6 space-y-6">{children}</div>
    </div>
  );
}

function GradientFeatureCard({
  title,
  subtitle,
  accent,
  icon,
  footer,
  onClick,
}: {
  title: string;
  subtitle: string;
  accent: string;
  icon: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-br ${accent} rounded-2xl p-4 text-left text-white relative overflow-hidden`}
    >
      <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
      <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-white/10 rounded-full" />
      <div className="relative z-10 space-y-3">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">{icon}</div>
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs text-white/90">{subtitle}</p>
        </div>
        {footer && <div className="text-xs">{footer}</div>}
      </div>
    </button>
  );
}

function PreviewCard({
  title,
  subtitle,
  icon,
  meta,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  meta?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">{icon}</div>
      <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
      <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
      {meta && <span className="text-xs text-blue-600">{meta}</span>}
    </div>
  );
}

function FeatureShortcut({ title, description, icon, onOpen }: { title: string; description: string; icon: React.ReactNode; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between text-left"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-naija-green/10 rounded-full flex items-center justify-center text-naija-green">{icon}</div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <span className="text-xs text-naija-green font-medium">Open</span>
    </button>
  );
}

function SimpleListItem({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">{icon}</div>
        <div>
          <h4 className="font-medium text-sm text-gray-900">{title}</h4>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      <Compass className="h-4 w-4 text-gray-400" />
    </div>
  );
}

function QuickAction({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col items-center space-y-2">
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">{icon}</div>
      <span className="text-xs font-medium text-gray-700 text-center">{label}</span>
    </button>
  );
}

function ComingSoonItem({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 opacity-70 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">{icon}</div>
        <div>
          <h4 className="font-medium text-sm text-gray-700">{title}</h4>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Soon</span>
    </div>
  );
}

function SupportItem({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <button className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">{icon}</div>
        <div>
          <h4 className="font-medium text-sm text-gray-900">{title}</h4>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      <Info className="h-4 w-4 text-gray-400" />
    </button>
  );
}
