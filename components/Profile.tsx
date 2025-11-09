import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { 
    CameraIcon, CloseIcon, ChevronRightIcon, ShieldIcon, DownloadIcon, TrashIcon, 
    PencilIcon, MedalIcon, ClockIcon, BankIcon, UserPlusIcon, TrophyIcon, WalletIcon,
    CheckBadgeIcon, QrCodeIcon, ShareIcon, KeyIcon, FingerPrintIcon, DevicePhoneMobileIcon,
    PaletteIcon, CpuChipIcon, BookOpenIcon, IdCardIcon, PiggyBankIcon, ShoppingCartIcon,
    ClipboardListIcon, BriefcaseIcon,
    BellIcon,
    ProfileIcon,
    // FIX: Add missing icon imports
    BillIcon,
    GiftIcon
} from './icons';
// FIX: Removed `Profile` from import to resolve name collision with the component.
// The type is inferred from the `useData` context.
import type { User, Badge, FinancialPersonality, AppTheme, CoachPersonality } from '../types';
import EditProfileModal from './EditProfileModal';


// FIX: Changed to a named export to match the import in App.tsx.
export const Profile: React.FC = () => {
    const { user, updateProfilePic, updateProfile } = useData();
    const { t } = useLocale();
    const { signOut } = useAuth();

    const [is2faEnabled, setIs2faEnabled] = useState(false);
    
    // Modal States
    const [modal, setModal] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // Profile Picture State & Refs
    const [profilePic, setProfilePic] = useState<string | null>(user?.profile_pic_url || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    useEffect(() => {
        setProfilePic(user?.profile_pic_url || null);
    }, [user?.profile_pic_url]);

    const dataUrlToFile = async (dataUrl: string, fileName: string): Promise<File> => {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        return new File([blob], fileName, { type: 'image/jpeg' });
    };

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        
        // Optimistic UI update
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfilePic(reader.result as string);
        };
        reader.readAsDataURL(file);
        
        setModal(null);
        setIsUploading(true);
        await updateProfilePic(file);
        setIsUploading(false);
      }
    };

    const handleTakePhotoClick = () => {
      setModal('camera');
    };

    const handleCapture = async () => {
      if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg');
          
          setProfilePic(dataUrl);
          setModal(null);
          setIsUploading(true);
          
          const file = await dataUrlToFile(dataUrl, 'capture.jpg');
          await updateProfilePic(file);
          setIsUploading(false);
        }
      }
    };

    if (!user) return null; // Or a loading skeleton

    return (
        <>
            <div className="animate-fade-in-up space-y-8 pb-8 text-gray-200">
                <IdentitySection 
                    user={user} 
                    profilePic={profilePic} 
                    onEditPicClick={() => setModal('changePic')} 
                    onEditIdentityClick={() => setIsEditModalOpen(true)}
                    isUploading={isUploading} 
                />
                <FinancialPersonalityCard personality={user.financialPersonality} />
                <PinnedBadges user={user} onManageClick={() => setModal('allBadges')} />
                <JourneySummaryCard user={user} />
                <FinancialSnapshotSection />

                <Section title={t('profile.progressionTitle')}>
                    <ProgressionCard />
                </Section>
                
                <Section title={t('profile.socialReferrals')}>
                    <ReferralCard referralCode={user.referral_code} />
                </Section>
                
                <Section title={t('profile.securityTitle')}>
                     <SettingsList>
                        <SettingsItem icon={<KeyIcon />} label={t('profile.passwordPinReset')} />
                        <SettingsItem icon={<FingerPrintIcon />} label={t('profile.pinBiometrics')} />
                        <SettingsItem icon={<DevicePhoneMobileIcon />} label={t('profile.activeSessions')} />
                        <SettingsItem icon={<UserPlusIcon />} label={t('profile.beneficiary')} />
                        <SettingsToggleItem 
                            icon={<ShieldIcon />} 
                            label={t('profile.twoFactorAuth')} 
                            description={t('profile.twoFactorAuthDesc')}
                            enabled={is2faEnabled} 
                            onToggle={() => setIs2faEnabled(!is2faEnabled)} 
                        />
                    </SettingsList>
                </Section>

                <Section title={t('profile.customization')}>
                     <SettingsList>
                        <SettingsItem icon={<PaletteIcon />} label={t('profile.theme')} onClick={() => setModal('theme')} />
                        <SettingsItem icon={<CpuChipIcon />} label={t('profile.coachPersonality')} onClick={() => setModal('coachPersonality')} />
                        <SettingsItem icon={<BellIcon />} label={t('profile.notifications')} onClick={() => setModal('notifications')} />
                        <LanguageToggle />
                    </SettingsList>
                </Section>
                
                <Section title={t('profile.dataPrivacyTitle')}>
                     <SettingsList>
                        <SettingsItem icon={<ShieldIcon />} label={t('profile.howWeProtect')} onClick={() => setModal('privacy')} isDestructive={false} />
                        <SettingsItem icon={<DownloadIcon />} label={t('profile.downloadData')} onClick={() => alert('Initiating data download...')} isDestructive={false} />
                        <SettingsItem icon={<TrashIcon />} label={t('profile.deleteAccount')} onClick={() => setModal('delete')} isDestructive={true} />
                    </SettingsList>
                </Section>

                <MoneyStorySection />
                
                <button onClick={signOut} className="w-full text-center bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600/40 transition p-3 rounded-lg font-medium">
                    Log Out
                </button>
            </div>

            {/* --- Modals --- */}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <PictureModal show={modal === 'changePic'} onClose={() => setModal(null)} onUpload={handleUploadClick} onTakePhoto={handleTakePhotoClick} />
            <CameraModal show={modal === 'camera'} onClose={() => setModal(null)} onCapture={handleCapture} videoRef={videoRef} />
            <AllBadgesModal show={modal === 'allBadges'} onClose={() => setModal(null)} badges={user.badges} />
            <ThemeSelectorModal show={modal === 'theme'} onClose={() => setModal(null)} />
            <AIPersonalityModal show={modal === 'coachPersonality'} onClose={() => setModal(null)} />
            <PrivacyModal show={modal === 'privacy'} onClose={() => setModal(null)} />
            <DeleteModal show={modal === 'delete'} onClose={() => setModal(null)} />
            <NotificationSettingsModal show={modal === 'notifications'} onClose={() => setModal(null)} />
            <EditProfileModal 
                show={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
                onSave={updateProfile}
            />
        </>
    );
};

