"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  ArrowLeft,
  Settings,
  CheckCheck,
  CheckCircle2,
  Trophy,
  AlarmClock,
  Lightbulb,
  Info,
  Bell,
  Mail,
  Smartphone,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type NotificationCategory = "all" | "success" | "reminder" | "insight" | "achievement";
type NotificationSection = "today" | "yesterday" | "week" | "older";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  section: NotificationSection;
  category: Exclude<NotificationCategory, "all">;
  cta?: string;
  unread?: boolean;
}

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "goal-50",
    title: "Goal Achievement! 🎉",
    body: "Congratulations Boss! You&apos;ve reached 50% of your Emergency Fund goal. Keep am up!",
    timestamp: "2 hours ago",
    section: "today",
    category: "achievement",
    cta: "View Goal",
    unread: true,
  },
  {
    id: "rent-reminder",
    title: "Rent Payment Reminder",
    body: "Your rent payment of ₦45,000 is due in 5 days. Make sure your account get enough balance o!",
    timestamp: "4 hours ago",
    section: "today",
    category: "reminder",
    cta: "Set Reminder",
    unread: true,
  },
  {
    id: "salary-success",
    title: "Transaction Successful",
    body: "Your salary payment of ₦150,000 has been added to your wallet successfully.",
    timestamp: "6 hours ago",
    section: "today",
    category: "success",
    cta: "View Details",
    unread: true,
  },
  {
    id: "spending-insight",
    title: "Smart Spending Insight",
    body: "Your food spending increased by 15% this week. Consider meal planning to save ₦3,000 monthly!",
    timestamp: "8 hours ago",
    section: "today",
    category: "insight",
    cta: "Ask Coach",
    unread: true,
  },
  {
    id: "food-budget-alert",
    title: "Budget Alert",
    body: "You&apos;ve exceeded your monthly food budget by ₦2,500. Time to adjust your spending, Boss!",
    timestamp: "Yesterday, 3:45 PM",
    section: "yesterday",
    category: "reminder",
    cta: "View Budget",
  },
  {
    id: "utility-reminder",
    title: "Electricity Bill Due",
    body: "Your NEPA bill of ₦8,500 is due in 12 days. Don&apos;t let them take light from you o!",
    timestamp: "Yesterday, 10:30 AM",
    section: "yesterday",
    category: "reminder",
    cta: "Pay Now",
  },
  {
    id: "coach-tip",
    title: "Coach Tip of the Day",
    body: '"Small money wey you save today na big money for tomorrow. Start with ₦500 daily, Boss!"',
    timestamp: "Yesterday, 8:00 AM",
    section: "yesterday",
    category: "insight",
    cta: "Chat with Coach",
  },
  {
    id: "savings-milestone",
    title: "Savings Milestone Reached!",
    body: "You&apos;ve successfully saved ₦15,000 this month. Your laptop fund is growing strong, Boss!",
    timestamp: "3 days ago",
    section: "week",
    category: "achievement",
    cta: "View Progress",
  },
  {
    id: "security-update",
    title: "Security Update",
    body: "New login from iPhone 13. If this wasn&apos;t you, please secure your account immediately.",
    timestamp: "4 days ago",
    section: "week",
    category: "reminder",
    cta: "Review Activity",
  },
  {
    id: "feature-update",
    title: "New Feature Available!",
    body: "Try our new expense categorization feature. It automatically sorts your spending for better insights.",
    timestamp: "5 days ago",
    section: "week",
    category: "insight",
    cta: "Try Now",
  },
  {
    id: "welcome",
    title: "Welcome to CashDey, Boss!",
    body: "We&apos;re excited to help you manage your money like a pro. Let&apos;s start this financial journey together!",
    timestamp: "2 weeks ago",
    section: "older",
    category: "insight",
    cta: "Get Started",
  },
  {
    id: "account-verified",
    title: "Account Verified Successfully",
    body: "Your BVN and account details have been verified. You can now enjoy all CashDey features!",
    timestamp: "2 weeks ago",
    section: "older",
    category: "success",
    cta: "View Profile",
  },
];

