import React from 'react';
import { AjoIcon } from './icons';
import { useLocale } from '../contexts/LocaleContext';

const Ajo: React.FC = () => {
    const { t } = useLocale();
    return (
        <div className="animate-fade-in-up flex flex-col items-center justify-center text-center h-full p-4">
            <div className="bg-emerald-500/10 p-6 rounded-full border-2 border-emerald-500/30 mb-6">
                <AjoIcon />
            </div>
            <h1 className="text-3xl font-bold text-white">{t('ajoScreen.title')}</h1>
            <p className="text-lg text-gray-300 mt-2">{t('ajoScreen.subtitle')}</p>
            <p className="max-w-md text-md text-gray-400 mt-6">
                {t('ajoScreen.description')}
            </p>
            <div className="mt-8 bg-gray-700 text-emerald-300 font-bold py-3 px-6 rounded-lg text-lg">
                {t('ajoScreen.comingSoon')}
            </div>
        </div>
    );
};

export default Ajo;
