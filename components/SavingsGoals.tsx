import React from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useData } from '../contexts/DataContext';
import { ClockIcon } from './icons';

const ProgressBar = ({ progress, color }: { progress: number, color: string }) => (
    <div className="w-full bg-gray-700 rounded-full h-3">
        <div className={`${color} h-3 rounded-full transition-all duration-500 ease-out`} style={{ width: `${progress}%` }}></div>
    </div>
);

const GoalCard: React.FC<{
    emoji: string;
    title: string;
    saved: number;
    target: number;
    deadline: string;
    color: string;
}> = ({ emoji, title, saved, target, deadline, color }) => {
    const progress = (saved / target) * 100;
    const savedFormatted = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(saved);
    const targetFormatted = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(target);
    const remaining = target - saved;
    const remainingFormatted = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(remaining);

    // Simulate an average saving rate to calculate estimated completion
    const averageMonthlySaving = 25000; // Example: ₦25,000 per month
    const monthsRemaining = remaining > 0 ? Math.ceil(remaining / averageMonthlySaving) : 0;
    const estimatedCompletionDate = new Date();
    estimatedCompletionDate.setMonth(estimatedCompletionDate.getMonth() + monthsRemaining);
    const estimatedDateFormatted = estimatedCompletionDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });


    return (
        <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-white/10 flex flex-col">
            <div className="flex items-center space-x-4 mb-4">
                <div className="text-4xl">{emoji}</div>
                <div>
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <p className="text-sm text-gray-400">Target Date: {deadline}</p>
                </div>
            </div>
            <div className="flex-grow">
                <ProgressBar progress={progress} color={color} />
                <div className="flex justify-between text-sm mt-2">
                    <span className="font-semibold text-white">{savedFormatted}</span>
                    <span className="text-gray-400">{targetFormatted}</span>
                </div>
            </div>
            {progress < 100 && (
                <div className="mt-4 pt-3 border-t border-white/10 text-xs text-gray-300 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-400">Amount Left:</span>
                        <span className="font-semibold text-amber-400">{remainingFormatted}</span>
                    </div>
                    <div className="flex justify-between items-center">
                         <span className="font-medium text-gray-400 flex items-center">
                            <ClockIcon />
                            <span className="ml-1.5">Est. Completion:</span>
                        </span>
                        <span className="font-semibold text-white">{estimatedDateFormatted}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const SavingsGoals: React.FC = () => {
    const { t } = useLocale();
    const { savingsGoals } = useData();

    if (!savingsGoals) {
        return <div className="text-center text-gray-400">Loading savings goals...</div>;
    }

    const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-indigo-500', 'bg-rose-500'];

    return (
        <div className="animate-fade-in-up space-y-8 pb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">{t('savings.title')}</h1>
                    <p className="text-md text-gray-400">{t('savings.subtitle')}</p>
                </div>
                <button className="text-sm font-semibold bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors active:scale-95 transform">
                    {t('savings.addGoal')}
                </button>
            </div>
            
            <div className="bg-emerald-900/40 p-4 rounded-lg border border-emerald-500/30">
                <p className="font-bold text-emerald-300 text-sm">💡 {t('savings.aiSuggestionTitle')}</p>
                <p className="text-xs text-gray-300 mt-1">{t('savings.aiSuggestionBody')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savingsGoals.map((goal, index) => (
                    <GoalCard 
                        key={goal.id}
                        emoji={goal.emoji}
                        title={goal.title}
                        saved={goal.saved}
                        target={goal.target}
                        deadline={goal.deadline}
                        color={colors[index % colors.length]}
                    />
                ))}
            </div>
        </div>
    );
};

export default SavingsGoals;
