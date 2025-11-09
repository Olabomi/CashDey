import React from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';
import { CloseIcon, CopyIcon, ShareIcon, TrophyIcon, ZapIcon, UserPlusIcon } from './icons';

interface ShareProgressModalProps {
    show: boolean;
    onClose: () => void;
}

const StatItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => (
    <div className="bg-gray-700/50 p-4 rounded-lg text-center">
        <div className={`mx-auto w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 ${color}`}>{icon}</div>
        <p className="text-2xl font-bold text-white mt-2">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
    </div>
);


const ShareProgressModal: React.FC<ShareProgressModalProps> = ({ show, onClose }) => {
    const { t } = useLocale();
    const { user } = useData();
    const { addToast } = useToast();

    if (!show || !user) return null;

    const stats = {
        totalSaved: user.totalSaved,
        streak: user.checkin_streak,
        referrals: 7, // Mocked for now
        referralCode: user.referral_code,
    };

    const shareText = t('bragModal.shareTextBody', {
        totalSaved: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', notation: 'compact' }).format(stats.totalSaved),
        streak: stats.streak,
        referrals: stats.referrals,
        referralCode: stats.referralCode,
    });

    const handleCopy = () => {
        navigator.clipboard.writeText(shareText);
        addToast(t('bragModal.copied'), 'success');
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: t('bragModal.shareTextTitle'),
                text: shareText,
                url: window.location.href, // Or a specific invite URL
            });
        } else {
            handleCopy();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-white/10 rounded-2xl shadow-xl w-full max-w-sm m-4 p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">{t('bragModal.title')}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors"><CloseIcon className="w-5 h-5" /></button>
                </div>
                
                <div data-testid="share-progress-content" className="p-4 bg-gray-900/50 border-2 border-dashed border-emerald-500/30 rounded-lg text-center">
                    <img src="/logo-a.png" alt="CashDey" className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-bold text-lg text-white">My CashDey Journey!</p>
                    <p className="text-sm text-gray-300">@{user.nickname || user.name}</p>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        <StatItem icon={<TrophyIcon />} label="Total Saved" value={new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', notation: 'compact' }).format(stats.totalSaved)} color="text-emerald-400" />
                        <StatItem icon={<ZapIcon />} label="Day Streak" value={stats.streak} color="text-amber-400" />
                        <StatItem icon={<UserPlusIcon />} label="Referrals" value={stats.referrals} color="text-blue-400" />
                    </div>
                     <div className="mt-4 text-center">
                        <p className="text-xs text-gray-400">Join me with code:</p>
                        <p className="font-mono font-bold text-emerald-300 bg-gray-700/50 inline-block px-3 py-1 rounded-md mt-1">{stats.referralCode}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3 mt-6">
                    <button onClick={handleCopy} className="w-full flex items-center justify-center space-x-2 p-2.5 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600 transition-colors active:scale-95 transform font-semibold">
                        <CopyIcon className="w-5 h-5" />
                        <span>{t('bragModal.copy')}</span>
                    </button>
                    <button onClick={handleShare} className="w-full flex items-center justify-center space-x-2 p-2.5 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-600 transition-all active:scale-95 transform font-semibold">
                        <ShareIcon className="w-5 h-5" />
                        <span>{t('bragModal.share')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareProgressModal;