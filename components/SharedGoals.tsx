import React from 'react';
import { UsersIcon } from './icons';
import { useLocale } from '../contexts/LocaleContext';

const SharedGoals: React.FC = () => {
    const { t } = useLocale();
    return (
        <div className="animate-fade-in-up flex flex-col items-center justify-center text-center h-full p-4">
            <div className="bg-blue-500/10 p-6 rounded-full border-2 border-blue-500/30 mb-6">
                <UsersIcon />
            </div>
            <h1 className="text-3xl font-bold text-white">{t('sharedGoalsScreen.title')}</h1>
            <p className="text-lg text-gray-300 mt-2">{t('sharedGoalsScreen.subtitle')}</p>
            <p className="max-w-md text-md text-gray-400 mt-6">
                {t('sharedGoalsScreen.description')}
            </p>
            <div className="mt-8 bg-gray-700 text-blue-300 font-bold py-3 px-6 rounded-lg text-lg">
                {t('sharedGoalsScreen.comingSoon')}
            </div>
        </div>
    );
};

export default SharedGoals;