// --- Sub-Components for Profile Screen ---

const Section: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
    <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase text-gray-500 tracking-wider px-2">{title}</h2>
        {children}
    </div>
);

const IdentitySection: React.FC<{user: User, profilePic: string | null, onEditPicClick: () => void, onEditIdentityClick: () => void, isUploading: boolean}> = ({ user, profilePic, onEditPicClick, onEditIdentityClick, isUploading }) => {
    const { t } = useLocale();
    return (
        <div className="flex flex-col items-center text-center space-y-3">
            <button className="relative group focus:outline-none focus:ring-4 focus:ring-emerald-500/50 rounded-full" onClick={onEditPicClick} aria-label={t('profile.changePicture')} disabled={isUploading}>
                <div className="w-28 h-28 rounded-full bg-emerald-500/20 flex items-center justify-center ring-4 ring-emerald-500/30 overflow-hidden">
                    {profilePic ? <img src={profilePic} alt="Profile" className="w-full h-full object-cover" /> : <ProfileIcon />}
                </div>
                {isUploading ? (
                    <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <CameraIcon />
                        <span className="mt-1 text-xs font-semibold">Change</span>
                    </div>
                )}
            </button>
            <div>
                <div className="flex items-center justify-center space-x-2">
                    <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                    <button onClick={onEditIdentityClick} className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label={t('profile.editProfile')}>
                        <PencilIcon className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-lg text-emerald-400 font-medium">"{user.nickname || 'Your Nickname'}"</p>
            </div>
            <p className="text-md text-gray-400 max-w-sm italic">"{user.bio || 'Your bio goes here...'}"</p>
        </div>
    );
};

