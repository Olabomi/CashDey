import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile, Account, Transaction, Budget, Goal, Category, User, Bill, Notification } from '../types';
import * as api from '../services/api';
import { useToast } from './ToastContext';
import { useLocale } from './LocaleContext';
import { useAuth } from './AuthContext';
import { defaultCategories } from '../data/categories';

// FIX: Define a type for the raw transaction from the API
type DBTransaction = Omit<Transaction, 'date' | 'notes' | 'status' | 'description' | 'party'> & {
    occurred_at: string;
    note?: string;
};

// Mock data interfaces for missing data structures
interface Wallet {
    totalBalance: number;
    spendable: number;
    cashPoints: number;
    lockedInGoals: number;
}
interface Portfolio {
    totalValue: number;
    totalChange: number;
    assets: {
        stocks: { totalValue: number; change: number; holdings: { ticker: string; name: string; shares: number; value: number }[] };
        crypto: { totalValue: number; change: number; holdings: { ticker: string; name: string; amount: number; value: number }[] };
        mutualFunds: { totalValue: number; change: number; holdings: { name: string; units: number; value: number }[] };
    };
}

interface SavingsGoal {
    id: number;
    title: string;
    emoji: string;
    saved: number;
    target: number;
    deadline: string;
}


export interface DataContextType {
  profile: Profile | null;
  accounts: Account[];
  transactions: Transaction[];
  activeBudget: Budget | null;
  goals: Goal[];
  categories: Category[];
  loading: boolean;
  refetchTransactions: () => Promise<void>;
  refetchBudgets: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'category' | 'status' | 'description' | 'party'>) => Promise<void>;
  user: User | null;
  wallet: Wallet | null;
  bills: Bill[];
  portfolio: Portfolio | null;
  savingsGoals: SavingsGoal[];
  notifications: Notification[];
  performDailyCheckin: () => Promise<void>;
  updateTransaction: (txId: number, updates: { amount: number; category_id: number; date: string; notes?: string; }) => Promise<void>;
  addBill: (bill: Omit<Bill, 'id'>) => void;
  updateBill: (bill: Bill) => void;
  deleteBill: (billId: number) => void;
  markBillAsPaid: (billId: number) => void;
  markBillAsOverdue: (billId: number) => void;
  updateProfilePic: (file: File) => Promise<void>;
  updateProfile: (updates: Partial<Pick<Profile, 'name' | 'nickname' | 'bio'>>) => Promise<void>;
  markNotificationAsRead: (id: number) => void;
  markAllAsRead: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser, profile: authProfile } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeBudget, setActiveBudget] = useState<Budget | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { t } = useLocale();
  
  const userId = authUser?.id;

  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const performDailyCheckin = useCallback(async () => {
    if (!user) return;
    // Simulate API call and update state
    const newStreak = (user.checkin_streak || 0) + 1;
    const newCashPoints = (wallet?.cashPoints || 0) + 10;
    const updatedUser: User = { ...user, last_checkin_date: new Date().toISOString(), checkin_streak: newStreak };
    const updatedWallet: Wallet = { ...(wallet as Wallet), cashPoints: newCashPoints };
    setUser(updatedUser);
    setWallet(updatedWallet);
    addToast(t('dailyWin.checkinSuccessToast', { points: 10 }), 'success');
  }, [user, wallet, addToast, t]);

  const addTransaction = useCallback(async (newTxData: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'category' | 'status' | 'description' | 'party'>) => {
    if (!authUser) {
        addToast("You must be logged in to add a transaction.", 'error');
        return;
    };
    
    let category = categories.find(c => c.id === newTxData.category_id);
    if (!category) {
        const defaultCategory = categories.find(c => c.name === 'Other') || categories[0];
        console.error("Category not found for new transaction, using default.");
        if (!defaultCategory) {
            addToast("Cannot add transaction: No categories available.", 'error');
            return;
        }
        category = defaultCategory;
    }

    const fullNewTx: Transaction = {
        ...newTxData,
        id: Date.now(),
        user_id: authUser.id,
        created_at: new Date().toISOString(),
        category: category,
        status: 'completed',
        description: newTxData.notes || newTxData.merchant || category.name,
        party: newTxData.merchant || 'Manual Entry',
    };

    setTransactions(prev => [fullNewTx, ...prev]);
  }, [authUser, categories, addToast]);

  const updateTransaction = useCallback(async (
    txId: number, 
    updates: { amount: number; category_id: number; date: string; notes?: string }
  ) => {
    const category = categories.find(c => c.id === updates.category_id);
    if (!category) {
        console.error("Invalid category for update");
        return;
    }

    setTransactions(prev =>
        prev.map(tx => {
            if (tx.id === txId) {
                const newDescription = updates.notes || (category.name !== tx.category.name ? category.name : tx.description);
                return {
                    ...tx,
                    amount: updates.amount,
                    type: updates.amount > 0 ? 'income' : 'expense',
                    category_id: updates.category_id,
                    date: updates.date,
                    notes: updates.notes || '',
                    category: category,
                    description: newDescription,
                };
            }
            return tx;
        })
    );
  }, [categories]);

  const addBill = useCallback((bill: Omit<Bill, 'id'>) => {
    const newBill = { ...bill, id: Date.now() };
    setBills(prev => [...prev, newBill].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
    addToast('Bill added successfully!', 'success');
  }, [addToast]);

  const updateBill = useCallback((updatedBill: Bill) => {
    setBills(prev => prev.map(b => b.id === updatedBill.id ? updatedBill : b).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
    addToast('Bill updated successfully!', 'success');
  }, [addToast]);

  const deleteBill = useCallback((billId: number) => {
    setBills(prev => prev.filter(b => b.id !== billId));
    addToast('Bill deleted.', 'success');
  }, [addToast]);

  const markBillAsPaid = useCallback((billId: number) => {
    setBills(prev => prev.filter(b => b.id !== billId));
    addToast('Bill marked as paid!', 'success');
  }, [addToast]);

  const markBillAsOverdue = useCallback((billId: number) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    setBills(prev => prev.map(b => b.id === billId ? { ...b, dueDate: yesterday.toISOString() } : b).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
    addToast('Bill marked as overdue.', 'success');
  }, [addToast]);

    const updateProfilePic = useCallback(async (file: File) => {
        if (!user || !authUser) {
            addToast("You must be logged in to update your profile picture.", 'error');
            return;
        }

        try {
            // Delete old avatar if it exists and is a supabase url
            if (user.profile_pic_url && user.profile_pic_url.includes('supabase.co')) {
                try {
                    const oldFilePath = new URL(user.profile_pic_url).pathname.split('/avatars/')[1];
                    if (oldFilePath) {
                        await supabase.storage.from('avatars').remove([oldFilePath]);
                    }
                } catch (e) {
                    console.error("Couldn't parse or remove old avatar URL:", e);
                }
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${authUser.id}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ profile_pic_url: publicUrl })
                .eq('id', authUser.id);

            if (updateError) throw updateError;
            
            setUser(prevUser => {
                if (!prevUser) return null;
                return { ...prevUser, profile_pic_url: publicUrl };
            });

            addToast('Profile picture updated!', 'success');
        } catch (error: any) {
            console.error('Error updating profile picture:', error);
            if (error.message && error.message.toLowerCase().includes('bucket not found')) {
                addToast("Setup required: Create a public Supabase Storage bucket named 'avatars' with access policies.", 'error');
            } else {
                addToast(`Error: ${error.message}`, 'error');
            }
        }
    }, [user, authUser, addToast]);

  const updateProfile = useCallback(async (updates: Partial<Pick<Profile, 'name' | 'nickname' | 'bio'>>) => {
    if (!user || !authUser) {
        addToast("You must be logged in to update your profile.", 'error');
        return;
    }

    try {
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', authUser.id);
        
        if (error) throw error;

        setUser(prevUser => {
            if (!prevUser) return null;
            return { ...prevUser, ...updates };
        });

        addToast('Profile updated successfully!', 'success');
    } catch (error: any) {
        console.error('Error updating profile:', error);
        addToast(`Error: ${error.message}`, 'error');
    }
  }, [user, authUser, addToast]);

  const markNotificationAsRead = useCallback((id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => (n.read_at ? n : { ...n, read_at: new Date().toISOString() }))
    );
  }, []);


  useEffect(() => {
    if (authProfile) {
        const mockUser: User = {
            ...authProfile,
            xp: { current: 1250, nextLevel: 2000 },
            levelName: "Financial Navigator",
            levelTier: "Bronze",
            financialPersonality: "Planner",
            badges: [
                { id: 'b1', name: "Budget Boss", emoji: "📊", description: "Completed first monthly budget." },
                { id: 'b2', name: "Savings Starter", emoji: "🌱", description: "Made first deposit to a savings goal." },
                { id: 'b3', name: "Streak King", emoji: "🔥", description: "Maintained a 7-day check-in streak." },
            ],
            pinnedBadges: ['b1', 'b2', 'b3'],
            joinDate: "2024-06-01T10:00:00Z",
            totalSaved: 125000,
            totalBonuses: 5000,
        };
        setUser(mockUser);
    }
  }, [authProfile]);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
        setWallet({ totalBalance: 250000, spendable: 120000, cashPoints: 1250, lockedInGoals: 130000 });
        const today = new Date();
        const mockBills: Bill[] = [
            { id: 1, biller: 'MTN', category: 'subscription', amount: 5000, dueDate: new Date(new Date().setDate(today.getDate() + 3)).toISOString() },
            { id: 2, biller: 'Ikeja Electric', category: 'utilities', amount: 15000, dueDate: new Date(new Date().setDate(today.getDate() + 7)).toISOString() },
            { id: 3, biller: 'Netflix', category: 'subscription', amount: 4500, dueDate: new Date().toISOString() },
            { id: 4, biller: 'DSTV', category: 'subscription', amount: 12500, dueDate: new Date(new Date().setDate(today.getDate() - 2)).toISOString() },
            { id: 5, biller: 'Landlord - Lekki Flat', category: 'rent', amount: 750000, dueDate: new Date(new Date().setDate(today.getDate() + 45)).toISOString() },
            { id: 6, biller: 'Sterling Bank Loan', category: 'loan', amount: 50000, dueDate: new Date(new Date().setDate(today.getDate() + 15)).toISOString() },
        ];
        setBills(mockBills.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));

        setPortfolio({
            totalValue: 550000, totalChange: 1.25,
            assets: {
                stocks: { totalValue: 250000, change: 2.1, holdings: [{ ticker: 'MTNN', name: 'MTN Nigeria', shares: 100, value: 220000 }] },
                crypto: { totalValue: 150000, change: -1.5, holdings: [{ ticker: 'BTC', name: 'Bitcoin', amount: 0.002, value: 145000 }] },
                mutualFunds: { totalValue: 150000, change: 0.8, holdings: [{ name: 'Stanbic IBTC Money Market Fund', units: 150000, value: 150000 }] },
            }
        });
        setSavingsGoals([
            { id: 1, title: 'New Laptop', emoji: '💻', saved: 150000, target: 450000, deadline: 'Dec 2024' },
            { id: 2, title: 'Emergency Fund', emoji: '🛡️', saved: 350000, target: 1000000, deadline: 'Mar 2025' },
        ]);

        const mockNotifications: Notification[] = [
            { id: 1, user_id: userId, type: 'bill', title: 'DSTV Bill Due Soon', body: 'Your DSTV subscription of ₦12,500 is due in 3 days.', created_at: new Date().toISOString(), read_at: undefined },
            { id: 2, user_id: userId, type: 'reward', title: 'New Reward!', body: 'You earned 500 Cash Points for referring a friend. Well done!', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), read_at: undefined },
            { id: 3, user_id: userId, type: 'goal', title: 'Goal Progress', body: 'Great job! You are now 33% of the way to your "New Laptop" goal.', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), read_at: new Date().toISOString() },
            { id: 4, user_id: userId, type: 'budget', title: 'Budget Alert', body: 'You have spent 85% of your "Food & Drinks" budget for the month.', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), read_at: new Date().toISOString() },
            { id: 5, user_id: userId, type: 'referral', title: 'Referral Success!', body: 'Your friend, Tunde Adebayo, has successfully signed up and funded their wallet.', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), read_at: new Date().toISOString() },
        ];
        setNotifications(mockNotifications);

        const mockCategories: Category[] = defaultCategories.map(c => ({...c, user_id: c.is_system ? undefined : userId}));
        
        const mockAccounts: Account[] = [
            { id: 1, user_id: userId, type: 'cash', name: 'Cash', currency: 'NGN', balance: 50000 },
            { id: 2, user_id: userId, type: 'bank', name: 'GTBank', currency: 'NGN', balance: 200000 },
        ];
        
        const mockTransactions: Transaction[] = [
            { id: 1, user_id: userId, account_id: 2, amount: 200000, currency: 'NGN', type: 'income', category_id: 6, merchant: 'CashDey System', notes: 'Monthly salary deposit.', date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(), source: 'import', created_at: new Date().toISOString(), category: mockCategories.find(c => c.id === 6)!, status: 'completed', description: 'Salary Deposit', party: 'Workplace Inc.' },
            { id: 2, user_id: userId, account_id: 2, amount: -15000, currency: 'NGN', type: 'expense', category_id: 3, merchant: 'Ikeja Electric', notes: 'NEPA Bill Payment', date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), source: 'manual', created_at: new Date().toISOString(), category: mockCategories.find(c => c.id === 3)!, status: 'completed', description: 'NEPA Bill Payment', party: 'Ikeja Electric' },
            { id: 3, user_id: userId, account_id: 1, amount: -4500, currency: 'NGN', type: 'expense', category_id: 1, merchant: 'Jumia Food', notes: 'Lunch with Tunde', date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), source: 'manual', created_at: new Date().toISOString(), category: mockCategories.find(c => c.id === 1)!, status: 'completed', description: 'Jumia Food Order', party: 'Jumia Food' },
            { id: 4, user_id: userId, account_id: 2, amount: -8000, currency: 'NGN', type: 'expense', category_id: 2, merchant: 'Uber', notes: '', date: new Date().toISOString(), source: 'manual', created_at: new Date().toISOString(), category: mockCategories.find(c => c.id === 2)!, status: 'completed', description: 'Uber Ride', party: 'Uber' },
            { id: 5, user_id: userId, account_id: 2, amount: 500, currency: 'NGN', type: 'income', category_id: 14, merchant: 'CashDey System', notes: 'Referral Bonus', date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), source: 'import', created_at: new Date().toISOString(), category: mockCategories.find(c => c.id === 14)!, status: 'completed', description: 'Rewards Credit', party: 'CashDey System' }
        ];

        const mockActiveBudget: Budget = { id: 1, user_id: userId, period: 'monthly', start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(), end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(), currency: 'NGN', name: `${new Date().toLocaleString('default', { month: 'long' })} Budget`, status: 'active', budget_lines: [
                { id: 1, budget_id: 1, category_id: 1, limit_amount: 50000, category: mockCategories.find(c => c.id === 1)! },
                { id: 2, budget_id: 1, category_id: 2, limit_amount: 25000, category: mockCategories.find(c => c.id === 2)! },
                { id: 3, budget_id: 1, category_id: 3, limit_amount: 20000, category: mockCategories.find(c => c.id === 3)! },
                { id: 4, budget_id: 1, category_id: 4, limit_amount: 30000, category: mockCategories.find(c => c.id === 4)! },
                { id: 5, budget_id: 1, category_id: 5, limit_amount: 15000, category: mockCategories.find(c => c.id === 5)! },
        ]};

        const mockGoals: Goal[] = [
            { id: 1, user_id: userId, name: 'New Laptop', emoji: '💻', target_amount: 450000, saved_amount: 150000, due_date: '2024-12-31T23:59:59Z', status: 'in_progress' },
            { id: 2, user_id: userId, name: 'Emergency Fund', emoji: '🛡️', target_amount: 1000000, saved_amount: 350000, due_date: '2025-03-31T23:59:59Z', status: 'in_progress' },
        ];
        
        setAccounts(mockAccounts);
        setTransactions(mockTransactions);
        setActiveBudget(mockActiveBudget);
        setGoals(mockGoals);
        setCategories(mockCategories);
    } catch (error) {
      console.error("An unexpected error occurred while loading app data", error);
      addToast("There was an unexpected error. Please refresh the page.", 'error');
    } finally {
      setLoading(false);
    }
  }, [userId, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetchTransactions = useCallback(async () => {
    return Promise.resolve();
  }, []);

  const refetchBudgets = useCallback(async () => {
    return Promise.resolve();
  }, []);


  const value = useMemo(() => ({
    profile: authProfile,
    accounts,
    transactions,
    activeBudget,
    goals,
    categories,
    loading,
    refetchTransactions,
    refetchBudgets,
    addTransaction,
    user,
    wallet,
    bills,
    portfolio,
    savingsGoals,
    notifications,
    performDailyCheckin,
    updateTransaction,
    addBill,
    updateBill,
    deleteBill,
    markBillAsPaid,
    markBillAsOverdue,
    updateProfilePic,
    updateProfile,
    markNotificationAsRead,
    markAllAsRead,
  }), [authProfile, accounts, transactions, activeBudget, goals, categories, loading, refetchTransactions, refetchBudgets, addTransaction, user, wallet, bills, portfolio, savingsGoals, notifications, performDailyCheckin, updateTransaction, addBill, updateBill, deleteBill, markBillAsPaid, markBillAsOverdue, updateProfilePic, updateProfile, markNotificationAsRead, markAllAsRead]);

  if (loading && !Object.values(value).some(v => v !== null && (!Array.isArray(v) || v.length > 0))) {
      return (
          <div className="flex items-center justify-center h-screen bg-black">
              <div className="flex flex-col items-center">
                  <img src="/logo-a.png" alt="CashDey Logo" className="w-24 h-24 mb-4 animate-pulse"/>
                  <p className="text-white">Loading your Financial OS...</p>
              </div>
          </div>
      );
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};