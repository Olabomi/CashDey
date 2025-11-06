export type CommunicationStyle = "formal" | "pidgin" | "auto";
export type ExpenseType = "expense" | "income";
export type GoalStatus = "on_track" | "urgent" | "completed";
export type SubscriptionPlan = "free" | "monthly" | "yearly";
export type SubscriptionStatus = "active" | "inactive" | "cancelled";

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  type: ExpenseType;
  created_at: string;
  updated_at: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  category: string;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  preferred_name: string;
  communication_style: CommunicationStyle;
  created_at: string;
  updated_at: string;
}

export const EXPENSE_CATEGORIES = [
  "Food & Drinks",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Education",
  "Healthcare",
  "Rent",
  "Utilities",
  "Other",
] as const;

export const GOAL_CATEGORIES = [
  "House Rent",
  "Emergency Fund",
  "New Gadget",
  "Vacation",
  "Start Business",
  "Education",
  "Buy Car",
  "Wedding",
  "Investment",
  "Other",
] as const;

