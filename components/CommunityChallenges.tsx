import React from 'react';
import { TrophyIcon } from './icons';
import { useLocale } from '../contexts/LocaleContext';

const CommunityChallenges: React.FC = () => {
    const { t } = useLocale();
    return (
        <div className="animate-fade-in-up flex flex-col items-center justify-center text-center h-full p-4">
            <div className="bg-amber-500/10 p-6 rounded-full border-2 border-amber-500/30 mb-6">
                <TrophyIcon />
            </div>
            <h1 className="text-3xl font-bold text-white">{t('challengesScreen.title')}</h1>
            <p className="text-lg text-gray-300 mt-2">{t('challengesScreen.subtitle')}</p>
            <p className="max-w-md text-md text-gray-400 mt-6">
                {t('challengesScreen.description')}
            </p>
            <div className="mt-8 bg-gray-700 text-amber-300 font-bold py-3 px-6 rounded-lg text-lg">
                {t('challengesScreen.comingSoon')}
            </div>
        </div>
    );
};

export default CommunityChallenges;