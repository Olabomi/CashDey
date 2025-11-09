import { supabase } from '../lib/supabase';
import type { Profile, Transaction, Account, Category, Budget, BudgetLine, Goal } from '../types';

// --- Profile ---
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
};

// --- Accounts ---
export const getAccounts = async (userId: string): Promise<Account[]> => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data || [];
};

// --- Categories ---
export const getCategories = async (userId: string): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .or(`user_id.eq.${userId},is_system.eq.true`); // User's categories OR system categories
  if (error) throw error;
  return data || [];
};


// --- Transactions ---
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, category:categories(*)')
    .eq('user_id', userId)
    .order('occurred_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createTransaction = async (tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'>, userId: string): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([{ ...tx, user_id: userId }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

// --- Budgets ---
export const getActiveBudget = async (userId: string): Promise<Budget | null> => {
    const today = new Date().toISOString();
    const { data, error } = await supabase
        .from('budgets')
        .select('*, budget_lines(*, category:categories(*))')
        .eq('user_id', userId)
        .eq('status', 'active')
        .lte('start_date', today)
        .gte('end_date', today)
        .limit(1)
        .single();
    
    if (error && error.code !== 'PGRST116') { // Ignore 'PGRST116' (single row not found)
        throw error;
    }
    
    return data;
};

export const createBudget = async (budget: Omit<Budget, 'id' | 'user_id' | 'status'>, lines: Omit<BudgetLine, 'id' | 'budget_id'>[], userId: string): Promise<Budget> => {
    // Create the budget
    const { data: budgetData, error: budgetError } = await supabase
        .from('budgets')
        .insert([{ ...budget, user_id: userId, status: 'active' }])
        .select()
        .single();

    if (budgetError) throw budgetError;

    // Create the budget lines
    const linesToInsert = lines.map(line => ({ ...line, budget_id: budgetData.id }));
    const { data: linesData, error: linesError } = await supabase
        .from('budget_lines')
        .insert(linesToInsert)
        .select();

    if (linesError) throw linesError;
    
    budgetData.budget_lines = linesData;
    return budgetData;
}


// --- Goals ---
export const getGoals = async (userId: string): Promise<Goal[]> => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true });
  if (error) throw error;
  return data || [];
};
