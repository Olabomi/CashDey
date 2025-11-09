import React from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useModal } from '../contexts/ModalContext';
import { HubIcon, CoachIcon, ExploreIcon, ProfileIcon, PlusIcon } from './icons';
import Tooltip from './Tooltip';

export const NavigationBar: React.FC = () => {
  const { activeView, setActiveView } = useNavigation();
  const { openModal } = useModal();
  const { t } = useLocale();

  const navItems = [
    { id: 'dashboard', label: t('nav.hub'), icon: <HubIcon />, tooltip: t('tooltips.navHub') },
    { id: 'coach', label: t('nav.coach'), icon: <CoachIcon />, tooltip: t('tooltips.navCoach') },
    { id: 'explore', label: t('nav.explore'), icon: <ExploreIcon />, tooltip: t('tooltips.navExplore') },
    { id: 'profile', label: t('nav.profile'), icon: <ProfileIcon />, tooltip: t('tooltips.navProfile') },
  ] as const;
  
  const isExploreRelatedView = ['explore', 'image', 'news', 'analytics', 'ajo', 'challenges', 'sharedGoals', 'askCommunity'].includes(activeView);

  return (
    <>
      <div className="relative">
        <nav className="bg-gray-900/70 backdrop-blur-md border-t border-white/10">
          <div className="max-w-4xl mx-auto flex justify-around items-center h-16">
            {navItems.slice(0, 2).map((item) => {
                const isActive = item.id === 'explore' ? isExploreRelatedView : activeView === item.id;
                return (
                  <Tooltip text={item.tooltip} key={item.id}>
                    <button
                      data-testid={`nav-${item.id}`}
                      onClick={() => setActiveView(item.id)}
                      className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-300 transform focus:outline-none ${
                        isActive
                          ? 'text-emerald-400'
                          : 'text-gray-400 hover:text-emerald-300 hover:scale-105'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {isActive && (
                        <span className="absolute top-0 h-1 w-1/2 bg-emerald-400 rounded-b-full"></span>
                      )}
                      {item.icon}
                      <span className="text-xs mt-1 font-medium">{item.label}</span>
                    </button>
                  </Tooltip>
                )
            })}
            
            <div className="w-16 h-16" /> 

            {navItems.slice(2, 4).map((item) => {
                 const isActive = item.id === 'explore' ? isExploreRelatedView : activeView === item.id;
                 return (
                  <Tooltip text={item.tooltip} key={item.id}>
                     <button
                       data-testid={`nav-${item.id}`}
                       onClick={() => setActiveView(item.id)}
                       className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-300 transform focus:outline-none ${
                         isActive
                           ? 'text-emerald-400'
                           : 'text-gray-400 hover:text-emerald-300 hover:scale-105'
                       }`}
                       aria-current={isActive ? 'page' : undefined}
                     >
                       {isActive && (
                         <span className="absolute top-0 h-1 w-1/2 bg-emerald-400 rounded-b-full"></span>
                       )}
                       {item.icon}
                       <span className="text-xs mt-1 font-medium">{item.label}</span>
                     </button>
                   </Tooltip>
                 )
            })}
          </div>
        </nav>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <Tooltip text={t('tooltips.navAddTx')}>
              <button 
                  onClick={() => openModal('addTransaction')}
                  data-testid="add-transaction-button"
                  className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 transform transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
                  aria-label="Add new transaction"
              >
                  <PlusIcon className="w-8 h-8"/>
              </button>
            </Tooltip>
        </div>
      </div>
    </>
  );
};