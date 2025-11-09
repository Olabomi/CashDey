import React, { useState, useEffect } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { CloseIcon } from './icons';
import type { User, Profile } from '../types';

interface EditProfileModalProps {
    show: boolean;
    onClose: () => void;
    user: User;
    onSave: (updates: Partial<Pick<Profile, 'name' | 'nickname' | 'bio'>>) => Promise<void>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ show, onClose, user, onSave }) => {
    const { t } = useLocale();
    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');
    const [bio, setBio] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        if (user && show) {
            setName(user.name || '');
            setNickname(user.nickname || '');
            setBio(user.bio || '');
        }
    }, [user, show]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave({ name, nickname, bio });
        setIsSaving(false);
        onClose();
    };

    if (!show) return null;
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-white/10 rounded-2xl shadow-xl w-full max-w-sm m-4 p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">{t('profile.editProfile')}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors"><CloseIcon className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">{t('profile.fullName')}</label>
                        <input
                            id="fullName" type="text" value={name} onChange={e => setName(e.target.value)}
                            required
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                        />
                    </div>
                     <div>
                        <label htmlFor="nickname" className="block text-sm font-medium text-gray-300 mb-1">{t('profile.nickname')}</label>
                        <input
                            id="nickname" type="text" value={nickname} onChange={e => setNickname(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                        />
                    </div>
                     <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">{t('profile.bio')}</label>
                        <textarea
                            id="bio" value={bio} onChange={e => setBio(e.target.value)}
                            rows={3}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                        />
                    </div>
                    
                    <div className="pt-2">
                        <button type="submit" disabled={isSaving} className="w-full bg-emerald-600 text-white rounded-lg py-2.5 hover:bg-emerald-700 transition-colors active:scale-95 transform font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed">
                            {isSaving ? 'Saving...' : t('profile.saveChanges')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;