const FinancialPersonalityCard: React.FC<{ personality: FinancialPersonality }> = ({ personality }) => {
    const { t } = useLocale();
    const personalityDetails = {
        Saver: { icon: <PiggyBankIcon />, color: 'text-emerald-400', title: t('profile.personality.Saver'), desc: t('profile.personality.SaverDesc') },
        Spender: { icon: <ShoppingCartIcon />, color: 'text-rose-400', title: t('profile.personality.Spender'), desc: t('profile.personality.SpenderDesc') },
        Planner: { icon: <ClipboardListIcon />, color: 'text-blue-400', title: t('profile.personality.Planner'), desc: t('profile.personality.PlannerDesc') },
        Hustler: { icon: <BriefcaseIcon />, color: 'text-amber-400', title: t('profile.personality.Hustler'), desc: t('profile.personality.HustlerDesc') }
    }[personality];

    return (
        <div className="bg-gray-800/50 p-5 rounded-xl backdrop-blur-sm border border-white/10 flex items-center space-x-4">
            <div className={personalityDetails.color}>{personalityDetails.icon}</div>
            <div>
                <p className="text-xs text-gray-400">{t('profile.financialPersonality')}</p>
                <h3 className="font-bold text-white">{personalityDetails.title}</h3>
                <p className="text-sm text-gray-300">{personalityDetails.desc}</p>
            </div>
        </div>
    );
};

const PinnedBadges: React.FC<{ user: User, onManageClick: () => void }> = ({ user, onManageClick }) => {
    const { t } = useLocale();
    const pinned = user.badges.filter((b: Badge) => user.pinnedBadges.includes(b.id));

    return (
        <Section title={t('profile.pinnedBadges')}>
            <div className="grid grid-cols-3 gap-3">
                {pinned.map((badge: Badge) => (
                    <div key={badge.id} className="bg-gray-700/60 p-3 rounded-lg flex flex-col items-center text-center aspect-square justify-center">
                        <span className="text-3xl">{badge.emoji}</span>
                        <p className="text-xs font-semibold text-white mt-1 leading-tight">{badge.name}</p>
                    </div>
                ))}
            </div>
            <button onClick={onManageClick} className="w-full text-center mt-3 text-sm font-semibold text-emerald-400 hover:text-emerald-300">
                {t('profile.viewAllBadges')}
            </button>
        </Section>
    );
};

const JourneySummaryCard: React.FC<{user: User}> = ({ user }) => {
    const { t } = useLocale();
    const daysSinceJoin = Math.floor((new Date().getTime() - new Date(user.joinDate).getTime()) / (1000 * 60 * 60 * 24));
    
    return (
        <Section title={t('profile.journeySummary')}>
            <div className="bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm border border-white/10 text-center">
                <p className="text-gray-300">
                    {t('profile.joined')} <span className="font-bold text-white">{daysSinceJoin}</span> {t('profile.daysAgo')}. 
                    {t('profile.saved')} <span className="font-bold text-emerald-400">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(user.totalSaved)}</span>, 
                    {t('profile.earnedInBonuses')} <span className="font-bold text-amber-400">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(user.totalBonuses)}</span>.
                </p>
            </div>
        </Section>
    );
};

