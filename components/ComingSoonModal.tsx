import React from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { CloseIcon } from './icons';

interface ComingSoonModalProps {
  show: boolean;
  onClose: () => void;
  featureName: string;
}

const ComingSoonModal: React.FC<ComingSoonModalProps> = ({ show, onClose, featureName }) => {
    const { t } = useLocale();

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-white/10 rounded-2xl shadow-xl w-full max-w-sm m-4 p-6 text-center animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white text-left">{featureName} is Coming Soon!</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors"><CloseIcon className="w-5 h-5" /></button>
                </div>
                <p className="text-gray-300">This feature is currently in beta testing. We're working hard to get it ready for you.</p>
                <p data-testid="coming-soon-bonus" className="mt-4 text-sm font-semibold bg-emerald-900/50 text-emerald-300 p-3 rounded-lg border border-emerald-500/30">{t('modals.comingSoonBonus')}</p>
                <button onClick={onClose} className="mt-6 w-full bg-emerald-600 text-white rounded-lg py-2.5 hover:bg-emerald-700 transition-colors active:scale-95 transform font-semibold">
                    {t('modals.close')}
                </button>
            </div>
        </div>
    );
};

export default ComingSoonModal;
