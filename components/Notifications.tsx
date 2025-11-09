import React from 'react';
import { useData } from '../contexts/DataContext';
import { useLocale } from '../contexts/LocaleContext';
import { BellIcon, BillIcon, TrophyIcon, GiftIcon, UserPlusIcon, ShieldIcon, AjoIcon } from './icons';
import type { Notification } from '../types';

const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
        case 'bill': return <BillIcon />;
        case 'goal': return <TrophyIcon />;
        case 'reward': return <GiftIcon />;
        case 'referral': return <UserPlusIcon />;
        case 'security': return <ShieldIcon />;
        case 'ajo': return <AjoIcon />;
        default: return <BellIcon />;
    }
};

const formatDistanceToNow = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)}y ago`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)}mo ago`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)}d ago`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)}h ago`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)}m ago`;
    return 'Just now';
};


const NotificationItem: React.FC<{ notification: Notification; onClick: () => void }> = ({ notification, onClick }) => {
    const isUnread = !notification.read_at;
    return (
        <button
            onClick={onClick}
            className={`w-full text-left flex items-start p-4 transition-colors ${isUnread ? 'bg-emerald-500/10' : 'hover:bg-white/5'}`}
        >
            {isUnread && <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>}
            <div className={`flex-shrink-0 text-emerald-400 mr-4 ${!isUnread && 'ml-5'}`}>
                {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-grow">
                <p className={`font-semibold ${isUnread ? 'text-white' : 'text-gray-300'}`}>{notification.title}</p>
                <p className="text-sm text-gray-400">{notification.body}</p>
            </div>
            <p className="text-xs text-gray-500 flex-shrink-0 ml-4">{formatDistanceToNow(new Date(notification.created_at))}</p>
        </button>
    );
};

const Notifications: React.FC = () => {
    const { notifications, markNotificationAsRead, markAllAsRead } = useData();
    const { t } = useLocale();

    const groupedNotifications = React.useMemo(() => {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

        const groups = {
            today: [] as Notification[],
            thisWeek: [] as Notification[],
            earlier: [] as Notification[],
        };

        notifications.forEach(n => {
            const nDate = new Date(n.created_at);
            if (nDate >= startOfToday) {
                groups.today.push(n);
            } else if (nDate >= startOfWeek) {
                groups.thisWeek.push(n);
            } else {
                groups.earlier.push(n);
            }
        });

        return groups;
    }, [notifications]);

    return (
        <div className="animate-fade-in-up pb-8">
            <div className="flex items-center justify-end mb-4">
                <button
                    onClick={markAllAsRead}
                    className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                    {t('notificationsScreen.markAllRead')}
                </button>
            </div>

            <div className="bg-gray-800/50 rounded-xl backdrop-blur-sm border border-white/10 overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="text-center text-gray-400 py-16">
                        <div className="mx-auto w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                            <BellIcon />
                        </div>
                        <p className="font-semibold">{t('notificationsScreen.noNotifications')}</p>
                        <p className="text-sm">{t('notificationsScreen.noNotificationsDesc')}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/10">
                        {groupedNotifications.today.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold uppercase text-gray-500 p-3 bg-gray-900/50">{t('notificationsScreen.today')}</h3>
                                {groupedNotifications.today.map(n => <NotificationItem key={n.id} notification={n} onClick={() => markNotificationAsRead(n.id)} />)}
                            </div>
                        )}
                        {groupedNotifications.thisWeek.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold uppercase text-gray-500 p-3 bg-gray-900/50">{t('notificationsScreen.thisWeek')}</h3>
                                {groupedNotifications.thisWeek.map(n => <NotificationItem key={n.id} notification={n} onClick={() => markNotificationAsRead(n.id)} />)}
                            </div>
                        )}
                        {groupedNotifications.earlier.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold uppercase text-gray-500 p-3 bg-gray-900/50">{t('notificationsScreen.earlier')}</h3>
                                {groupedNotifications.earlier.map(n => <NotificationItem key={n.id} notification={n} onClick={() => markNotificationAsRead(n.id)} />)}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;