const FinancialSnapshotSection: React.FC = () => {
    const { t } = useLocale();
    const { wallet } = useData();
    return (
        <Section title={t('profile.financialSnapshot')}>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/60 p-4 rounded-lg text-center">
                    <WalletIcon />
                    <p className="text-xs text-gray-300 mt-1">{t('profile.walletBalance')}</p>
                    <p className="text-xl font-bold text-white">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(wallet?.totalBalance ?? 0)}</p>
                </div>
                 <div className="bg-gray-700/60 p-4 rounded-lg text-center">
                    <CheckBadgeIcon />
                    <p className="text-xs text-gray-300 mt-1">{t('profile.cashdeyScore')}</p>
                    <p className="text-xl font-bold text-emerald-400">73%</p>
                </div>
            </div>
        </Section>
    );
};

const ProgressionCard: React.FC = () => {
    const { user } = useData();
    const { t } = useLocale();
    if (!user) return null;
    const { levelName, levelTier, xp } = user;
    const progressPercent = (xp.current / xp.nextLevel) * 100;
    const tierColors = { Bronze: 'bg-yellow-600', Silver: 'bg-gray-300', Gold: 'bg-amber-400' };
    
    return (
        <div className="p-5 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">{levelName}</h3>
                <div className="flex items-center space-x-2"><MedalIcon /><span className="font-bold">{levelTier}</span></div>
            </div>
            <div className="mt-4">
                <div className="flex justify-between text-xs font-medium text-gray-400 mb-1">
                    <span>{t('profile.xp')}</span>
                    <span>{xp.current} / {xp.nextLevel}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className={`${tierColors[levelTier]} h-2 rounded-full`} style={{ width: `${progressPercent}%` }}></div>
                </div>
            </div>
        </div>
    );
};

const ReferralCard: React.FC<{referralCode: string}> = ({ referralCode }) => {
    const { t } = useLocale();
    return (
        <div className="bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm border border-white/10 flex items-center justify-between">
            <div>
                <p className="text-xs text-gray-400">{t('profile.yourReferralCode')}</p>
                <p className="font-bold text-white tracking-wider">{referralCode}</p>
            </div>
            <button className="text-sm font-semibold bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
                {t('profile.bragMode')}
            </button>
        </div>
    );
};

const MoneyStorySection: React.FC = () => {
    const { t } = useLocale();
    return (
        <Section title={t('profile.moneyStoryTitle')}>
            <div className="bg-indigo-900/40 p-4 rounded-lg border border-indigo-500/30">
                <p className="text-sm text-gray-300 italic">{t('profile.moneyStoryBody')}</p>
            </div>
        </Section>
    );
};

// --- Settings Components ---
const SettingsList: React.FC<{children: React.ReactNode}> = ({ children }) => <div className="bg-gray-800/50 rounded-xl backdrop-blur-sm border border-white/10 divide-y divide-white/10">{children}</div>;

const SettingsItem: React.FC<{icon: React.ReactNode; label: string; onClick?: () => void; isDestructive?: boolean}> = ({icon, label, onClick, isDestructive = false}) => (
    <button onClick={onClick} disabled={!onClick} className="w-full flex items-center p-4 text-left hover:bg-white/5 transition-colors disabled:opacity-50">
       <span className={isDestructive ? 'text-rose-400' : 'text-emerald-400'}>{icon}</span>
       <span className={`font-medium ml-4 ${isDestructive ? 'text-rose-400' : 'text-white'}`}>{label}</span>
       <div className="ml-auto"><ChevronRightIcon /></div>
   </button>
);

