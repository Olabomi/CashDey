import React from 'react';
import type { ActiveView, User } from '../types';
import { useLocale } from '../contexts/LocaleContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';
import { 
    ImageIcon, NewsIcon, ChartIcon, AjoIcon, TrophyIcon, UsersIcon, QuestionIcon,
    FireIcon, ChevronRightIcon, MessageCircleIcon
} from './icons';

// --- Sub-components for the new Explore Screen ---

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h2 className="text-xl font-bold text-white px-1">{title}</h2>
);

const XPTracker: React.FC<{ user: User | null }> = ({ user }) => {
    const { t } = useLocale();
    if (!user) return null;

    const progress = (user.xp.current / user.xp.nextLevel) * 100;

    return (
        <div className="bg-gray-800/50 p-3 rounded-xl backdrop-blur-sm border border-white/10 flex items-center space-x-4">
            <div className="relative w-12 h-12">
                <svg className="w-full h-full" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                    <path
                        className="text-gray-700"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="currentColor" strokeWidth={3} />
                    <path
                        className="text-amber-400"
                        strokeDasharray={`${progress}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-amber-300">
                    {user.levelTier.charAt(0)}
                </div>
            </div>
            <div>
                <p className="font-bold text-white">{user.levelName}</p>
                <p className="text-xs text-gray-400">{t('explore.xpTrackerLevel', { level: user.xp.current })}</p>
            </div>
        </div>
    );
};

const TrendingCard: React.FC<{
    title: string;
    description: string;
    cta: string;
    reward: string;
    onJoin: () => void;
}> = ({ title, description, cta, reward, onJoin }) => (
    <div className="flex-shrink-0 w-80 bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col justify-between">
        <div>
            <div className="flex items-center space-x-2 mb-2">
                <FireIcon />
                <h3 className="font-bold text-white text-lg">{title}</h3>
            </div>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
            <button
                onClick={onJoin}
                className="text-sm font-semibold bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors active:scale-95 transform"
            >
                {cta}
            </button>
            <div className="text-xs font-bold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full">
                {reward}
            </div>
        </div>
    </div>
);

const RecommendedCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}> = ({ icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="group relative flex flex-col text-left bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm border border-white/10 hover:border-emerald-400/50 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-emerald-400 overflow-hidden h-full"
  >
    <div className="flex items-center space-x-3">
        <div className="bg-gray-700/80 p-3 rounded-full text-emerald-400 transition-transform duration-300 group-hover:scale-110">
            {icon}
        </div>
        <div>
            <h3 className="text-md font-bold text-white">{title}</h3>
        </div>
    </div>
    <p className="text-sm text-gray-400 mt-3 flex-grow">{description}</p>
  </button>
);


const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}> = ({ icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="group relative flex flex-col items-center justify-start text-center bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm border border-white/10 hover:border-emerald-400/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 overflow-hidden h-full"
  >
    <div className="relative z-10 flex flex-col items-center h-full">
      <div className="bg-gray-700/80 p-3 rounded-full text-emerald-400 mb-3 transition-transform duration-300 group-hover:scale-110 flex-shrink-0">
        {icon}
      </div>
      <div className="flex flex-col flex-grow">
        <h3 className="text-md font-bold text-white leading-tight">{title}</h3>
        <p className="text-xs text-gray-400 mt-1 flex-grow">{description}</p>
      </div>
    </div>
  </button>
);

const CommunityPostCard: React.FC<{
    question: string;
    replies: string;
    cta: string;
    tag: string;
    onClick: () => void;
}> = ({ question, replies, cta, tag, onClick }) => (
    <div className="bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm border border-white/10">
        <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-full">{tag}</div>
            <div className="flex items-center space-x-1 text-xs text-gray-400">
                <MessageCircleIcon />
                <span>{replies}</span>
            </div>
        </div>
        <p className="font-semibold text-white my-3">{question}</p>
        <button onClick={onClick} className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 flex items-center">
            {cta} <ChevronRightIcon />
        </button>
    </div>
);

const ProTipBanner: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
    const { t } = useLocale();
    return (
        <div className="bg-indigo-900/40 p-4 rounded-lg border border-indigo-500/30 text-center">
            <p className="font-bold text-indigo-300 text-sm">{t('explore.proTipTitle')}</p>
            <p className="text-xs text-gray-300 mt-1">{t('explore.proTipBody')}</p>
            <button onClick={onNavigate} className="mt-3 text-xs font-semibold bg-indigo-600 px-4 py-1.5 rounded-full hover:bg-indigo-700 transition-colors">
                {t('explore.proTipCTA')}
            </button>
        </div>
    );
};


const Explore: React.FC = () => {
  const { setActiveView } = useNavigation();
  const { t } = useLocale();
  const { user } = useData();
  const { addToast } = useToast();

  const handleJoinChallenge = (xp: number) => {
    addToast(t('explore.joinSuccessToast', { xp }), 'success');
  };

  const features = {
    recommended: [
        { id: 'image' as ActiveView, icon: <ImageIcon />, title: t('explore.visualAnalyzer'), description: t('explore.visualAnalyzerDesc') },
        { id: 'news' as ActiveView, icon: <NewsIcon />, title: t('explore.marketNews'), description: t('explore.marketNewsDesc') },
    ],
    collaborate: [
        { id: 'ajo' as ActiveView, icon: <AjoIcon />, title: t('explore.ajo'), description: t('explore.ajoDesc') },
        { id: 'challenges' as ActiveView, icon: <TrophyIcon />, title: t('explore.challenges'), description: t('explore.challengesDesc') },
        { id: 'sharedGoals' as ActiveView, icon: <UsersIcon />, title: t('explore.sharedGoals'), description: t('explore.sharedGoalsDesc') },
    ]
  };

  return (
    <div className="animate-fade-in-up space-y-8 pb-8">
        <div>
            <h1 className="text-2xl font-bold text-white">{t('explore.title')}</h1>
            <p className="text-md text-gray-400">{t('explore.subtitle')}</p>
        </div>
        
        <XPTracker user={user} />

        {/* Section 1: Trending Now */}
        <div className="space-y-4">
            <SectionHeader title={t('explore.trendingNow')} />
            <div className="flex items-center space-x-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
                <TrendingCard 
                    title={t('explore.trendingChallengeTitle')}
                    description={t('explore.trendingChallengeDesc', { userCount: '1,800' })}
                    cta={t('explore.trendingChallengeCTA')}
                    reward={t('explore.trendingChallengeReward', { xp: 200 })}
                    onJoin={() => handleJoinChallenge(200)}
                />
                 <TrendingCard 
                    title="No-Spend Weekend"
                    description="Join 500+ users saving an average of ₦15,000 this weekend."
                    cta={t('explore.trendingChallengeCTA')}
                    reward={t('explore.trendingChallengeReward', { xp: 150 })}
                    onJoin={() => handleJoinChallenge(150)}
                />
            </div>
        </div>

        {/* Section 2: Coach Recommends */}
        <div className="space-y-4">
            <SectionHeader title={t('explore.coachRecommends')} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.recommended.map(feature => (
                    <RecommendedCard
                        key={feature.id}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                        onClick={() => setActiveView(feature.id)}
                    />
                ))}
            </div>
        </div>

        {/* Section 3: Join & Collaborate */}
        <div className="space-y-4">
            <SectionHeader title={t('explore.joinAndCollaborate')} />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {features.collaborate.map(feature => (
                    <FeatureCard
                        key={feature.id}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                        onClick={() => setActiveView(feature.id)}
                    />
                ))}
            </div>
        </div>
        
        {/* Section 4: From the Community */}
         <div className="space-y-4">
            <SectionHeader title={t('explore.fromTheCommunity')} />
            <CommunityPostCard
                question={t('explore.communityPostQuestion')}
                replies={t('explore.communityPostReplies', { count: 245 })}
                cta={t('explore.communityPostCTA')}
                tag={t('explore.communityPostTag')}
                onClick={() => setActiveView('askCommunity')}
            />
        </div>

        {/* Section 5: Pro Tip Banner */}
        <ProTipBanner onNavigate={() => setActiveView('profile')} />
    </div>
  );
};

export default Explore;