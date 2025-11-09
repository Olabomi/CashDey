// --- Core App & Navigation ---
export type ActiveView = 
  'dashboard' | 'coach' | 'explore' | 'profile' | 'image' | 'news' | 
  'analytics' | 'ajo' | 'challenges' | 'sharedGoals' | 'askCommunity' | 
  'wallet' | 'rewards' | 'referrals' | 'portfolio' | 'savings' | 'actionItems' |
  'budget' | 'bills' | 'notifications';

// --- Modal System ---
export type ModalType =
  | 'addTransaction'
  | 'editTransaction'
  | 'comingSoon';

export interface ModalState {
  type: ModalType | null;
  props?: any;
}


// --- Gemini API Types ---
export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
export interface Content {
    role: 'user' | 'model';
    parts: { text: string }[];
}


// --- Database Schema Types (Tier 0.5) ---

// From `profiles` table
export interface Profile {
  id: string; // UUID from auth.users
  phone_or_email: string;
  country: string;
  kyc_level: 'tier_1' | 'tier_2' | 'tier_3';
  created_at: string;
  name: string;
  nickname?: string;
  bio?: string;
  profile_pic_url?: string;
  onboarding_complete: boolean;
  // Denormalized/calculated fields, can be stored or calculated on the fly
  referral_code: string;
  last_checkin_date: string | null;
  checkin_streak: number;
}


// From `accounts` table
export interface Account {
  id: number;
  user_id: string;
  type: 'cash' | 'bank' | 'card' | 'mobile';
  name: string;
  currency: 'NGN' | 'USD';
  balance: number;
}

// From `transactions` table
export interface Transaction {
  id: number;
  user_id: string;
  account_id: number;
  amount: number; // Positive for inflow, negative for outflow
  currency: 'NGN' | 'USD';
  type: 'inflow' | 'outflow' | 'deposit' | 'send' | 'reward' | 'reward_credit' | 'expense' | 'income';
  category_id: number;
  merchant?: string;
  notes?: string;
  date: string;
  source: 'manual' | 'import' | 'ocr';
  receipt_url?: string;
  created_at: string;
  // Joined data
  category: Category;
  // For UI
  status: 'completed' | 'pending' | 'failed';
  description: string;
  party: string;
}

// From `categories` table
export interface Category {
  id: number;
  user_id?: string; // Null for system categories
  name: string;
  kind: 'expense' | 'income';
  icon?: string;
  is_system: boolean;
}

// From `budgets` table
export interface Budget {
  id: number;
  user_id: string;
  period: 'monthly' | 'weekly' | 'custom';
  start_date: string;
  end_date: string;
  currency: 'NGN' | 'USD';
  name: string;
  status: 'active' | 'archived';
  // Joined data
  budget_lines?: BudgetLine[];
  total_limit?: number;
  total_spent?: number;
}

// From `budget_lines` table
export interface BudgetLine {
  id: number;
  budget_id: number;
  category_id: number;
  limit_amount: number;
   // Joined data
  category?: Category;
  spent_amount?: number;
}

// From `notifications` table
export interface Notification {
  id: number;
  user_id: string;
  type: 'budget' | 'bill' | 'goal' | 'ajo' | 'referral' | 'security' | 'reward';
  title: string;
  body: string;
  meta?: Record<string, any>;
  created_at: string;
  read_at?: string;
}

// From `goals` table (formerly SavingsGoal)
export interface Goal {
  id: number;
  user_id: string;
  name: string;
  emoji?: string;
  target_amount: number;
  saved_amount: number;
  due_date?: string;
  status: 'in_progress' | 'completed' | 'paused';
}

// --- Legacy & Component-specific Types (To be reviewed/migrated) ---

export interface LegacyWallet {
  totalBalance: number;
  spendable: number;
  cashPoints: number;
  lockedInGoals: number;
}

export interface Bill {
  id: number;
  biller: string;
  category: 'utilities' | 'subscription' | 'loan' | 'rent';
  amount: number;
  dueDate: string; // ISO 8601
}

export type Commodity = 'Bag of Rice (50kg)' | 'Bag of Cement' | 'Diesel Price (Litre)';
export interface CommodityAlert {
  id: number;
  commodity: Commodity;
  condition: 'rises_above' | 'falls_below';
  value: number;
  active: boolean;
}

export interface DashboardInsightsResponse {
  cashFlowAnalysis: {
    income: number;
    expenses: number;
    netFlow: number;
    commentary: string;
  };
  keyInsight: {
    title: string;
    description: string;
    reasoning: string;
  };
  actionableNudge: {
    title: string;
    description: string;
    actionText: string;
    prompt: string;
  };
}

// --- Advisor Booking ---
export type MeetingType = 'face-to-face' | 'video' | 'whatsapp' | 'voice';
export type AdvisorTopic = 'savings' | 'investment' | 'debt' | 'retirement' | 'business' | 'other';
export interface AdvisorBookingDetails {
  meetingType: MeetingType | '';
  topic: AdvisorTopic | '';
  otherTopicText: string;
  timeSlot: string;
}

// --- Profile & Progression ---
export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
}
export type FinancialPersonality = 'Saver' | 'Spender' | 'Planner' | 'Hustler';
export type AppTheme = 'dark' | 'light' | 'naija';
export type CoachPersonality = 'friendly' | 'strict' | 'motivational';

// For UI state, extended from Profile
export interface User extends Profile {
  xp: { current: number; nextLevel: number };
  levelName: string;
  levelTier: 'Bronze' | 'Silver' | 'Gold';
  financialPersonality: FinancialPersonality;
  badges: Badge[];
  pinnedBadges: string[];
  joinDate: string;
  totalSaved: number;
  totalBonuses: number;
}