const SettingsToggleItem: React.FC<{icon: React.ReactNode; label: string; description: string; enabled: boolean; onToggle: () => void}> = ({ icon, label, description, enabled, onToggle }) => (
    <div className="flex items-center p-4">
        <span className="text-emerald-400">{icon}</span>
        <div className="flex-grow ml-4">
            <h3 className="font-medium text-white">{label}</h3>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
        <button onClick={onToggle} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-emerald-500' : 'bg-gray-600'}`}>
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);
const LanguageToggle: React.FC = () => {
    const { locale, toggleLocale, t } = useLocale();
    return (
        <div className="flex items-center justify-between p-4">
            <span className="font-medium">{t('profile.language')}</span>
            <button onClick={toggleLocale} className="relative inline-flex items-center h-8 rounded-full w-40 bg-gray-700">
                <span className={`absolute left-1 top-1 w-1/2 h-6 bg-emerald-600 rounded-full transition-transform duration-300 ease-in-out transform ${locale === 'pi' ? 'translate-x-[90%]' : 'translate-x-0'}`} />
                <span className={`relative w-1/2 text-center text-sm z-10 ${locale === 'en' ? 'text-white font-semibold' : 'text-gray-300'}`}>{t('profile.english')}</span>
                <span className={`relative w-1/2 text-center text-sm z-10 ${locale === 'pi' ? 'text-white font-semibold' : 'text-gray-300'}`}>{t('profile.pidgin')}</span>
            </button>
        </div>
    );
};

// --- Modals ---
const Modal: React.FC<{show: boolean; onClose: () => void; title: string; children: React.ReactNode}> = ({ show, onClose, title, children }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-white/10 rounded-2xl shadow-xl w-full max-w-sm m-4 p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><CloseIcon className="w-5 h-5" /></button>
                </div>
                {children}
            </div>
        </div>
    );
};

const PictureModal: React.FC<{show: boolean; onClose: () => void; onUpload: () => void; onTakePhoto: () => void;}> = ({ show, onClose, onUpload, onTakePhoto }) => (
    <Modal show={show} onClose={onClose} title="Change Profile Picture">
        <div className="space-y-3">
            <button onClick={onUpload} className="w-full flex items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                <DownloadIcon />
                <span className="ml-3 font-medium">Upload from device</span>
            </button>
            <button onClick={onTakePhoto} className="w-full flex items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                <CameraIcon />
                <span className="ml-3 font-medium">Take a photo</span>
            </button>
        </div>
    </Modal>
);

const CameraModal: React.FC<{show: boolean; onClose: () => void; onCapture: () => void; videoRef: React.RefObject<HTMLVideoElement>}> = ({ show, onClose, onCapture, videoRef }) => {
    useEffect(() => {
        let stream: MediaStream | null = null;
        if (show && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(s => {
                    stream = s;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.play();
                    }
                })
                .catch(err => {
                    console.error("Error accessing camera:", err);
                });
        }
        return () => {
            stream?.getTracks().forEach(track => track.stop());
        };
    }, [show, videoRef]);

    return (
        <Modal show={show} onClose={onClose} title="Take Photo">
            <video ref={videoRef} className="w-full rounded-lg bg-black" playsInline></video>
            <button onClick={onCapture} className="mt-4 w-full bg-emerald-600 text-white rounded-lg py-2.5 hover:bg-emerald-700 transition">Capture</button>
        </Modal>
    );
};

