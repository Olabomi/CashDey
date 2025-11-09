import React, { useMemo, useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useToast } from '../contexts/ToastContext';
import { useData } from '../contexts/DataContext';
import { useModal } from '../contexts/ModalContext';
import { CopyIcon, ShareIcon, UserPlusIcon, ZapIcon, BankIcon, TrophyIcon } from './icons';
import Tooltip from './Tooltip';

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; tooltipText: string; }> = ({ icon, label, value, tooltipText }) => (
    <Tooltip text={tooltipText}>
      <div className="bg-gray-700/50 p-4 rounded-lg flex items-center space-x-3">
          <div className="text-emerald-400">{icon}</div>
          <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-lg font-bold text-white">{value}</p>
          </div>
      </div>
    </Tooltip>
);

type ReferralStatus = 'funded' | 'registered' | 'pending';
interface Referral {
    name: string;
    status: ReferralStatus;
    reward: number;
}

const TopReferrers: React.FC = () => {
    const { t } = useLocale();
    const topReferrers = [
        { name: 'Amaka Nwosu', count: 21, tier: 'Gold' },
        { name: 'Dayo Johnson', count: 15, tier: 'Silver' },
        { name: 'Sade Williams', count: 11, tier: 'Bronze' },
    ];
    
    const tierColor = (tier: string) => {
        if (tier === 'Gold') return 'text-amber-400';
        if (tier === 'Silver') return 'text-gray-300';
        return 'text-yellow-700'; // Bronze
    };

    return (
        <div>
            <h2 className="text-lg font-semibold text-white mb-3">{t('referralsScreen.leaderboardTitle')}</h2>
            <div className="bg-gray-800/50 rounded-xl backdrop-blur-sm border border-white/10 p-4 space-y-3">
                {topReferrers.map((referrer, index) => (
                    <div key={referrer.name} className="flex items-center justify-between p-2 rounded-md hover:bg-white/5">
                        <div className="flex items-center space-x-3">
                            <span className={`font-bold text-lg w-6 text-center ${index < 3 ? 'text-white' : 'text-gray-400'}`}>{index + 1}</span>
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center ring-2 ring-emerald-500/30">
                                <span className="font-bold text-emerald-400">{referrer.name.charAt(0)}</span>
                            </div>
                            <p className="font-medium text-white">{referrer.name}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                           <span className={`font-bold ${tierColor(referrer.tier)}`}>
                                <TrophyIcon />
                           </span>
                           <span className="font-bold text-white text-lg">{referrer.count}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const Referrals: React.FC = () => {
    const { t } = useLocale();
    const { addToast } = useToast();
    const { user } = useData();
    const { openModal } = useModal();
    const referralCode = user?.referral_code || "CASHDEY-USER";

    const stats = {
        invited: 12,
        active: 7,
        earned: 3500,
    };

    const invitedFriends: Referral[] = useMemo(() => [
        { name: 'Tunde Adebayo', status: 'funded', reward: 500 },
        { name: 'Ada Okoro', status: 'registered', reward: 0 },
        { name: 'Chika Nwosu', status: 'pending', reward: 0 },
        { name: 'Bolanle Ojo', status: 'funded', reward: 500 },
        { name: 'Emeka Eze', status: 'funded', reward: 500 },
    ], []);

    const handleCopy = () => {
        navigator.clipboard.writeText(referralCode);
        addToast(t('referralsScreen.copied'), 'success');
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Join CashDey!',
                text: `Join CashDey, Naija’s Financial OS! Use my code ${referralCode} and get a ₦500 welcome bonus when you fund your wallet.`,
                url: `https://cashdey.app/invite/${referralCode}`,
            });
        } else {
            handleCopy();
            alert('Share API not supported. Referral code copied to clipboard.');
        }
    };

    const StatusBadge: React.FC<{ status: ReferralStatus }> = ({ status }) => {
        const details = {
            funded: { text: t('referralsScreen.statusFunded'), color: 'bg-emerald-500/20 text-emerald-300' },
            registered: { text: t('referralsScreen.statusRegistered'), color: 'bg-blue-500/20 text-blue-300' },
            pending: { text: t('referralsScreen.statusPending'), color: 'bg-amber-500/20 text-amber-300' },
        }[status];
        return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${details.color}`}>{details.text}</span>;
    };

    return (
        <div className="animate-fade-in-up space-y-8 pb-8">
            <div className="p-6 bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-white/10 text-center">
                <p className="text-sm font-medium text-gray-300">{t('referralsScreen.yourCode')}</p>
                <div className="my-3 p-3 bg-gray-900/50 border-2 border-dashed border-emerald-500/30 rounded-lg">
                    <p data-testid="referral-code" className="text-2xl font-bold tracking-widest text-emerald-300">{referralCode}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Tooltip text={t('tooltips.copyCode')}>
                      <button onClick={handleCopy} className="flex items-center justify-center space-x-2 p-3 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600 transition-colors active:scale-95 transform font-semibold">
                          <CopyIcon className="w-5 h-5" />
                          <span>{t('referralsScreen.copy')}</span>
                      </button>
                    </Tooltip>
                    <Tooltip text={t('tooltips.shareCode')}>
                      <button onClick={handleShare} className="flex items-center justify-center space-x-2 p-3 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-600 transition-all active:scale-95 transform font-semibold">
                          <ShareIcon className="w-5 h-5" />
                          <span>{t('referralsScreen.share')}</span>
                      </button>
                    </Tooltip>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard icon={<UserPlusIcon />} label={t('referralsScreen.invitedFriends')} value={String(stats.invited)} tooltipText={t('tooltips.invitedFriends')} />
                <StatCard icon={<ZapIcon />} label={t('referralsScreen.activeReferrals')} value={String(stats.active)} tooltipText={t('tooltips.activeReferrals')} />
                <StatCard icon={<BankIcon />} label={t('referralsScreen.totalEarned')} value={new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(stats.earned)} tooltipText={t('tooltips.totalEarned')} />
            </div>

            <button
                data-testid="share-progress-button"
                onClick={handleShare}
                className="w-full text-center bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/40 transition p-3 rounded-lg font-semibold"
            >
                {t('profile.bragMode')}
            </button>

            <div>
                <h2 className="text-lg font-semibold text-white mb-3">{t('referralsScreen.trackInvites')}</h2>
                <div className="bg-gray-800/50 rounded-xl backdrop-blur-sm border border-white/10 p-4">
                    <div className="divide-y divide-white/10">
                        {invitedFriends.map((friend, index) => (
                            <div key={index} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                <div>
                                    <p className="font-medium text-white">{friend.name}</p>
                                    <StatusBadge status={friend.status} />
                                </div>
                                <p className={`font-bold text-md ${friend.reward > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                                    {friend.reward > 0 ? `+ ${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(friend.reward)}` : '-'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <TopReferrers />
        </div>
    );
};

export default Referrals;