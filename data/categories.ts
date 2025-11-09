import type { Category } from '../types';

// user_id will be null for system categories and set for user-created ones.
export const defaultCategories: Omit<Category, 'user_id'>[] = [
    // Expenses
    { id: 1, name: 'Food & Drinks', kind: 'expense', is_system: true, icon: '🍔' },
    { id: 2, name: 'Transport', kind: 'expense', is_system: true, icon: '🚗' },
    { id: 3, name: 'Bills & Utilities', kind: 'expense', is_system: true, icon: '💡' },
    { id: 4, name: 'Shopping', kind: 'expense', is_system: true, icon: '🛍️' },
    { id: 5, name: 'Entertainment', kind: 'expense', is_system: true, icon: '🎬' },
    { id: 8, name: 'Black Tax', kind: 'expense', is_system: false },
    { id: 9, name: 'Gifts', kind: 'expense', is_system: true, icon: '🎁' },
    { id: 10, name: 'Health', kind: 'expense', is_system: true, icon: '💊' },
    { id: 11, name: 'Education', kind: 'expense', is_system: true, icon: '📚' },
    { id: 12, name: 'Investment', kind: 'expense', is_system: true, icon: '📈' },
    { id: 15, name: 'Other Expense', kind: 'expense', is_system: true, icon: '📎' },

    // Income
    { id: 6, name: 'Salary', kind: 'income', is_system: true, icon: '💰' },
    { id: 7, name: 'Side Hustle', kind: 'income', is_system: false },
    { id: 13, name: 'Dividends', kind: 'income', is_system: true, icon: '💸' },
    { id: 14, name: 'Cashback/Rewards', kind: 'income', is_system: true, icon: '✨' },
    { id: 16, name: 'Other Income', kind: 'income', is_system: true, icon: '📎' },
];
