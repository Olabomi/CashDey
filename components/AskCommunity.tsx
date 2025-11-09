import React from 'react';
import { QuestionIcon } from './icons';
import { useLocale } from '../contexts/LocaleContext';

const AskCommunity: React.FC = () => {
    const { t } = useLocale();
    return (
        <div className="animate-fade-in-up flex flex-col items-center justify-center text-center h-full p-4">
            <div className="bg-indigo-500/10 p-6 rounded-full border-2 border-indigo-500/30 mb-6">
                <QuestionIcon />
            </div>
            <h1 className="text-3xl font-bold text-white">{t('askCommunityScreen.title')}</h1>
            <p className="text-lg text-gray-300 mt-2">{t('askCommunityScreen.subtitle')}</p>
            <p className="max-w-md text-md text-gray-400 mt-6">
                {t('askCommunityScreen.description')}
            </p>
            <div className="mt-8 bg-gray-700 text-indigo-300 font-bold py-3 px-6 rounded-lg text-lg">
                {t('askCommunityScreen.comingSoon')}
            </div>
        </div>
    );
};

export default AskCommunity;