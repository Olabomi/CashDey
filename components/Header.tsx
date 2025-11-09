import React from 'react';
import type { ActiveView } from '../types';
import { ProfileIcon, BellIcon } from './icons';
import { useLocale } from '../contexts/LocaleContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useData } from '../contexts/DataContext';
import Tooltip from './Tooltip';

export const Header: React.FC = () => {
  const { activeView, setActiveView } = useNavigation();
  const { notifications } = useData();
  const { t } = useLocale();
  const isSubView = !['dashboard', 'coach', 'explore', 'profile'].includes(activeView);
  
  const unreadCount = notifications.filter(n => !n.read_at).length;

  const getTitle = () => {
    switch(activeView) {
        case 'image': return t('header.image');
        case 'news': return t('header.news');
        case 'analytics': return t('header.analytics');
        case 'ajo': return t('header.ajo');
        case 'challenges': return t('header.challenges');
        case 'sharedGoals': return t('header.sharedGoals');
        case 'askCommunity': return t('header.askCommunity');
        case 'wallet': return t('header.wallet');
        case 'rewards': return t('rewardsScreen.title');
        case 'referrals': return t('referralsScreen.title');
        case 'portfolio': return t('header.portfolio');
        case 'savings': return t('header.savings');
        case 'actionItems': return t('header.actionItems');
        case 'budget': return t('header.budget');
        case 'bills': return t('header.bills');
        case 'notifications': return t('header.notifications');
        case 'dashboard': return t('header.dashboard');
        case 'coach': return t('header.coach');
        case 'explore': return t('header.explore');
        case 'profile': return t('header.profile');
        default: return 'CashDey';
    }
  };

  const handleBack = () => {
    switch (activeView) {
        case 'rewards':
        case 'referrals':
            setActiveView('wallet');
            break;
        case 'portfolio':
        case 'savings':
        case 'actionItems':
        case 'budget':
        case 'bills':
            setActiveView('dashboard');
            break;
        case 'wallet':
        case 'notifications':
             setActiveView('dashboard');
             break;
        default:
            // Default back for explore sub-views
            setActiveView('explore');
            break;
    }
  }

  return (
    <header className="flex-shrink-0 bg-gray-900/60 backdrop-blur-md border-b border-white/10">
      <div className="max-w-4xl mx-auto flex items-center justify-between p-4 h-16">
        <div className="flex items-center space-x-2">
          {isSubView && (
            <Tooltip text={t('tooltips.headerBack')}>
              <button 
                onClick={handleBack}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label={t('header.back')}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
            </Tooltip>
          )}
          <h1 className="text-xl font-bold text-white">{getTitle()}</h1>
        </div>
        <div className="flex items-center space-x-2">
            <Tooltip text={t('tooltips.headerNotifications')} position="bottom">
                <button 
                    onClick={() => setActiveView('notifications')}
                    className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="Open Notifications"
                >
                    <BellIcon />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 text-white text-[10px] items-center justify-center">{unreadCount}</span>
                        </span>
                    )}
                </button>
            </Tooltip>
            <Tooltip text={t('tooltips.headerProfile')} position="bottom">
            <button 
                onClick={() => setActiveView('profile')}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Open Profile"
            >
                <ProfileIcon />
            </button>
            </Tooltip>
        </div>
      </div>
    </header>
  );
};