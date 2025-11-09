import React, { useState, useMemo } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useData } from '../contexts/DataContext';
import { useModal } from '../contexts/ModalContext';
import { 
    AddMoneyIcon, SendMoneyIcon, GiftIcon, ListBulletIcon, SearchIcon, UserPlusIcon, 
    ReceiptPercentIcon, TrophyIcon, ZapIcon, PencilIcon, WithdrawIcon, AirtimeIcon, 
    DataIcon, PowerIcon, DownloadIcon, CoachIcon, ShieldIcon, WalletIcon 
} from './icons';
import type { Transaction } from '../types';

type SortOrder = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
const ITEMS_PER_PAGE = 10;

const StatusBadge: React.FC<{ status: Transaction['status'] }> = ({ status }) => {
    const details = {
        completed: { text: 'Completed', color: 'bg-emerald-500/20 text-emerald-300' },
        pending: { text: 'Pending', color: 'bg-amber-500/20 text-amber-300' },
        failed: { text: 'Failed', color: 'bg-rose-500/20 text-rose-300' },
    }[status];
    if (!details) return null;
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${details.color}`}>{details.text}</span>;
};


const BalanceBreakdownCard: React.FC<{ label: string; amount: number; color: string; icon: React.ReactNode }> = ({ label, amount, color, icon }) => (
    <div className="bg-gray-700/50 p-3 rounded-lg flex-1">
        <div className="flex items-center space-x-2">
            <span className={color}>{icon}</span>
            <p className="text-xs text-gray-300">{label}</p>
        </div>
        <p className="text-xl font-bold text-white mt-1">
            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount)}
        </p>
    </div>
);

const QuickActionButton: React.FC<{ label: string; icon: React.ReactNode; onClick: () => void }> = ({ label, icon, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center space-y-2 text-center group">
        <div className="p-3 bg-gray-700/80 rounded-full text-emerald-400 group-hover:bg-emerald-600/50 group-hover:text-white transition-all">
            {icon}
        </div>
        <p className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">{label}</p>
    </button>
);

const GoalSummaryCard: React.FC<{ emoji: string; title: string; saved: number; target: number; }> = ({ emoji, title, saved, target }) => (
    <div className="flex-shrink-0 w-48 bg-gray-700/60 p-4 rounded-xl space-y-2 text-left">
        <p className="text-2xl">{emoji}</p>
        <p className="font-bold text-white text-sm">{title}</p>
        <div>
            <div className="w-full bg-gray-600 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(saved/target)*100}%` }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', notation: 'compact' }).format(saved)} / {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', notation: 'compact' }).format(target)}
            </p>
        </div>
    </div>
);

const EarnMoreCard: React.FC<{ icon: React.ReactNode; title: string; description: string; actionText: string; onClick: () => void }> = ({ icon, title, description, actionText, onClick }) => (
    <div className="flex items-center p-3 bg-gray-700/50 hover:bg-gray-700/80 rounded-lg transition-colors">
        <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400 mr-4">{icon}</div>
        <div className="flex-grow">
            <p className="font-semibold text-white">{title}</p>
            <p className="text-xs text-gray-400">{description}</p>
        </div>
        <button onClick={onClick} className="text-xs ml-2 font-semibold bg-emerald-600 px-3 py-1.5 rounded-full hover:bg-emerald-700 transition-colors active:scale-95 transform whitespace-nowrap">
            {actionText}
        </button>
    </div>
);


