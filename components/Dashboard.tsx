import React, { useMemo, useState } from 'react';
import { WalletIcon, AdvisorIcon, RadarIcon, TvIcon, PowerIcon, WifiIcon, HomeIcon, ClipboardListIcon, ListBulletIcon, CheckIcon, ExclamationTriangleIcon } from './icons';
import { useLocale } from '../contexts/LocaleContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useData } from '../contexts/DataContext';
import NaijaMarketWatch from './NaijaMarketWatch';
import DailyWin from './DailyWin';
import DashboardInsights from './DashboardInsights';
import AdvisorBookingModal from './AdvisorBookingModal';
import { useToast } from '../contexts/ToastContext';
import type { AdvisorBookingDetails, Bill } from '../types';
import Tooltip from './Tooltip';
import ConfirmationModal from './ConfirmationModal';

const ProgressBar = ({ progress, color }: { progress: number, color: string }) => (
    <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
    </div>
);

const getProgressBarColor = (percentage: number) => {
    if (percentage > 100) return 'bg-rose-600';
    if (percentage > 80) return 'bg-rose-500';
    if (percentage > 50) return 'bg-amber-500';
    return 'bg-emerald-500';
};


const UpcomingBills: React.FC = () => {
    const { bills, markBillAsPaid, markBillAsOverdue } = useData();
    const { t } = useLocale();
    const { setActiveView } = useNavigation();
    const [confirmationAction, setConfirmationAction] = useState<{ action: 'pay' | 'overdue', bill: Bill } | null>(null);

    const upcoming = useMemo(() => {
        if (!bills) return [];
        return [...bills]
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .slice(0, 3);
    }, [bills]);

    const getBillStatus = (dueDate: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);

        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: t('dashboard.bills.overdueByDays', { count: Math.abs(diffDays) }), color: 'text-rose-400' };
        if (diffDays === 0) return { text: t('dashboard.bills.dueToday'), color: 'text-rose-400' };
        if (diffDays <= 7) return { text: t('dashboard.bills.dueInDays', { count: diffDays }), color: 'text-amber-400' };
        return { text: `Due: ${due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`, color: 'text-gray-400' };
    };
    
    const getBillIcon = (category: Bill['category']) => {
        switch (category) {
            case 'subscription': return <TvIcon />;
            case 'utilities': return <PowerIcon />;
            case 'rent': return <HomeIcon />;
            default: return <WifiIcon />;
        }
    };

    const handleConfirm = () => {
        if (!confirmationAction) return;
        if (confirmationAction.action === 'pay') {
            markBillAsPaid(confirmationAction.bill.id);
        } else {
            markBillAsOverdue(confirmationAction.bill.id);
        }
        setConfirmationAction(null);
    };

    return (
        <>
            <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-white/10 md:col-span-2 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-lg flex items-center space-x-2 text-white">
                        <RadarIcon />
                        <span>{t('dashboard.bills.title')}</span>
                    </h2>
                    <Tooltip text={t('tooltips.viewAllBills')}>
                      <button onClick={() => setActiveView('bills')} className="text-sm font-semibold text-emerald-400 hover:text-emerald-300">View All</button>
                    </Tooltip>
                </div>
                <div className="space-y-3">
                    {upcoming.length > 0 ? (
                        upcoming.map(bill => {
                            const status = getBillStatus(bill.dueDate);
                            const isOverdue = status.color === 'text-rose-400';
                            return (
                                <div key={bill.id} className="flex items-center p-2 rounded-md hover:bg-white/5">
                                    <div className="p-2 bg-gray-700/80 rounded-full text-emerald-400 mr-4">
                                        {getBillIcon(bill.category)}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-medium text-white">{bill.biller}</p>
                                        <p className={`text-xs font-semibold ${status.color}`}>{status.text}</p>
                                    </div>
                                    <div className="text-right">
                                         <p className="font-bold text-md text-white">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(bill.amount)}</p>
                                         <div className="flex items-center justify-end space-x-2">
                                            <Tooltip text={t('tooltips.planForBill')}>
                                              <button className="text-xs font-medium text-emerald-400/80 hover:text-emerald-400">{t('dashboard.bills.planForThis')}</button>
                                            </Tooltip>
                                            
                                            <div className="w-px h-4 bg-gray-600"></div>

                                            {!isOverdue && (
                                                <Tooltip text={t('tooltips.markAsOverdue')}>
                                                    <button onClick={(e) => { e.stopPropagation(); setConfirmationAction({ action: 'overdue', bill }); }} className="p-1 rounded-full hover:bg-amber-500/20 text-amber-400">
                                                        <ExclamationTriangleIcon className="w-4 h-4" />
                                                    </button>
                                                </Tooltip>
                                            )}
                                            <Tooltip text={t('tooltips.markAsPaid')}>
                                                <button onClick={(e) => { e.stopPropagation(); setConfirmationAction({ action: 'pay', bill }); }} className="p-1 rounded-full hover:bg-emerald-500/20 text-emerald-400">
                                                    <CheckIcon className="w-4 h-4" />
                                                </button>
                                            </Tooltip>
                                         </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-sm text-center text-gray-400 py-4">{t('dashboard.bills.emptyState')}</p>
                    )}
                </div>
            </div>
            {confirmationAction && (
                <ConfirmationModal
                    show={!!confirmationAction}
                    onClose={() => setConfirmationAction(null)}
                    onConfirm={handleConfirm}
                    title={confirmationAction.action === 'pay' ? t('confirmation.markAsPaidTitle') : t('confirmation.markAsOverdueTitle')}
                    message={confirmationAction.action === 'pay' 
                        ? t('confirmation.markAsPaidMessage', { biller: confirmationAction.bill.biller })
                        : t('confirmation.markAsOverdueMessage', { biller: confirmationAction.bill.biller })
                    }
                    confirmText={t('confirmation.confirm')}
                    cancelText={t('confirmation.cancel')}
                />
            )}
        </>
    );
};

const isAdvisorOnline = () => {
  const now = new Date();
  // WAT is UTC+1. Get the UTC hour and add 1.
  const watHour = (now.getUTCHours() + 1) % 24;
  // getUTCDay() returns 0 for Sunday, 1 for Monday, etc.
  const watDay = now.getUTCDay();

  const isWeekday = watDay >= 1 && watDay <= 5; // Monday to Friday
  const isBusinessHour = watHour >= 9 && watHour < 17; // 9:00 AM to 4:59 PM

  return isWeekday && isBusinessHour;
};


const Dashboard: React.FC = () => {
  const { setActiveView } = useNavigation();
  const { wallet, transactions, portfolio, savingsGoals, activeBudget } = useData();
  const { t } = useLocale();
  const { addToast } = useToast();

  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState(false);
  
  const advisorOnline = isAdvisorOnline();

  const handleBookingSubmit = (details: AdvisorBookingDetails) => {
    console.log("New Advisor Booking:", details);
    setIsAdvisorModalOpen(false);
    addToast(t('advisorBooking.bookingSuccessToast'), 'success');
  };
  
  const handleBookSessionClick = () => {
    if (advisorOnline) {
        setIsAdvisorModalOpen(true);
    } else {
        addToast(t('dashboard.advisorCard.offlineToast'), 'error');
    }
  };

  const budgetOverview = useMemo(() => {
    if (!activeBudget || !activeBudget.budget_lines) return null;

    const budgetTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return tx.amount < 0 && 
               txDate >= new Date(activeBudget.start_date) && 
               txDate <= new Date(activeBudget.end_date);
    });

    const totalLimit = activeBudget.budget_lines.reduce((sum, line) => sum + line.limit_amount, 0);
    const totalSpent = budgetTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const progress = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

    return { totalLimit, totalSpent, progress };
  }, [activeBudget, transactions]);


  const recentTransactions = useMemo(() => transactions.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0,3), [transactions]);
  
  const getCategoryStyle = (category: string) => {
      switch (category.toLowerCase()) {
          case 'food & drinks': return 'bg-rose-500/20 text-rose-300';
          case 'bills': return 'bg-indigo-500/20 text-indigo-300';
          case 'transport': return 'bg-amber-500/20 text-amber-300';
          default: return 'bg-gray-500/20 text-gray-300';
      }
  };
  
  const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
          return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      if (date.toDateString() === yesterday.toDateString()) {
          return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      return date.toLocaleDateString([], { day: 'numeric', month: 'long' });
  };


  return (
    <>
    <div className="animate-fade-in-up space-y-6 pb-8">
      <DailyWin />

      <DashboardInsights />
      
      <NaijaMarketWatch />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-white/10 flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h2 className="font-semibold text-lg">Wallet</h2>
                    <WalletIcon />
                </div>
                <p className="text-4xl font-bold text-white">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(wallet?.totalBalance ?? 0)}</p>
                <p className="text-xs text-gray-400 mt-1">{t('walletScreen.cashPoints')}: {new Intl.NumberFormat().format(wallet?.cashPoints ?? 0)}</p>
            </div>
            <Tooltip text={t('tooltips.walletManage')}>
              <button 
                  onClick={() => setActiveView('wallet')}
                  className="mt-4 w-full text-sm bg-emerald-600/80 text-white rounded-lg py-2 hover:bg-emerald-600 transition-colors active:scale-95 transform font-semibold"
              >
                  Manage
              </button>
            </Tooltip>
        </div>
        
        <button onClick={() => setActiveView('portfolio')} className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-white/10 hover:border-emerald-500/50 transition-colors text-left">
          <h2 className="font-semibold text-lg mb-2">Portfolio Snapshot</h2>
          <div className="flex justify-between items-center">
            <p className="text-2xl font-bold">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(portfolio?.totalValue ?? 0)}</p>
            <p className={`text-sm font-semibold ${(portfolio?.totalChange ?? 0) >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
                {(portfolio?.totalChange ?? 0) >= 0 ? '+' : ''}{(portfolio?.totalChange ?? 0).toFixed(2)}%
            </p>
          </div>
           <p className="text-xs text-gray-400">Total Value</p>
           <div className="mt-4 space-y-2 text-sm">
             <div className="flex justify-between"><span>Stocks (NGX)</span><span>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(portfolio?.assets.stocks.totalValue ?? 0)}</span></div>
             <div className="flex justify-between"><span>Crypto</span><span>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(portfolio?.assets.crypto.totalValue ?? 0)}</span></div>
             <div className="flex justify-between"><span>Mutual Funds</span><span>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(portfolio?.assets.mutualFunds.totalValue ?? 0)}</span></div>
           </div>
        </button>

        <button onClick={() => setActiveView('savings')} className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-white/10 hover:border-emerald-500/50 transition-colors text-left md:col-span-2 lg:col-span-1">
          <h2 className="font-semibold text-lg mb-2">Savings Goals</h2>
          <div className="space-y-4">
             {savingsGoals?.slice(0, 2).map(goal => (
                 <div key={goal.id}>
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-white">{goal.emoji} {goal.title}</span>
                        <span className="text-sm font-medium text-gray-300">{Math.round((goal.saved/goal.target)*100)}%</span>
                    </div>
                    <ProgressBar progress={(goal.saved/goal.target)*100} color="bg-emerald-500" />
                 </div>
             ))}
             <div className="bg-emerald-900/50 p-3 rounded-lg border border-emerald-500/30 mt-4">
                <p className="font-bold text-emerald-300 text-sm">💡 AI Suggestion</p>
                <p className="text-xs text-gray-300 mt-1">Move an extra ₦5,000 to your "Laptop" goal to reach it 3 days sooner.</p>
             </div>
          </div>
        </button>
        
        <UpcomingBills />

        <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-white/10 flex flex-col justify-between md:col-span-2 lg:col-span-1">
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h2 className="font-semibold text-lg">{t('dashboard.advisorCard.title')}</h2>
                    <AdvisorIcon />
                </div>
                <p className="text-sm text-gray-400 mt-1">{t('dashboard.advisorCard.description')}</p>
                 {advisorOnline ? (
                    <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-300 mt-3">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>{t('dashboard.advisorCard.onlineBadge')}</span>
                    </div>
                 ) : (
                    <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 mt-3">
                        <span className="relative flex h-2 w-2">
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
                        </span>
                        <span>{t('dashboard.advisorCard.offlineBadge')}</span>
                    </div>
                 )}
            </div>
            <Tooltip text={advisorOnline ? t('tooltips.advisorOnline') : t('tooltips.advisorOffline')}>
              <button 
                  onClick={handleBookSessionClick}
                  className={`mt-4 w-full text-sm text-white rounded-lg py-2 transition-colors active:scale-95 transform font-semibold ${
                      advisorOnline
                      ? 'bg-emerald-600/80 hover:bg-emerald-600'
                      : 'bg-gray-600/80 hover:bg-gray-600'
                  }`}
              >
                  {t('dashboard.advisorCard.cta')}
              </button>
            </Tooltip>
        </div>
        
        <button 
          onClick={() => setActiveView('budget')}
          className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-white/10 md:col-span-2 lg:col-span-3 text-left hover:border-emerald-500/50 transition-colors w-full"
        >
          <div className="flex items-center space-x-3 mb-2">
            <ClipboardListIcon />
            <h2 className="font-semibold text-lg">Smart Budgets</h2>
          </div>
          {budgetOverview ? (
            <>
              <p className="text-sm text-gray-400 mb-4">
                {budgetOverview.progress > 100 
                  ? "You've gone over your monthly budget." 
                  : "Your AI-generated monthly spending plan."}
              </p>
              <div className="space-y-2">
                  <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Overall Spending</span>
                        <span>
                            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(budgetOverview.totalSpent)} / {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(budgetOverview.totalLimit)}
                        </span>
                      </div>
                      <ProgressBar progress={budgetOverview.progress} color={getProgressBarColor(budgetOverview.progress)} />
                  </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400">No active budget found. Click here to create one and take control of your spending.</p>
          )}
        </button>

        <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-white/10 md:col-span-2 lg:col-span-3">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg">Recent Transactions</h2>
                <button onClick={() => setActiveView('wallet')} className="text-sm font-semibold text-emerald-400 hover:text-emerald-300">View All</button>
            </div>
            <div className="space-y-3">
                {recentTransactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-2 rounded-md hover:bg-white/5">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-gray-700/80 rounded-full text-xl flex-shrink-0 w-10 h-10 flex items-center justify-center">
                                {tx.category.icon ? <span>{tx.category.icon}</span> : <ListBulletIcon />}
                            </div>
                            <div>
                                <p className="font-medium">{tx.description}</p>
                                <p className="text-xs text-gray-400">{formatDate(tx.date)}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`font-semibold ${tx.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', signDisplay: 'always' }).format(tx.amount)}</p>
                            {/* FIX: Use category name from the category object for styling and display */}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryStyle(tx.category.name)}`}>{tx.category.name}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
    <AdvisorBookingModal 
        show={isAdvisorModalOpen}
        onClose={() => setIsAdvisorModalOpen(false)}
        onSubmit={handleBookingSubmit}
    />
    </>
  );
};
export default Dashboard;