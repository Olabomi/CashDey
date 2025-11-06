import { Expense, SavingsGoal } from "@/types";

export interface SurvivalStats {
  balance: number;
  dailyBurnRate: number;
  daysRemaining: number | null;
  status: "balanced" | "warning" | "critical";
}

export function calculateBurnRate(expenses: Expense[], days: number = 30): number {
  if (expenses.length === 0 || days === 0) return 0;
  
  const totalExpenses = expenses
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + Number(e.amount), 0);
  
  return totalExpenses / days;
}

export function calculateSurvivalDays(
  balance: number,
  dailyBurnRate: number
): number | null {
  if (dailyBurnRate <= 0) return null;
  if (balance <= 0) return 0;
  
  return Math.floor(balance / dailyBurnRate);
}

export function getSurvivalStatus(
  daysRemaining: number | null
): "balanced" | "warning" | "critical" {
  if (daysRemaining === null) return "balanced";
  if (daysRemaining < 7) return "critical";
  if (daysRemaining < 30) return "warning";
  return "balanced";
}

export function calculateSurvivalStats(
  balance: number,
  expenses: Expense[]
): SurvivalStats {
  const dailyBurnRate = calculateBurnRate(expenses, 30);
  const daysRemaining = calculateSurvivalDays(balance, dailyBurnRate);
  const status = getSurvivalStatus(daysRemaining);

  return {
    balance,
    dailyBurnRate,
    daysRemaining,
    status,
  };
}

export function calculateTotalBalance(
  expenses: Expense[],
  initialBalance: number = 0
): number {
  const totalIncome = expenses
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + Number(e.amount), 0);
  
  const totalExpenses = expenses
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + Number(e.amount), 0);
  
  return initialBalance + totalIncome - totalExpenses;
}

export function getWeeklySpending(expenses: Expense[]): {
  [category: string]: { amount: number; count: number };
} {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const weeklyExpenses = expenses.filter(
    (e) =>
      e.type === "expense" &&
      new Date(e.date) >= weekAgo &&
      new Date(e.date) <= new Date()
  );

  const categorySpending: { [key: string]: { amount: number; count: number } } = {};

  weeklyExpenses.forEach((expense) => {
    const category = expense.category;
    if (!categorySpending[category]) {
      categorySpending[category] = { amount: 0, count: 0 };
    }
    categorySpending[category].amount += Number(expense.amount);
    categorySpending[category].count += 1;
  });

  return categorySpending;
}

export function calculateGoalProgress(goal: SavingsGoal): {
  percentage: number;
  remaining: number;
  status: "on_track" | "urgent" | "completed";
} {
  const percentage = (goal.current_amount / goal.target_amount) * 100;
  const remaining = goal.target_amount - goal.current_amount;
  
  let status: "on_track" | "urgent" | "completed" = "on_track";
  
  if (percentage >= 100) {
    status = "completed";
  } else if (goal.deadline) {
    const daysUntilDeadline =
      Math.ceil(
        (new Date(goal.deadline).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      );
    const dailyRequired = remaining / Math.max(daysUntilDeadline, 1);
    const currentDaily = goal.current_amount / 30; // Rough estimate
    
    if (daysUntilDeadline < 30 && dailyRequired > currentDaily * 1.5) {
      status = "urgent";
    }
  }
  
  return {
    percentage: Math.min(percentage, 100),
    remaining: Math.max(remaining, 0),
    status,
  };
}

export function getMonthlySpending(expenses: Expense[]): number {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthlyExpenses = expenses.filter(
    (e) =>
      e.type === "expense" &&
      new Date(e.date) >= startOfMonth &&
      new Date(e.date) <= now
  );

  return monthlyExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
}

