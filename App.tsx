import React from 'react';
import UnifiedCoach from './components/UnifiedCoach';
import ImageAnalyzer from './components/ImageAnalyzer';
// FIX: Module '"file:///components/MarketNews"' has no default export. Changed to named import.
import { MarketNews } from './components/MarketNews';
import Dashboard from './components/Dashboard';
import Explore from './components/Explore';
// FIX: Module '"file:///components/Profile"' has no default export. Changed to named import.
import { Profile } from './components/Profile';
import Analytics from './components/Analytics';
import Ajo from './components/Ajo';
import CommunityChallenges from './components/CommunityChallenges';
import SharedGoals from './components/SharedGoals';
import AskCommunity from './components/AskCommunity';
import Wallet from './components/Wallet';
import RewardsCenter from './components/RewardsCenter';
import Referrals from './components/Referrals';
import Portfolio from './components/Portfolio';
import SavingsGoals from './components/SavingsGoals';
import ActionItems from './components/ActionItems';
import Budget from './components/Budget';
import Notifications from './components/Notifications';
// FIX: Module '"file:///components/Auth"' has no default export. Changed to named import.
import { Auth } from './components/Auth';
import { Header } from './components/Header';
import { NavigationBar } from './components/NavigationBar';
import { LocaleProvider } from './contexts/LocaleContext';
import { ToastProvider } from './contexts/ToastContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ModalProvider } from './contexts/ModalContext';
import ModalManager from './components/ModalManager';
import type { ActiveView } from './types';
import Bills from './components/Bills';

const componentMap: Record<ActiveView, React.ComponentType<any>> = {
  dashboard: Dashboard,
  coach: UnifiedCoach,
  explore: Explore,
  profile: Profile,
  image: ImageAnalyzer,
  news: MarketNews,
  analytics: Analytics,
  ajo: Ajo,
  challenges: CommunityChallenges,
  sharedGoals: SharedGoals,
  askCommunity: AskCommunity,
  wallet: Wallet,
  rewards: RewardsCenter,
  referrals: Referrals,
  portfolio: Portfolio,
  savings: SavingsGoals,
  actionItems: ActionItems,
  budget: Budget,
  bills: Bills,
  notifications: Notifications,
};

const AppContent: React.FC = () => {
  const { activeView } = useNavigation();
  const CurrentView = componentMap[activeView] || Dashboard;

  return (
    <div className="flex flex-col h-screen bg-transparent text-gray-100 font-sans">
      <Header />
      <main className="flex-grow overflow-y-auto p-4 md:p-6">
        <div key={activeView} className="max-w-4xl mx-auto h-full animate-fade-in">
            <CurrentView />
        </div>
      </main>
      <NavigationBar />
      <ModalManager />
    </div>
  );
};

const AppCore: React.FC = () => {
  const { session, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="flex flex-col items-center">
            <img src="/logo-a.png" alt="CashDey Logo" className="w-40 h-auto mb-4 animate-pulse"/>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }
  
  // TODO: Add Onboarding check here once component is ready
  // if (profile && !profile.onboarding_complete) {
  //   return <Onboarding />;
  // }

  return (
    <DataProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </DataProvider>
  );
};


const App: React.FC = () => (
  <LocaleProvider>
    <ToastProvider>
      <ModalProvider>
        <AppCore />
      </ModalProvider>
    </ToastProvider>
  </LocaleProvider>
);

export default App;