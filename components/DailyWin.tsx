import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useLocale } from '../contexts/LocaleContext';
import { CheckCircleIcon, ZapIcon } from './icons';

const DailyWin: React.FC = () => {
    const { user, performDailyCheckin } = useData();
    const { t } = useLocale();
    const [isLoading, setIsLoading] = useState(false);

    const canCheckIn = useMemo(() => {
        // FIX: Changed property access from camelCase (lastCheckinDate) to snake_case (last_checkin_date) to match the type definition.
        if (!user?.last_checkin_date) return true;
        const today = new Date().toDateString();
        // FIX: Changed property access from camelCase (lastCheckinDate) to snake_case (last_checkin_date) to match the type definition.
        const lastCheckin = new Date(user.last_checkin_date).toDateString();
        return today !== lastCheckin;
    }, [user]);

    const handleCheckin = async () => {
        setIsLoading(true);
        await performDailyCheckin();
        setIsLoading(false);
    };
    
    // FIX: Changed property access from camelCase (checkinStreak) to snake_case (checkin_streak) to match the type definition.
    const streak = user?.checkin_streak ?? 0;

    return (
        <div className="bg-gradient-to-tr from-gray-800/80 to-gray-900/50 p-4 rounded-xl backdrop-blur-sm border border-white/10">
            <h2 className="font-semibold text-lg text-white mb-3">{t('dailyWin.title')}</h2>
            
            {canCheckIn ? (
                <button 
                    onClick={handleCheckin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-between p-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all active:scale-95 transform font-semibold text-left disabled:bg-emerald-800 disabled:cursor-not-allowed"
                >
                    <div className="flex items-center">
                        <ZapIcon />
                        <span className="ml-2">{t('dailyWin.checkinButton')}</span>
                    </div>
                    {isLoading ? (
                         <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded-full">+10 CP</span>
                    )}
                </button>
            ) : (
                <div 
                    className="w-full flex items-center justify-between p-3 bg-gray-700/60 text-gray-300 rounded-lg text-left"
                >
                    <div className="flex items-center">
                        <CheckCircleIcon className="text-emerald-400" />
                        <span className="ml-2 font-semibold">{t('dailyWin.completed')}</span>
                    </div>
                    {streak > 0 && (
                        <div className="text-sm font-bold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full flex items-center">
                           <span className="mr-1.5">🔥</span> {t('dailyWin.streak', { count: streak })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DailyWin;