const Wallet: React.FC = () => {
    const { t } = useLocale();
    const { setActiveView } = useNavigation();
    const { openModal } = useModal();
    const { wallet, transactions, savingsGoals, categories } = useData();
    
    const [expandedTxId, setExpandedTxId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc');
    const [filters, setFilters] = useState({ type: 'all', categoryId: 'all' });
    const [currentPage, setCurrentPage] = useState(1);
    
    const filteredTransactions = useMemo(() => {
        let sorted = [...(transactions || [])].sort((a, b) => {
            switch (sortOrder) {
                case 'date-asc': return new Date(a.date).getTime() - new Date(b.date).getTime();
                case 'amount-desc': return b.amount - a.amount;
                case 'amount-asc': return a.amount - b.amount;
                case 'date-desc': default: return new Date(b.date).getTime() - new Date(a.date).getTime();
            }
        });

        // Apply text search
        if (searchQuery.trim()) {
            const lowercasedQuery = searchQuery.toLowerCase();
            sorted = sorted.filter(tx => 
                tx.description.toLowerCase().includes(lowercasedQuery) ||
                tx.category.name.toLowerCase().includes(lowercasedQuery) ||
                tx.party.toLowerCase().includes(lowercasedQuery) ||
                (tx.notes && tx.notes.toLowerCase().includes(lowercasedQuery))
            );
        }

        // Apply type and category filters
        return sorted.filter(tx => {
            const typeMatch = filters.type === 'all' || (filters.type === 'income' ? tx.amount > 0 : tx.amount < 0);
            const categoryMatch = filters.categoryId === 'all' || tx.category_id === parseInt(filters.categoryId);
            return typeMatch && categoryMatch;
        });
    }, [searchQuery, transactions, sortOrder, filters]);
    
    const groupedTransactions = useMemo(() => {
        return filteredTransactions.reduce((acc: Record<string, Transaction[]>, tx) => {
            const month = new Date(tx.date).toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!acc[month]) {
                acc[month] = [];
            }
            acc[month].push(tx);
            return acc;
        }, {});
    }, [filteredTransactions]);

    const paginatedMonths = useMemo(() => {
        const months = Object.keys(groupedTransactions);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        // This is a simplified pagination logic that paginates by transaction, not by month.
        // A more complex logic could paginate by groups of months.
        const paginatedTxs = filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
        return paginatedTxs.reduce((acc: Record<string, Transaction[]>, tx) => {
            const month = new Date(tx.date).toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!acc[month]) {
                acc[month] = [];
            }
            acc[month].push(tx);
            return acc;
        }, {});

    }, [groupedTransactions, currentPage, filteredTransactions]);

    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

    const earnMoreActions = [
        {
            icon: <UserPlusIcon />,
            title: t('walletScreen.rewards.referTitle'),
            description: t('walletScreen.rewards.referDesc'),
            actionText: t('walletScreen.rewards.referAction'),
            onClick: () => setActiveView('referrals'),
        },
        {
            icon: <TrophyIcon />,
            title: t('walletScreen.rewards.goalTitle'),
            description: t('walletScreen.rewards.goalDesc'),
            actionText: t('walletScreen.rewards.goalAction'),
            onClick: () => setActiveView('savings'),
        },
        {
            icon: <ReceiptPercentIcon />,
            title: t('walletScreen.rewards.cashbackTitle'),
            description: t('walletScreen.rewards.cashbackDesc'),
            actionText: t('walletScreen.rewards.cashbackAction'),
            onClick: () => openModal('comingSoon', { featureName: 'Bill Payments' }),
        },
         {
            icon: <ZapIcon />,
            title: t('walletScreen.rewards.streakTitle'),
            description: t('walletScreen.rewards.streakDesc'),
            actionText: t('walletScreen.rewards.streakAction'),
            onClick: () => setActiveView('dashboard'),
        },
    ];

    return (
        <div className="animate-fade-in-up space-y-8 pb-8">
            {/* --- Hero Balance --- */}
            <div className="text-center" data-testid="wallet-balance">
                <p className="text-sm font-medium text-gray-300">{t('walletScreen.totalBalance')}</p>
                <h2 className="text-5xl font-bold text-white mt-1">
                    {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(wallet?.totalBalance ?? 0)}
                </h2>
            </div>
            
            {/* --- Balance Breakdown --- */}
            <div className="flex flex-wrap gap-3">
                <BalanceBreakdownCard label={t('walletScreen.spendable')} amount={wallet?.spendable ?? 0} color="text-emerald-400" icon={<WalletIcon />} />
                <BalanceBreakdownCard label={t('walletScreen.lockedInGoals')} amount={wallet?.lockedInGoals ?? 0} color="text-blue-400" icon={<TrophyIcon />} />
                <button onClick={() => setActiveView('rewards')} className="flex-1 min-w-[120px]">
                    <BalanceBreakdownCard label={t('walletScreen.cashPoints')} amount={wallet?.cashPoints ?? 0} color="text-amber-400" icon={<GiftIcon />} />
                </button>
            </div>

            {/* --- Primary Actions --- */}
            <div className="grid grid-cols-3 gap-4">
                <button data-testid="add-money-btn" onClick={() => openModal('comingSoon', { featureName: 'Add Money' })} className="flex items-center justify-center space-x-2 p-3 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-600 transition-all active:scale-95 transform font-semibold">
                    <AddMoneyIcon />
                    <span>{t('walletScreen.addMoney')}</span>
                </button>
                <button data-testid="send-money-btn" onClick={() => openModal('comingSoon', { featureName: 'Send Money' })} className="flex items-center justify-center space-x-2 p-3 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600 transition-colors active:scale-95 transform font-semibold">
                    <SendMoneyIcon />
                    <span>{t('walletScreen.sendMoney')}</span>
                </button>
                <button data-testid="withdraw-btn" onClick={() => openModal('comingSoon', { featureName: 'Withdraw' })} className="flex items-center justify-center space-x-2 p-3 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600 transition-colors active:scale-95 transform font-semibold">
                    <WithdrawIcon />
                    <span>{t('walletScreen.withdraw')}</span>
                </button>
            </div>

            {/* --- Quick Actions --- */}
            <div>
                 <h2 className="text-md font-semibold text-white mb-3 px-1">{t('walletScreen.quickActions')}</h2>
                 <div className="p-4 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-white/10 grid grid-cols-4 gap-4">
                    <QuickActionButton label={t('walletScreen.airtime')} icon={<AirtimeIcon />} onClick={() => openModal('comingSoon', { featureName: 'Airtime Purchase' })} />
                    <QuickActionButton label={t('walletScreen.data')} icon={<DataIcon />} onClick={() => openModal('comingSoon', { featureName: 'Data Purchase' })}/>
                    <QuickActionButton label={t('walletScreen.power')} icon={<PowerIcon />} onClick={() => openModal('comingSoon', { featureName: 'Utility Payments' })}/>
                    <QuickActionButton label={t('walletScreen.rewards.cashbackAction')} icon={<ReceiptPercentIcon />} onClick={() => openModal('comingSoon', { featureName: 'Bill Payments' })}/>
                 </div>
            </div>

             {/* --- Coach's Insight --- */}
            <div className="flex items-start space-x-3 bg-indigo-900/40 p-4 rounded-lg border border-indigo-500/30">
                <div className="text-indigo-400 flex-shrink-0 mt-1"><CoachIcon /></div>
                <div>
                    <p className="font-semibold text-indigo-300 text-sm">{t('walletScreen.coachInsightTitle')}</p>
                    <p className="text-xs text-gray-300 mt-1">{t('walletScreen.coachInsightBody')}</p>
                </div>
            </div>
            
             {/* --- Financial Goals --- */}
            <div>
                <div className="flex items-center justify-between mb-3 px-1">
                    <h2 className="text-md font-semibold text-white">{t('walletScreen.goals.title')}</h2>
                    <button onClick={() => setActiveView('savings')} className="text-sm font-semibold text-emerald-400 hover:text-emerald-300">
                        {t('walletScreen.goals.addGoal')}
                    </button>
                </div>
                <div className="flex items-center space-x-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
                    {savingsGoals?.slice(0, 4).map(goal => (
                        <GoalSummaryCard key={goal.id} {...goal} />
                    ))}
                </div>
            </div>

            {/* --- Ways to Earn More --- */}
            <div>
                <h2 className="text-md font-semibold text-white mb-3 px-1">{t('walletScreen.rewards.title')}</h2>
                <div className="p-4 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-white/10 space-y-3">
                    {earnMoreActions.map(action => (
                        <EarnMoreCard key={action.title} {...action} />
                    ))}
                </div>
            </div>

            {/* --- Transaction History --- */}
            <div data-testid="transaction-history">
                 <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-white">{t('walletScreen.transactions')}</h2>
                    <button className="flex items-center space-x-2 text-sm text-emerald-400 hover:text-emerald-300">
                        <DownloadIcon />
                        <span>{t('walletScreen.downloadStatement')}</span>
                    </button>
                </div>

                <div className="relative mb-2">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon /></span>
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('walletScreen.searchPlaceholder')} className="w-full bg-gray-700 border border-gray-600 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white transition-shadow" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 p-2 bg-gray-900/50 rounded-lg">
                    <select value={filters.type} onChange={e => setFilters(f => ({...f, type: e.target.value}))} className="bg-gray-700 border-gray-600 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        <option value="all">{t('walletScreen.allTypes')}</option>
                        <option value="income">{t('walletScreen.income')}</option>
                        <option value="expense">{t('walletScreen.expense')}</option>
                    </select>
                     <select value={filters.categoryId} onChange={e => setFilters(f => ({...f, categoryId: e.target.value}))} className="bg-gray-700 border-gray-600 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        <option value="all">{t('walletScreen.allCategories')}</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                </div>


                <div className="bg-gray-800/50 rounded-xl backdrop-blur-sm border border-white/10">
                   {filteredTransactions.length > 0 ? (
                        Object.entries(paginatedMonths).map(([month, txs]) => (
                            <div key={month} className="p-4 border-b border-white/10 last:border-b-0">
                                <h3 className="font-semibold text-gray-300 mb-2">{month}</h3>
                                <div className="space-y-1">
                                    {(txs as Transaction[]).map(tx => {
                                        const isExpanded = expandedTxId === tx.id;
                                        const amountColor = tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400';
                                        
                                        return (
                                            <div key={tx.id} className="py-2 first:pt-0 last:pb-0">
                                                <button onClick={() => setExpandedTxId(isExpanded ? null : tx.id)} className="w-full flex items-center justify-between text-left" aria-expanded={isExpanded}>
                                                    <div className="flex items-center space-x-4">
                                                        <div className="p-2 rounded-full bg-gray-700/80 text-xl flex-shrink-0 w-10 h-10 flex items-center justify-center">
                                                            {tx.category.icon ? <span>{tx.category.icon}</span> : <ListBulletIcon />}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-white">{tx.description}</p>
                                                            <div className="flex items-center space-x-2">
                                                                <p className="text-xs text-gray-400">{new Date(tx.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                                                                {tx.status !== 'completed' && <StatusBadge status={tx.status} />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center"><p className={`font-bold text-md ${amountColor}`}>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', signDisplay: 'always' }).format(tx.amount)}</p><svg className={`w-5 h-5 text-gray-500 ml-2 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></div>
                                                </button>
                                                {isExpanded && (
                                                    <div className="mt-3 ml-14 pl-4 border-l-2 border-gray-700 space-y-2 text-xs animate-fade-in">
                                                        <div className="p-3 bg-gray-900/50 rounded-r-lg space-y-3">
                                                            <p><span className="font-semibold text-gray-400 w-16 inline-block">{t('walletScreen.category')}:</span> <span className="text-gray-200">{tx.category.name}</span></p>
                                                            <p><span className="font-semibold text-gray-400 w-16 inline-block">{tx.amount < 0 ? t('walletScreen.to') : t('walletScreen.from')}:</span> <span className="text-gray-200">{tx.party}</span></p>
                                                            <div className="flex items-start">
                                                                <span className="font-semibold text-gray-400 w-16 inline-block flex-shrink-0 pt-1">{t('walletScreen.notes')}:</span>
                                                                <p className="text-gray-200 italic pt-1 pr-2 break-words flex-grow">{tx.notes || t('walletScreen.noNotes')}</p>
                                                            </div>
                                                            <div className="pt-2">
                                                                <button onClick={() => openModal('editTransaction', { transaction: tx })} className="text-xs flex items-center space-x-1.5 bg-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-600 transition-colors font-semibold">
                                                                    <PencilIcon className="w-3 h-3" />
                                                                    <span>Edit Transaction</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                   ) : (
                    <div className="text-center text-gray-400 py-8">
                        <div className="mx-auto w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4"><ListBulletIcon /></div>
                        <p className="font-semibold">{searchQuery || filters.type !== 'all' || filters.categoryId !== 'all' ? t('walletScreen.noResults') : t('walletScreen.noTransactions')}</p>
                        <p className="text-sm">{searchQuery ? '' : t('walletScreen.noTransactionsDesc')}</p>
                    </div>
                   )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-white/10">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm bg-gray-700 rounded-md disabled:opacity-50">
                                {t('walletScreen.prevPage')}
                            </button>
                            <span className="text-sm text-gray-400">{t('walletScreen.page')} {currentPage} {t('walletScreen.of')} {totalPages}</span>
                             <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm bg-gray-700 rounded-md disabled:opacity-50">
                                {t('walletScreen.nextPage')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
             {/* --- Security Footer --- */}
            <div className="text-center text-xs text-gray-500 flex items-center justify-center space-x-2">
                <ShieldIcon />
                <span>{t('walletScreen.securedBy')}</span>
            </div>
        </div>
    );
};

export default Wallet;