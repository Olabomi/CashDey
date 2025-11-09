import React, { useMemo, useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useToast } from '../contexts/ToastContext';
import { useData } from '../contexts/DataContext';
import { ReceiptPercentIcon, ZapIcon, CashFlowIcon, UserPlusIcon, TrophyIcon, GiftIcon, QuestionIcon, AddMoneyIcon, ClockIcon, MedalIcon } from './icons';
import RewardsRedemptionModal, { type RedemptionType } from './RewardsRedemptionModal';


interface RewardHistoryItem {
    description: string;
    details: string;
    amount: string;
    date: string;
    status: 'credited' | 'pending';
}

const Section: React.FC<{title: string; children: React.ReactNode;}> = ({ title, children }) => (
    <div>
        <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
        <div className="bg-gray-800/50 rounded-xl backdrop-blur-sm border border-white/10 p-4">
            {children}
        </div>
    </div>
);


const RewardsCenter: React.FC = () => {
    const { t } = useLocale();
    const { addToast } = useToast();
    const { wallet } = useData();

    const [isRedemptionModalOpen, setIsRedemptionModalOpen] = useState(false);
    const [redemptionType, setRedemptionType] = useState<RedemptionType>('bill');
    
    const [currentCashPoints, setCurrentCashPoints] = useState(wallet?.cashPoints ?? 0);

    // FIX: Explicitly type the array inside useMemo to prevent TypeScript from inferring `status` as a generic `string`.
    const initialHistory: RewardHistoryItem[] = useMemo(() => {
        const historyItems: RewardHistoryItem[] = [
            { description: t('rewardsScreen.historyReferral'), details: t('rewardsScreen.historyReferralDesc'), amount: '+ ₦500.00', date: 'July 25, 2024', status: 'credited' },
            { description: t('rewardsScreen.historyCashback'), details: t('rewardsScreen.historyCashbackPendingDesc'), amount: '+ ₦250.00', date: 'July 28, 2024', status: 'pending' },
            { description: t('rewardsScreen.historyChallenge'), details: t('rewardsScreen.historyChallengeDesc'), amount: '+ ₦250.00', date: 'July 20, 2024', status: 'credited' },
            { description: t('rewardsScreen.historyCashback'), details: t('rewardsScreen.historyCashbackCreditedDesc'), amount: '+ ₦250.00', date: 'July 15, 2024', status: 'credited' }
        ];
        return historyItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [t]);
    
    const [rewardsHistory, setRewardsHistory] = useState<RewardHistoryItem[]>(initialHistory);

    const useRewardsActions = [
        { id: 'bill' as RedemptionType, icon: <ReceiptPercentIcon />, title: t('rewardsScreen.useBillPay'), description: t('rewardsScreen.useBillPayDesc') },
        { id: 'airtime' as RedemptionType, icon: <ZapIcon />, title: t('rewardsScreen.useAirtime'), description: t('rewardsScreen.useAirtimeDesc') },
        { id: 'cash' as RedemptionType, icon: <CashFlowIcon />, title: t('rewardsScreen.useConvertToCash'), description: t('rewardsScreen.useConvertToCashDesc') }
    ];

    const earnRewardsOffers = [
        { emoji: '💸', icon: <UserPlusIcon />, title: t('walletScreen.rewards.referTitle'), description: t('walletScreen.rewards.referDesc') },
        { emoji: '🎯', icon: <TrophyIcon />, title: t('walletScreen.rewards.goalTitle'), description: t('walletScreen.rewards.goalDesc') },
        { emoji: '🥇', icon: <MedalIcon />, title: t('rewardsScreen.milestoneTitle'), description: t('rewardsScreen.milestoneDesc') },
        { emoji: '🔌', icon: <ReceiptPercentIcon />, title: t('walletScreen.rewards.cashbackTitle'), description: t('walletScreen.rewards.cashbackDesc') },
        { emoji: '📊', icon: <ZapIcon />, title: t('walletScreen.rewards.streakTitle'), description: t('walletScreen.rewards.streakDesc') },
        { emoji: '🧠', icon: <QuestionIcon />, title: t('rewardsScreen.triviaTitle'), description: t('rewardsScreen.triviaDesc') },
        { emoji: '💳', icon: <AddMoneyIcon />, title: t('rewardsScreen.topUpTitle'), description: t('rewardsScreen.topUpDesc') }
    ];

    const handleSimulateReward = () => {
        addToast(t('rewardsScreen.rewardNotification', { amount: '500' }), 'success');
    };

    const handleOpenRedemptionModal = (type: RedemptionType) => {
        setRedemptionType(type);
        setIsRedemptionModalOpen(true);
    };

    const handleRedeemSubmit = (type: RedemptionType, amount: number, target?: string) => {
        setIsRedemptionModalOpen(false);
        
        setCurrentCashPoints(prev => prev - amount);

        let toastMessage = '';
        let historyItem: RewardHistoryItem;
        const amountFormatted = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
        const now = new Date();

        switch(type) {
            case 'bill':
                toastMessage = t('rewardsScreen.rewardsRedemption.successBill', { amount: amountFormatted, target });
                historyItem = { description: 'Bill Payment', details: `Paid ${target}`, amount: `- ${amountFormatted}`, date: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), status: 'credited' };
                break;
            case 'airtime':
                toastMessage = t('rewardsScreen.rewardsRedemption.successAirtime', { amount: amountFormatted, target });
                historyItem = { description: 'Airtime Purchase', details: `For ${target}`, amount: `- ${amountFormatted}`, date: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), status: 'credited' };
                break;
            case 'cash':
            default:
                toastMessage = t('rewardsScreen.rewardsRedemption.successCash', { amount: amountFormatted });
                 historyItem = { description: 'Converted to Spendable', details: `Moved to main wallet`, amount: `- ${amountFormatted}`, date: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), status: 'credited' };
                break;
        }

        setRewardsHistory(prev => [historyItem, ...prev]);
        addToast(toastMessage, 'success');
    };

    return (
        <>
        <div className="animate-fade-in-up space-y-8 pb-8">
            <div className="p-6 text-center bg-gradient-to-br from-amber-800/50 to-gray-800/60 rounded-2xl backdrop-blur-sm border border-amber-500/30 shadow-2xl">
                <p className="text-sm font-medium text-gray-300">{t('rewardsScreen.currentBalance')}</p>
                <h2 className="text-5xl font-bold text-amber-300 mt-1">
                    {new Intl.NumberFormat().format(currentCashPoints)}
                </h2>
            </div>

            <Section title={t('rewardsScreen.useRewardsTitle')}>
                <div className="space-y-3">
                    {useRewardsActions.map(action => (
                        <button key={action.id} onClick={() => handleOpenRedemptionModal(action.id)} className="w-full flex items-center p-3 text-left bg-gray-700/50 hover:bg-gray-700/80 rounded-lg transition-colors">
                            <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400 mr-4">{action.icon}</div>
                            <div>
                                <p className="font-semibold text-white">{action.title}</p>
                                <p className="text-xs text-gray-400">{action.description}</p>
                            </div>
                            <svg className="w-5 h-5 text-gray-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    ))}
                </div>
            </Section>

            <Section title={t('rewardsScreen.earnRewardsTitle')}>
                 <div className="space-y-3">
                    {earnRewardsOffers.map(offer => (
                        <div key={offer.title} className="flex items-start p-3 bg-gray-700/50 rounded-lg">
                             <div className="p-1 rounded-full bg-gray-900/50 text-2xl mr-4">{offer.emoji}</div>
                            <div>
                                <p className="font-semibold text-white">{offer.title}</p>
                                <p className="text-xs text-gray-400">{offer.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            <Section title={t('rewardsScreen.historyTitle')}>
                <div className="divide-y divide-white/10">
                    {rewardsHistory.map((item, index) => {
                        const isPending = item.status === 'pending';
                        const isCredit = item.amount.startsWith('+');
                        const amountColor = isPending ? 'text-gray-400' : (isCredit ? 'text-amber-400' : 'text-rose-400');

                        return (
                            <div key={index} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                <div className="flex items-center space-x-4">
                                <div className={`p-2 rounded-full ${isPending ? 'bg-gray-500/10 text-gray-400' : (isCredit ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400')}`}>
                                    {isPending ? <ClockIcon /> : (isCredit ? <GiftIcon /> : <ZapIcon />)}
                                </div>
                                    <div>
                                        <p className={`font-medium ${isPending ? 'text-gray-300' : 'text-white'}`}>{item.description}</p>
                                        <p className="text-xs text-gray-400">{item.details}</p>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-2">
                                    <p className={`font-bold text-md ${amountColor}`}>{item.amount}</p>
                                    <p className={`text-xs ${isPending ? 'text-gray-500 font-semibold' : 'text-gray-500'}`}>{isPending ? t('rewardsScreen.pending') : item.date}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Section>

            <button onClick={handleSimulateReward} className="w-full text-center bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/40 transition p-3 rounded-lg font-medium text-sm">
                {t('rewardsScreen.simulateRewardButton')}
            </button>
        </div>
        <RewardsRedemptionModal 
            show={isRedemptionModalOpen} 
            onClose={() => setIsRedemptionModalOpen(false)} 
            onSubmit={handleRedeemSubmit} 
            type={redemptionType} 
            balance={currentCashPoints}
        />
        </>
    );
};

export default RewardsCenter;