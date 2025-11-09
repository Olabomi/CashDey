import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useLocale } from '../contexts/LocaleContext';
import { ClipboardListIcon } from './icons';

const getProgressBarColor = (percentage: number) => {
    if (percentage > 100) return 'bg-rose-600';
    if (percentage > 80) return 'bg-rose-500';
    if (percentage > 50) return 'bg-amber-500';
    return 'bg-emerald-500';
};

const BudgetProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
    const color = getProgressBarColor(progress);
    const displayProgress = Math.min(progress, 100);
    return (
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className={`${color} h-2.5 rounded-full transition-all duration-500 ease-out`} style={{ width: `${displayProgress}%` }}></div>
        </div>
    );
};

const CategoryBudgetLine: React.FC<{
    category: { name: string, icon?: string };
    limit: number;
    spent: number;
}> = ({ category, limit, spent }) => {
    const progress = limit > 0 ? (spent / limit) * 100 : 0;
    const remaining = limit - spent;
    return (
        <div className="p-3 bg-gray-700/60 rounded-lg">
            <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-white">{category.icon} {category.name}</span>
                <span className={`text-sm font-medium ${progress > 100 ? 'text-rose-400' : 'text-gray-300'}`}>
                    {Math.round(progress)}%
                </span>
            </div>
            <BudgetProgressBar progress={progress} />
            <div className="flex justify-between text-xs mt-1.5">
                <span className="text-gray-400">
                    Spent: {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(spent)}
                </span>
                <span className="font-medium text-gray-300">
                    {remaining >= 0 
                        ? `${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(remaining)} left`
                        : `${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Math.abs(remaining))} over`
                    }
                </span>
            </div>
        </div>
    );
};


const Budget: React.FC = () => {
    const { activeBudget, transactions } = useData();
    const { t } = useLocale();

    const budgetData = useMemo(() => {
        if (!activeBudget || !activeBudget.budget_lines) return null;

        const budgetTransactions = transactions.filter(tx => {
            const txDate = new Date(tx.date);
            return tx.amount < 0 && 
                   txDate >= new Date(activeBudget.start_date) && 
                   txDate <= new Date(activeBudget.end_date);
        });

        const totalLimit = activeBudget.budget_lines.reduce((sum, line) => sum + line.limit_amount, 0);
        const totalSpent = budgetTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        
        const linesWithSpent = activeBudget.budget_lines.map(line => {
            const spent = budgetTransactions
                .filter(tx => tx.category_id === line.category_id)
                .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
            return { ...line, spent_amount: spent };
        });

        return {
            ...activeBudget,
            total_limit: totalLimit,
            total_spent: totalSpent,
            budget_lines: linesWithSpent,
        };
    }, [activeBudget, transactions]);

    if (!budgetData) {
        return (
            <div className="animate-fade-in-up flex flex-col items-center justify-center text-center h-full p-4">
                <div className="bg-emerald-500/10 p-6 rounded-full border-2 border-emerald-500/30 mb-6">
                    <ClipboardListIcon />
                </div>
                <h1 className="text-3xl font-bold text-white">{t('budgetScreen.noBudgetTitle')}</h1>
                <p className="max-w-md text-md text-gray-400 mt-4">{t('budgetScreen.noBudgetDesc')}</p>
                <button className="mt-8 text-md font-semibold bg-emerald-600 px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors active:scale-95 transform">
                    {t('budgetScreen.createBudget')}
                </button>
            </div>
        );
    }

    const { name, total_limit = 0, total_spent = 0, budget_lines = [] } = budgetData;
    const overallProgress = total_limit > 0 ? (total_spent / total_limit) * 100 : 0;
    const overallRemaining = total_limit - total_spent;

    return (
        <div className="animate-fade-in-up space-y-8 pb-8">
             <div>
                <h1 className="text-3xl font-bold text-white">{name}</h1>
                <p className="text-md text-gray-400">{t('budgetScreen.subtitle')}</p>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-3">{t('budgetScreen.overallBudget')}</h2>
                <BudgetProgressBar progress={overallProgress} />
                <div className="flex justify-between items-baseline mt-2">
                    <div>
                        <p className="text-2xl font-bold text-white">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(total_spent)}</p>
                        <p className="text-sm text-gray-400">{t('budgetScreen.spentOf')} {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(total_limit)}</p>
                    </div>
                    <div className="text-right">
                         <p className={`text-lg font-bold ${overallRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Math.abs(overallRemaining))}
                         </p>
                         <p className="text-sm text-gray-400">{overallRemaining >= 0 ? t('budgetScreen.remaining') : t('budgetScreen.overspent')}</p>
                    </div>
                </div>
            </div>
            
             <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white px-1">{t('budgetScreen.categories')}</h2>
                {budget_lines.map(line => (
                     <CategoryBudgetLine 
                        key={line.id}
                        category={line.category || { name: 'Unknown' }}
                        limit={line.limit_amount}
                        spent={line.spent_amount || 0}
                    />
                ))}
            </div>

            <div className="bg-indigo-900/40 p-4 rounded-lg border border-indigo-500/30">
                <p className="font-bold text-indigo-300 text-sm">💡 Coach's Suggestion</p>
                <p className="text-xs text-gray-300 mt-1">
                    Your Transport spending is at 90%! Consider moving ₦5,000 from your Entertainment budget to stay on track.
                </p>
            </div>
        </div>
    );
};

export default Budget;
