"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile, Expense, SavingsGoal, CommunicationStyle } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { calculateGoalProgress, calculateTotalBalance } from "@/lib/dashboard/calculations";
import {
  ArrowLeft,
  Bell,
  Edit,
  User,
  Mail,
  Key,
  Phone,
  Languages,
  DollarSign,
  Palette,
  Sun,
  Moon,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Bot,
  Trophy,
  Shield,
  Fingerprint,
  Lock,
  FileText,
  Gavel,
  Download,
  CreditCard,
  Receipt,
  Wallet,
  Database,
  RefreshCcw,
  Trash2,
  Share2,
  HelpCircle,
  Headphones,
  BookOpen,
  Star,
  Info,
  Users,
  Compass,
  Target,
  Lightbulb,
  Sparkles,
  Smartphone,
  ChevronRight,
  Sliders,
  Sprout,
  CheckCircle2,
  LogOut,
  UserX,
  Settings,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

interface SettingsContentProps {
  profile: Profile | null;
  subscription: { plan: string; status: string; expires_at?: string } | null;
  user: any;
  expenses: Expense[];
  goals: SavingsGoal[];
  survival: { balance: number } | null;
}

export default function SettingsContent({
  profile,
  subscription,
  user,
  expenses,
  goals,
  survival,
}: SettingsContentProps) {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  // State
  const [coachTone, setCoachTone] = useState<CommunicationStyle>(
    profile?.communication_style || "auto"
  );
  const [currency, setCurrency] = useState("NGN");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [budgetPeriod, setBudgetPeriod] = useState("monthly");
  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    billReminders: true,
    coachInsights: true,
    goalUpdates: false,
    emailNotifications: true,
  });
  const [security, setSecurity] = useState({
    biometric: true,
    appLock: false,
  });
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Calculate stats
  const daysActive = user?.created_at
    ? Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalTracked = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalTrackedFormatted = totalTracked >= 1000000
    ? `₦${(totalTracked / 1000000).toFixed(1)}M`
    : totalTracked >= 1000
    ? `₦${(totalTracked / 1000).toFixed(1)}K`
    : `₦${totalTracked.toLocaleString()}`;

  const avgGoalProgress = goals.length > 0
    ? Math.round(
        goals.reduce((sum, goal) => {
          const progress = calculateGoalProgress(goal);
          return sum + progress.percentage;
        }, 0) / goals.length
      )
    : 0;

  const isPremium = subscription?.plan !== "free" && subscription?.status === "active";

  // Handlers
  const savePreferences = useMemo(
    () => async () => {
      const { error } = await supabase
        .from("profiles")
        .update({
          communication_style: coachTone,
        })
        .eq("user_id", user.id);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Preferences saved successfully",
        });
        router.refresh();
      }
    },
    [coachTone, router, supabase, toast, user.id]
  );

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      setShowPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email update confirmation sent to your new email",
      });
      setShowEmailDialog(false);
      setNewEmail("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update email",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.rpc("delete_user_account");

      if (error) throw error;

      toast({
        title: "Success",
        description: "Account deleted successfully",
      });
      router.push("/auth/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    }
  };

  const handleClearCache = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      toast({
        title: "Success",
        description: "Cache cleared successfully",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    if (currency === "NGN") return `₦${amount.toLocaleString()}`;
    if (currency === "USD") return `$${amount.toLocaleString()}`;
    if (currency === "EUR") return `€${amount.toLocaleString()}`;
    return `₦${amount.toLocaleString()}`;
  };

  const getCoachToneLabel = (tone: CommunicationStyle) => {
    if (tone === "pidgin") return "Casual Pidgin";
    if (tone === "formal") return "Formal English";
    return "Auto Detect";
  };

  useEffect(() => {
    savePreferences();
  }, [savePreferences]);

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen relative overflow-hidden pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Settings</h1>
              <p className="text-xs text-gray-500">Manage your account</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">3</span>
              </div>
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-naija-green to-eko-teal flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* Profile Summary Section */}
      <section className="px-4 py-6 bg-gradient-to-br from-naija-green to-eko-teal">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white/30 bg-gradient-to-br from-naija-green to-eko-teal flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{profile?.preferred_name || user?.email?.split("@")[0] || "User"}</h2>
              <p className="text-white/80 text-sm">{user?.email}</p>
              {isPremium && (
                <div className="flex items-center space-x-2 mt-2">
                  <div className="px-2 py-1 bg-palm-gold/20 rounded-full">
                    <span className="text-xs font-medium">CashDey+ Member</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-2xl font-bold">{daysActive}</p>
              <p className="text-xs text-white/80">Days Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{totalTrackedFormatted}</p>
              <p className="text-xs text-white/80">Total Tracked</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{avgGoalProgress}%</p>
              <p className="text-xs text-white/80">Goal Progress</p>
            </div>
          </div>
        </div>
      </section>

      {/* Account Management Section */}
      <section className="px-4 py-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Account Management</h3>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/dashboard/profile")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Edit className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Edit Profile</p>
                  <p className="text-sm text-gray-500">Update your personal information</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={() => setShowEmailDialog(true)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Change Email</p>
                  <p className="text-sm text-gray-500">Update your email address</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={() => setShowPasswordDialog(true)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Key className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Change Password</p>
                  <p className="text-sm text-gray-500">Update your account password</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Phone Number</p>
                  <p className="text-sm text-gray-500">+234 803 123 4567</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </section>

      {/* App Preferences Section */}
      <section className="px-4 py-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Sliders className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">App Preferences</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <Languages className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Coach Tone</p>
                  <p className="text-sm text-gray-500">How should CashDey talk to you?</p>
                </div>
              </div>
              <select
                value={coachTone}
                onChange={(e) => setCoachTone(e.target.value as CommunicationStyle)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="pidgin">Casual Pidgin</option>
                <option value="formal">Formal English</option>
                <option value="auto">Auto Detect</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Currency Display</p>
                  <p className="text-sm text-gray-500">Default currency format</p>
                </div>
              </div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="NGN">₦ (Naira)</option>
                <option value="USD">$ (Dollar)</option>
                <option value="EUR">€ (Euro)</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <Palette className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Theme</p>
                  <p className="text-sm text-gray-500">App appearance</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setTheme("light")}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                    theme === "light"
                      ? "bg-white border-naija-green"
                      : "bg-gray-200 border-gray-300"
                  }`}
                >
                  <Sun className={`w-4 h-4 ${theme === "light" ? "text-naija-green" : "text-gray-400"}`} />
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-300"
                      : "bg-gray-200 border-gray-300"
                  }`}
                >
                  <Moon className={`w-4 h-4 ${theme === "dark" ? "text-white" : "text-gray-400"}`} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Budget Period</p>
                  <p className="text-sm text-gray-500">Default budget cycle</p>
                </div>
              </div>
              <select
                value={budgetPeriod}
                onChange={(e) => setBudgetPeriod(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Notification Settings Section */}
      <section className="px-4 py-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  {key === "budgetAlerts" && <AlertTriangle className="w-5 h-5 text-gray-600" />}
                  {key === "billReminders" && <Calendar className="w-5 h-5 text-gray-600" />}
                  {key === "coachInsights" && <Bot className="w-5 h-5 text-gray-600" />}
                  {key === "goalUpdates" && <Trophy className="w-5 h-5 text-gray-600" />}
                  {key === "emailNotifications" && <Mail className="w-5 h-5 text-gray-600" />}
                  <div>
                    <p className="font-medium text-gray-900">
                      {key === "budgetAlerts" && "Budget Alerts"}
                      {key === "billReminders" && "Bill Reminders"}
                      {key === "coachInsights" && "Coach Insights"}
                      {key === "goalUpdates" && "Goal Updates"}
                      {key === "emailNotifications" && "Email Notifications"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {key === "budgetAlerts" && "Get notified when you exceed limits"}
                      {key === "billReminders" && "Upcoming payment notifications"}
                      {key === "coachInsights" && "Smart financial tips and advice"}
                      {key === "goalUpdates" && "Progress on your savings goals"}
                      {key === "emailNotifications" && "Weekly summary reports"}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={value}
                    onChange={(e) =>
                      setNotifications({ ...notifications, [key]: e.target.checked })
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-naija-green"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & Security Section */}
      <section className="px-4 py-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Privacy & Security</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <Fingerprint className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Biometric Login</p>
                  <p className="text-sm text-gray-500">Use fingerprint or face unlock</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={security.biometric}
                  onChange={(e) =>
                    setSecurity({ ...security, biometric: e.target.checked })
                  }
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-naija-green"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">App Lock</p>
                  <p className="text-sm text-gray-500">Require PIN when opening app</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={security.appLock}
                  onChange={(e) =>
                    setSecurity({ ...security, appLock: e.target.checked })
                  }
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-naija-green"></div>
              </label>
            </div>
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Privacy Policy</p>
                  <p className="text-sm text-gray-500">How we protect your data</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Gavel className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Terms of Service</p>
                  <p className="text-sm text-gray-500">NDPA compliance & user agreement</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Export Data</p>
                  <p className="text-sm text-gray-500">Download your financial data</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </section>

      {/* Payment & Subscription Section */}
      <section className="px-4 py-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-palm-gold/20 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-palm-gold" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Payment & Subscription</h3>
          </div>
          <div className="space-y-3">
            {isPremium ? (
              <div className="p-4 bg-gradient-to-r from-palm-gold/10 to-yellow-100 rounded-xl border border-palm-gold/20">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">CashDey+ Active</p>
                    <p className="text-sm text-gray-600">
                      {subscription?.plan === "yearly" ? "Yearly" : "Monthly"} subscription
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-palm-gold">
                      ₦{subscription?.plan === "yearly" ? "29,999" : "2,999"}/mo
                    </p>
                    {subscription?.expires_at && (
                      <p className="text-xs text-gray-500">
                        Renews {new Date(subscription.expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push("/dashboard/subscription")}
                    className="flex-1 bg-white text-palm-gold border border-palm-gold px-4 py-2 rounded-lg font-medium text-sm hover:bg-palm-gold/10 transition-colors"
                  >
                    Manage Plan
                  </button>
                  {subscription?.plan === "monthly" && (
                    <button
                      onClick={() => router.push("/dashboard/subscription")}
                      className="flex-1 bg-palm-gold text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-palm-gold-light transition-colors"
                    >
                      Upgrade to Yearly
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => router.push("/dashboard/subscription")}
                className="w-full p-4 bg-gradient-to-r from-palm-gold/10 to-yellow-100 rounded-xl border border-palm-gold/20 hover:bg-palm-gold/20 transition-colors"
              >
                <div className="text-center">
                  <p className="font-semibold text-gray-900 mb-1">Upgrade to CashDey+</p>
                  <p className="text-sm text-gray-600">Get unlimited features</p>
                </div>
              </button>
            )}
            <button
              onClick={() => router.push("/dashboard/subscription")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Receipt className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Billing History</p>
                  <p className="text-sm text-gray-500">View past payments and receipts</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Payment Methods</p>
                  <p className="text-sm text-gray-500">Manage cards and bank accounts</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </section>

      {/* Data & Storage Section */}
      <section className="px-4 py-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Database className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Data & Storage</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium text-gray-900">Storage Usage</p>
                <p className="text-sm text-gray-500">2.3 MB of 50 MB</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-naija-green h-2 rounded-full" style={{ width: "4.6%" }}></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Transactions: 1.8 MB</span>
                <span>Images: 0.5 MB</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <RefreshCcw className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Sync Settings</p>
                  <p className="text-sm text-gray-500">Auto-backup and cloud sync</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={syncEnabled}
                  onChange={(e) => setSyncEnabled(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-naija-green"></div>
              </label>
            </div>
            <button
              onClick={handleClearCache}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Trash2 className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Clear Cache</p>
                  <p className="text-sm text-gray-500">Free up space on your device</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </section>

      {/* Support & Help Section */}
      <section className="px-4 py-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Support & Help</h3>
          </div>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <HelpCircle className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Help Center</p>
                  <p className="text-sm text-gray-500">FAQs and tutorials</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Headphones className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Contact Support</p>
                  <p className="text-sm text-gray-500">Get help from our team</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Rate CashDey</p>
                  <p className="text-sm text-gray-500">Share your experience</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Share2 className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Refer Friends</p>
                  <p className="text-sm text-gray-500">Earn rewards for referrals</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </section>

      {/* About & Version Section */}
      <section className="px-4 py-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-naija-green/20 rounded-full flex items-center justify-center">
              <Info className="w-5 h-5 text-naija-green" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">About CashDey</h3>
          </div>
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-naija-green rounded-2xl mx-auto mb-3 flex items-center justify-center">
                <Sprout className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-1">CashDey</h4>
              <p className="text-sm text-gray-500 mb-2">Version 2.1.0 (Build 245)</p>
              <p className="text-xs text-gray-400">Your Nigerian financial survival co-pilot</p>
            </div>
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-naija-green">50K+</p>
                <p className="text-xs text-gray-500">Active Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-naija-green">4.8</p>
                <p className="text-xs text-gray-500">App Rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-naija-green">₦2B+</p>
                <p className="text-xs text-gray-500">Money Tracked</p>
              </div>
            </div>
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">What&apos;s New</p>
                  <p className="text-sm text-gray-500">Latest features and improvements</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </section>

      {/* Danger Zone Section */}
      <section className="px-4 py-4 pb-24">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-700">Danger Zone</h3>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-200"
            >
              <div className="flex items-center space-x-3">
                <LogOut className="w-5 h-5 text-red-600" />
                <div className="text-left">
                  <p className="font-medium text-red-700">Sign Out</p>
                  <p className="text-sm text-red-500">Log out from all devices</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-red-400" />
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-200"
            >
              <div className="flex items-center space-x-3">
                <UserX className="w-5 h-5 text-red-600" />
                <div className="text-left">
                  <p className="font-medium text-red-700">Delete Account</p>
                  <p className="text-sm text-red-500">Permanently remove your data</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-red-400" />
            </button>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-yellow-600 mt-0.5" />
              <p className="text-xs text-yellow-800">
                Account deletion is permanent and cannot be undone. All your financial data will be lost.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dialogs */}
      <Dialog.Root open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold mb-4">Change Password</Dialog.Title>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  placeholder="Enter current password"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Dialog.Close asChild>
                  <button className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                </Dialog.Close>
                <button
                  onClick={handleChangePassword}
                  className="px-4 py-2 bg-naija-green text-white rounded-lg hover:bg-eko-teal transition-colors"
                >
                  Update Password
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold mb-4">Change Email</Dialog.Title>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">New Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  placeholder="Enter new email address"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Dialog.Close asChild>
                  <button className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                </Dialog.Close>
                <button
                  onClick={handleChangeEmail}
                  className="px-4 py-2 bg-naija-green text-white rounded-lg hover:bg-eko-teal transition-colors"
                >
                  Update Email
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold mb-2 text-red-700">Delete Account</Dialog.Title>
            <p className="text-sm text-gray-600 mb-6">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <Dialog.Close asChild>
                <button className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