const AllBadgesModal: React.FC<{show: boolean; onClose: () => void; badges: Badge[]}> = ({ show, onClose, badges }) => (
    <Modal show={show} onClose={onClose} title="All Badges">
        <div className="grid grid-cols-3 gap-4 max-h-80 overflow-y-auto p-1">
            {badges.map(badge => (
                <div key={badge.id} className="bg-gray-700/60 p-3 rounded-lg flex flex-col items-center text-center aspect-square justify-center">
                    <span className="text-4xl">{badge.emoji}</span>
                    <p className="text-xs font-semibold text-white mt-1 leading-tight">{badge.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{badge.description}</p>
                </div>
            ))}
        </div>
    </Modal>
);

const ThemeSelectorModal: React.FC<{show: boolean; onClose: () => void;}> = ({ show, onClose }) => {
    const { t } = useLocale();
    const [selectedTheme, setSelectedTheme] = useState<AppTheme>('dark');
    return (
        <Modal show={show} onClose={onClose} title={t('profile.theme')}>
            <div className="space-y-3">
                <button onClick={() => setSelectedTheme('dark')} className={`w-full p-3 rounded-lg text-left font-semibold ${selectedTheme === 'dark' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{t('profile.themeDark')}</button>
                <button onClick={() => setSelectedTheme('naija')} className={`w-full p-3 rounded-lg text-left font-semibold ${selectedTheme === 'naija' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{t('profile.themeNaija')}</button>
            </div>
        </Modal>
    );
};

const AIPersonalityModal: React.FC<{show: boolean; onClose: () => void;}> = ({ show, onClose }) => {
    const { t } = useLocale();
    const [selected, setSelected] = useState<CoachPersonality>('friendly');
    return (
        <Modal show={show} onClose={onClose} title={t('profile.coachPersonality')}>
            <div className="space-y-3">
                <button onClick={() => setSelected('friendly')} className={`w-full p-3 rounded-lg text-left font-semibold ${selected === 'friendly' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{t('profile.coachFriendly')}</button>
                <button onClick={() => setSelected('strict')} className={`w-full p-3 rounded-lg text-left font-semibold ${selected === 'strict' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{t('profile.coachStrict')}</button>
                <button onClick={() => setSelected('motivational')} className={`w-full p-3 rounded-lg text-left font-semibold ${selected === 'motivational' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{t('profile.coachMotivational')}</button>
            </div>
        </Modal>
    );
};

const PrivacyModal: React.FC<{show: boolean; onClose: () => void;}> = ({ show, onClose }) => {
    const { t } = useLocale();
    return (
        <Modal show={show} onClose={onClose} title={t('modals.privacyTitle')}>
            <p className="text-sm text-gray-300 mb-4">{t('modals.privacyBody')}</p>
            <button onClick={onClose} className="w-full bg-emerald-600 text-white rounded-lg py-2.5 hover:bg-emerald-700 transition">{t('modals.close')}</button>
        </Modal>
    );
};

const DeleteModal: React.FC<{show: boolean; onClose: () => void;}> = ({ show, onClose }) => {
    const { t } = useLocale();
    return (
        <Modal show={show} onClose={onClose} title={t('modals.deleteTitle')}>
            <p className="text-sm text-gray-300 mb-6">{t('modals.deleteBody')}</p>
            <div className="flex items-center space-x-3">
                <button onClick={onClose} className="w-full bg-gray-600 text-white rounded-lg py-2 hover:bg-gray-700 transition">{t('modals.deleteCancel')}</button>
                <button onClick={() => { alert('Account deleted.'); onClose(); }} className="w-full bg-rose-600 text-white rounded-lg py-2 hover:bg-rose-700 transition">{t('modals.deleteConfirm')}</button>
            </div>
        </Modal>
    );
};

const NotificationSettingsModal: React.FC<{ show: boolean, onClose: () => void }> = ({ show, onClose }) => {
    const { t } = useLocale();
    const [settings, setSettings] = useState({
        budget: true,
        bill: true,
        goal: false,
        reward: true,
    });
    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };
    return (
        <Modal show={show} onClose={onClose} title={t('profile.notificationSettingsTitle')}>
            <div className="space-y-4">
                <SettingsToggleItem icon={<ClipboardListIcon />} label="Budget Alerts" description="Notify me when I'm near a budget limit." enabled={settings.budget} onToggle={() => toggleSetting('budget')} />
                <SettingsToggleItem icon={<BillIcon />} label="Bill Reminders" description="Remind me before bills are due." enabled={settings.bill} onToggle={() => toggleSetting('bill')} />
                <SettingsToggleItem icon={<TrophyIcon />} label="Goal Milestones" description="Celebrate when I reach a savings goal milestone." enabled={settings.goal} onToggle={() => toggleSetting('goal')} />
                <SettingsToggleItem icon={<GiftIcon />} label="New Rewards" description="Let me know when I've earned new rewards." enabled={settings.reward} onToggle={() => toggleSetting('reward')} />
            </div>
        </Modal>
    );
};