const CATEGORY_CONFIG: Record<Exclude<NotificationCategory, "all">, { label: string; icon: ReactNode; color: string }> = {
  success: {
    label: "Success",
    icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    color: "border-green-500",
  },
  reminder: {
    label: "Reminders",
    icon: <Bell className="h-4 w-4 text-orange-500" />,
    color: "border-orange-500",
  },
  insight: {
    label: "Insights",
    icon: <Lightbulb className="h-4 w-4 text-purple-500" />,
    color: "border-purple-500",
  },
  achievement: {
    label: "Achievements",
    icon: <Trophy className="h-4 w-4 text-yellow-500" />,
    color: "border-yellow-500",
  },
};

const SECTION_LABELS: Record<NotificationSection, string> = {
  today: "Today",
  yesterday: "Yesterday",
  week: "This Week",
  older: "Older",
};

const preferenceDefaults = {
  push: true,
  email: false,
  sms: true,
};

export default function NotificationsPanel() {
  const router = useRouter();
  const { toast } = useToast();

  const [activeCategory, setActiveCategory] = useState<NotificationCategory>("all");
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [preferences, setPreferences] = useState(preferenceDefaults);

  const filteredNotifications = useMemo(() => {
    if (activeCategory === "all") {
      return notifications;
    }
    return notifications.filter((notification) => notification.category === activeCategory);
  }, [notifications, activeCategory]);

  const groupedNotifications = useMemo(() => {
    return filteredNotifications.reduce(
      (groups, notification) => {
        if (!groups[notification.section]) {
          groups[notification.section] = [];
        }
        groups[notification.section]!.push(notification);
        return groups;
      },
      {} as Record<NotificationSection, NotificationItem[]>
    );
  }, [filteredNotifications]);

  const categoryCounts = useMemo(() => {
    const counts: Record<NotificationCategory, number> = {
      all: notifications.length,
      success: 0,
      reminder: 0,
      insight: 0,
      achievement: 0,
    };
    notifications.forEach((notification) => {
      counts[notification.category] += 1;
    });
    return counts;
  }, [notifications]);

  const markAllRead = () => {
    const next = notifications.map((notification) => ({ ...notification, unread: false }));
    setNotifications(next);
    toast({
      title: "All caught up",
      description: "Every notification has been marked as read.",
    });
  };

  const togglePreference = (key: keyof typeof preferenceDefaults) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isEmpty = filteredNotifications.length === 0;

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen relative overflow-hidden pb-28">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40" aria-hidden="true"></div>

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-4">
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
                <h1 className="text-lg font-bold text-gray-900">Notifications</h1>
                <p className="text-xs text-gray-500">Stay updated, Boss!</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Notification settings">
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
              <button className="text-naija-green text-sm font-medium" onClick={markAllRead}>
                Mark All Read
              </button>
            </div>
          </div>
        </header>

        {/* Category filters */}
        <section className="px-4 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {([
              { key: "all", label: "All" },
              ...Object.entries(CATEGORY_CONFIG).map(([key, value]) => ({ key, ...value })),
            ] as Array<{ key: NotificationCategory; label: string; icon?: ReactNode }>).map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={clsx(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center space-x-2 border",
                  activeCategory === category.key
                    ? "bg-naija-green text-white border-naija-green"
                    : "bg-white border-gray-200 text-gray-700"
                )}
              >
                {category.icon}
                <span>{category.label}</span>
                <span
                  className={clsx(
                    "px-2 py-0.5 text-xs rounded-full",
                    activeCategory === category.key ? "bg-white/20" : "bg-gray-100"
                  )}
                >
                  {categoryCounts[category.key] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Notifications list */}
        <div className="px-4 py-4 space-y-8">
          {(Object.keys(SECTION_LABELS) as NotificationSection[]).map((section) => {
            const items = groupedNotifications[section];
            if (!items || items.length === 0) {
              return null;
            }

            return (
              <section key={section} className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  {SECTION_LABELS[section]}
                </h3>
                {items.map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))}
              </section>
            );
          })}

          {isEmpty && (
            <section className="py-12 text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Bell className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet, Boss!</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                When you start using CashDey, your important updates and insights will appear here.
              </p>
              <Button className="bg-naija-green text-white">Start Using CashDey</Button>
            </section>
          )}
        </div>

        {/* Notification preferences */}
        <section className="px-4 py-6 border-t border-gray-200 bg-gray-50">
          <Card className="p-4 border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-3">Notification Preferences</h4>
            <div className="space-y-3">
              <PreferenceToggle
                label="Push Notifications"
                icon={<Bell className="h-4 w-4 text-gray-400" />}
                enabled={preferences.push}
                onToggle={() => togglePreference("push")}
              />
              <PreferenceToggle
                label="Email Notifications"
                icon={<EnvelopeIcon />}
                enabled={preferences.email}
                onToggle={() => togglePreference("email")}
              />
              <PreferenceToggle
                label="SMS Alerts"
                icon={<SmartphoneIcon />}
                enabled={preferences.sms}
                onToggle={() => togglePreference("sms")}
              />
            </div>
          </Card>
        </section>

        {/* Actions */}
        <section className="px-4 py-6 bg-white border-t border-gray-200 sticky bottom-0">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12 flex items-center justify-center space-x-2 text-gray-700">
              <Archive className="h-4 w-4" />
              <span>Archive All</span>
            </Button>
            <Button className="h-12 bg-naija-green text-white" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4 mr-2" /> Mark All Read
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function NotificationCard({ notification }: { notification: NotificationItem }) {
  const icon = getNotificationIcon(notification.category);
  const accent = getNotificationAccent(notification.category);

  return (
    <div
      className={clsx(
        "rounded-lg p-4 relative border",
        notification.unread ? "shadow-sm" : "border-gray-200",
        accent.container
      )}
    >
      {notification.unread && (
        <div className={clsx("absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse", accent.dotColor)} />
      )}
      <div className="flex items-start space-x-3">
        <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center", accent.iconBackground)}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{notification.title}</h4>
          <p className="text-sm text-gray-700 mb-2">{notification.body}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{notification.timestamp}</span>
            {notification.cta && (
              <button className={clsx("text-xs font-medium", accent.ctaColor)}>{notification.cta}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PreferenceToggle({
  label,
  icon,
  enabled,
  onToggle,
}: {
  label: string;
  icon: ReactNode;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3 text-sm text-gray-700">
        {icon}
        <span>{label}</span>
      </div>
      <button
        onClick={onToggle}
        className={clsx(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
          enabled ? "bg-naija-green" : "bg-gray-200"
        )}
      >
        <span
          className={clsx(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            enabled ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
}

function EnvelopeIcon() {
  return <Mail className="h-4 w-4 text-gray-400" />;
}

function SmartphoneIcon() {
  return <Smartphone className="h-4 w-4 text-gray-400" />;
}

function getNotificationIcon(category: NotificationItem["category"]) {
  switch (category) {
    case "achievement":
      return <Trophy className="h-5 w-5 text-yellow-600" />;
    case "reminder":
      return <AlarmClock className="h-5 w-5 text-orange-600" />;
    case "success":
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case "insight":
      return <Lightbulb className="h-5 w-5 text-purple-600" />;
    default:
      return <Info className="h-5 w-5 text-gray-600" />;
  }
}

function getNotificationAccent(category: NotificationItem["category"]) {
  switch (category) {
    case "achievement":
      return {
        container: "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200",
        iconBackground: "bg-yellow-100",
        ctaColor: "text-yellow-600",
        dotColor: "bg-yellow-400",
      };
    case "reminder":
      return {
        container: "bg-white border-gray-200",
        iconBackground: "bg-orange-100",
        ctaColor: "text-orange-600",
        dotColor: "bg-orange-500",
      };
    case "success":
      return {
        container: "bg-green-50 border-green-200",
        iconBackground: "bg-green-100",
        ctaColor: "text-green-600",
        dotColor: "bg-green-500",
      };
    case "insight":
      return {
        container: "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200",
        iconBackground: "bg-purple-100",
        ctaColor: "text-purple-600",
        dotColor: "bg-purple-500",
      };
    default:
      return {
        container: "bg-white border-gray-200",
        iconBackground: "bg-gray-100",
        ctaColor: "text-naija-green",
        dotColor: "bg-naija-green",
      };
  }
}
