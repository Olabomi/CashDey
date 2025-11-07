"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Expense } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Bell,
  Search,
  Eye,
  EyeOff,
  CalendarDays,
  TrendingUp,
  Receipt,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Utensils,
  Bus,
  ShoppingBag,
  PiggyBank,
  Film,
  HeartPulse,
  Gift,
  Wifi,
  MoreHorizontal,
  Plus,
  Wallet,
  Home,
  Compass,
  MessageCircle,
  User,
} from "lucide-react";
import {
  format,
  isSameMonth,
  isAfter,
  isBefore,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  differenceInCalendarDays,
  parseISO,
  isWithinInterval,
  subDays,
} from "date-fns";
import clsx from "clsx";

interface WalletContentProps {
  expenses: Expense[];
  initialBalance: number;
}

export default function WalletContent({ expenses, initialBalance }: WalletContentProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [showBalance, setShowBalance] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));
  const [showAddModal, setShowAddModal] = useState(false);

  const handleSaveTransaction = () => {
    toast({
      title: "Coming soon",
      description: "Manual transaction entry will arrive in a future update.",
    });
    setShowAddModal(false);
  };

  const monthRange = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    return { start, end };
  }, [selectedMonth]);

  const monthExpenses = useMemo(
    () =>
      expenses.filter((expense) =>
        isWithinInterval(parseISO(expense.date), {
          start: monthRange.start,
          end: monthRange.end,
        })
      ),
    [expenses, monthRange]
  );

  const totalBalance = useMemo(() => {
    const incomeTotal = expenses
      .filter((expense) => expense.type === "income")
      .reduce((sum, expense) => sum + Number(expense.amount), initialBalance);
    const expenseTotal = expenses
      .filter((expense) => expense.type === "expense")
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
    return incomeTotal - expenseTotal;
  }, [expenses, initialBalance]);

  const monthlyIncome = useMemo(
    () =>
      monthExpenses
        .filter((expense) => expense.type === "income")
        .reduce((sum, expense) => sum + Number(expense.amount), 0),
    [monthExpenses]
  );

  const monthlyExpenses = useMemo(
    () =>
      monthExpenses
        .filter((expense) => expense.type === "expense")
        .reduce((sum, expense) => sum + Number(expense.amount), 0),
    [monthExpenses]
  );

  const monthlySavings = monthlyIncome - monthlyExpenses;

  const filteredTransactions = useMemo(() => {
    return monthExpenses.filter((expense) => {
      const matchesFilter = filter === "all" || expense.type === filter;
      const matchesSearch =
        !searchTerm.trim() ||
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [monthExpenses, filter, searchTerm]);

  const groupedTransactions = useMemo(() => {
    const groups = new Map<
      string,
      {
        label: string;
        total: number;
        count: number;
        items: Expense[];
      }
    >();

    filteredTransactions.forEach((expense) => {
      const date = parseISO(expense.date);
      const key = format(date, "yyyy-MM-dd");
      const label = format(date, "EEEE, MMM d");
      const amount = Number(expense.amount);
      const contribution = expense.type === "income" ? amount : -amount;

      if (!groups.has(key)) {
        groups.set(key, { label, total: contribution, count: 1, items: [expense] });
      } else {
        const existing = groups.get(key)!;
        existing.total += contribution;
        existing.count += 1;
        existing.items.push(expense);
      }
    });

    return Array.from(groups.entries())
      .sort((a, b) => (a[0] > b[0] ? -1 : 1))
      .map(([key, value]) => ({ key, ...value }));
  }, [filteredTransactions]);

  const thisWeekSpending = useMemo(() => {
    const start = subDays(new Date(), 6);
    return monthExpenses
      .filter(
        (expense) =>
          expense.type === "expense" &&
          isWithinInterval(parseISO(expense.date), {
            start,
            end: new Date(),
          })
      )
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
  }, [monthExpenses]);

  const transactionCount = filteredTransactions.length;

  const averageDailySpend = useMemo(() => {
    const today = new Date();
    const periodEnd = isSameMonth(today, selectedMonth) ? today : monthRange.end;
    const daysSoFar = Math.max(differenceInCalendarDays(periodEnd, monthRange.start) + 1, 1);
    return monthlyExpenses / daysSoFar;
  }, [monthlyExpenses, monthRange, selectedMonth]);

  const categoryBreakdown = useMemo(() => {
    const totals = new Map<string, number>();
    monthExpenses
      .filter((expense) => expense.type === "expense")
      .forEach((expense) => {
        const amount = Number(expense.amount);
        totals.set(expense.category, (totals.get(expense.category) || 0) + amount);
      });

    const sorted = Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const totalAmount = sorted.reduce((sum, [, value]) => sum + value, 0);

    const colorPalette = ["bg-orange-500", "bg-blue-500", "bg-purple-500", "bg-green-500"];

    return sorted.map(([category, amount], index) => ({
      category,
      amount,
      percent: totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0,
      color: colorPalette[index % colorPalette.length],
    }));
  }, [monthExpenses]);

  const categoryIcons: Record<string, ReactNode> = {
    "Food & Drinks": <Utensils className="h-4 w-4 text-orange-600" />,
    Transportation: <Bus className="h-4 w-4 text-blue-600" />,
    Shopping: <ShoppingBag className="h-4 w-4 text-purple-600" />,
    Bills: <Wifi className="h-4 w-4 text-indigo-600" />,
    Health: <HeartPulse className="h-4 w-4 text-rose-600" />,
    Entertainment: <Film className="h-4 w-4 text-pink-600" />,
    Donations: <Gift className="h-4 w-4 text-amber-600" />,
    Savings: <PiggyBank className="h-4 w-4 text-emerald-600" />,
    Income: <TrendingUp className="h-4 w-4 text-emerald-600" />,
    Other: <Wallet className="h-4 w-4 text-gray-600" />,
  };

  const getTransactionIcon = (expense: Expense) => {
    const category = expense.category;
    if (categoryIcons[category]) {
      return categoryIcons[category];
    }
    if (expense.type === "income") {
      return <TrendingUp className="h-4 w-4 text-emerald-600" />;
    }
    return <Wallet className="h-4 w-4 text-gray-600" />;
  };

  const formatDayTotal = (value: number) => {
    const sign = value >= 0 ? "+" : "-";
    return `${sign}${formatCurrency(Math.abs(value))}`;
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    setSelectedMonth((current) => (direction === "prev" ? subMonths(current, 1) : addMonths(current, 1)));
  };

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen pb-28">
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
              <h1 className="text-lg font-bold text-gray-900">Wallet</h1>
              <p className="text-xs text-gray-500">Transaction history</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSearch((prev) => !prev)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Toggle search"
            >
              <Search className="h-5 w-5 text-gray-600" />
            </button>
            <button className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                3
              </span>
            </button>
          </div>
        </div>
        {showSearch && (
          <div className="mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search transactions..."
                className="w-full bg-gray-100 rounded-xl px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-naija-green focus:bg-white transition-all"
              />
            </div>
          </div>
        )}
      </header>

      <main className="px-4 py-4 space-y-6">
        {/* Balance Summary */}
        <section>
          <div className="bg-gradient-to-br from-naija-green to-eko-teal rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm">Current Balance</p>
                <h2 className="text-3xl font-bold">
                  {showBalance ? formatCurrency(totalBalance) : "••••••"}
                </h2>
              </div>
              <button
                onClick={() => setShowBalance((prev) => !prev)}
                className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-sm"
                aria-label="Toggle balance visibility"
              >
                {showBalance ? <Eye className="h-4 w-4 text-white" /> : <EyeOff className="h-4 w-4 text-white" />}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-white/80">This Month Income</p>
                <p className="text-lg font-semibold text-green-200">+{formatCurrency(monthlyIncome)}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-white/80">This Month Expenses</p>
                <p className="text-lg font-semibold text-red-200">-{formatCurrency(monthlyExpenses)}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Tabs */}
        <section>
          <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
            <div className="flex space-x-1">
              {[
                { label: "All", value: "all" },
                { label: "Income", value: "income" },
                { label: "Expenses", value: "expense" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value as typeof filter)}
                  className={clsx(
                    "flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all",
                    filter === tab.value ? "bg-naija-green text-white" : "text-gray-600"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section>
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={<CalendarDays className="h-4 w-4 text-blue-600" />} label="This Week" value={formatCurrency(thisWeekSpending)} />
            <StatCard icon={<TrendingUp className="h-4 w-4 text-purple-600" />} label="Average Daily" value={formatCurrency(averageDailySpend)} />
            <StatCard icon={<Receipt className="h-4 w-4 text-orange-600" />} label="Transactions" value={transactionCount.toString()} />
          </div>
        </section>

        {/* Month Selector */}
        <section className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{format(selectedMonth, "MMMM yyyy")}</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleMonthChange("prev")}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={() => handleMonthChange("next")}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </section>

        {/* Transactions */}
        <section className="space-y-4">
          {groupedTransactions.length === 0 ? (
            <Card className="border border-dashed border-gray-200">
              <CardContent className="py-12 text-center">
                <p className="text-sm text-gray-500">No transactions found for this selection.</p>
              </CardContent>
            </Card>
          ) : (
            groupedTransactions.map((group) => {
              const dayTotalLabel = formatDayTotal(group.total);
              const isPositive = group.total >= 0;
              return (
                <div key={group.key} className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{group.label}</h4>
                    </div>
                    <div className="text-right">
                      <p className={clsx("text-sm font-medium", isPositive ? "text-naija-green" : "text-red-600")}>{dayTotalLabel}</p>
                      <p className="text-xs text-gray-500">{group.count} transaction{group.count === 1 ? "" : "s"}</p>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {group.items.map((expense) => {
                      const amount = Number(expense.amount);
                      const isIncome = expense.type === "income";
                      return (
                        <div key={expense.id} className="px-4 py-4 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              {getTransactionIcon(expense)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 truncate max-w-[160px]">
                                {expense.description || expense.category}
                              </p>
                              <p className="text-sm text-gray-500 capitalize">
                                {isIncome ? "Income" : expense.category.toLowerCase()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={clsx("font-semibold", isIncome ? "text-naija-green" : "text-red-600")}
                            >
                              {isIncome ? "+" : "-"}
                              {formatCurrency(amount)}
                            </p>
                            <button className="text-xs text-gray-400 mt-1" aria-label="Transaction options">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <section>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories This Month</h3>
              <div className="space-y-4">
                {categoryBreakdown.map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={clsx("w-4 h-4 rounded-full", item.color)}></div>
                      <span className="text-sm text-gray-700">{item.category}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className={clsx("h-2 rounded-full", item.color)} style={{ width: `${item.percent}%` }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-sm -translate-x-1/2 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-around">
          <NavItem icon={<Home className="h-5 w-5" />} label="Home" />
          <NavItem icon={<MessageCircle className="h-5 w-5" />} label="Coach" />
          <NavItem icon={<Wallet className="h-5 w-5" />} label="Wallet" active />
          <NavItem icon={<Compass className="h-5 w-5" />} label="Explore" />
          <NavItem icon={<User className="h-5 w-5" />} label="Profile" />
        </div>
      </nav>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-naija-green rounded-full shadow-lg flex items-center justify-center"
        aria-label="Add transaction"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add Transaction</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                aria-label="Close add transaction"
              >
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                <div className="flex space-x-3">
                  <button className="flex-1 py-3 px-4 bg-red-50 text-red-600 rounded-xl font-medium border border-red-200">
                    Expense
                  </button>
                  <button className="flex-1 py-3 px-4 bg-gray-100 text-gray-600 rounded-xl font-medium">
                    Income
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl text-lg font-semibold focus:ring-2 focus:ring-naija-green focus:border-naija-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-naija-green focus:border-naija-green">
                  <option>Food & Drinks</option>
                  <option>Transportation</option>
                  <option>Shopping</option>
                  <option>Entertainment</option>
                  <option>Bills</option>
                  <option>Health</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  placeholder="Add a note (optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-naija-green focus:border-naija-green"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-naija-green focus:border-naija-green"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-600 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTransaction}
                  className="flex-1 py-3 px-4 bg-naija-green text-white rounded-xl font-medium"
                >
                  Save Transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">{icon}</div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: ReactNode; label: string; active?: boolean }) {
  return (
    <button className="flex flex-col items-center space-y-1 py-2">
      <div
        className={clsx(
          "w-6 h-6 rounded-full flex items-center justify-center",
          active ? "bg-naija-green text-white" : "text-gray-400"
        )}
      >
        {icon}
      </div>
      <span className={clsx("text-xs", active ? "font-medium text-naija-green" : "text-gray-400")}>{label}</span>
    </button>
  );
}

