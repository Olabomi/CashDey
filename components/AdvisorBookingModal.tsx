import React, { useState, useMemo } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { CloseIcon, BuildingOfficeIcon, VideoCameraIcon, ChatBubbleLeftRightIcon, PhoneIcon, CheckCircleIcon } from './icons';
import type { AdvisorBookingDetails, MeetingType, AdvisorTopic } from '../types';

interface AdvisorBookingModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (details: AdvisorBookingDetails) => void;
}

const AdvisorBookingModal: React.FC<AdvisorBookingModalProps> = ({ show, onClose, onSubmit }) => {
    const { t } = useLocale();
    const [step, setStep] = useState(1);
    const [bookingDetails, setBookingDetails] = useState<AdvisorBookingDetails>({
        meetingType: '',
        topic: '',
        otherTopicText: '',
        timeSlot: ''
    });

    const updateDetails = (update: Partial<AdvisorBookingDetails>) => {
        setBookingDetails(prev => ({ ...prev, ...update }));
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 3));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));
    
    const handleClose = () => {
        onClose();
        // Reset state after a delay to allow for closing animation
        setTimeout(() => {
            setStep(1);
            setBookingDetails({ meetingType: '', topic: '', otherTopicText: '', timeSlot: '' });
        }, 300);
    };

    const handleSubmit = () => {
        onSubmit(bookingDetails);
        handleClose();
    };

    if (!show) return null;

    const renderStepContent = () => {
        switch (step) {
            case 1: return <Step1 content={bookingDetails} setContent={updateDetails} />;
            case 2: return <Step2 content={bookingDetails} setContent={updateDetails} />;
            case 3: return <Step3 content={bookingDetails} setContent={updateDetails} />;
            default: return null;
        }
    };

    const getStepTitle = () => {
        switch (step) {
            case 1: return t('advisorBooking.step1Title');
            case 2: return t('advisorBooking.step2Title');
            case 3: return t('advisorBooking.step3Title');
            default: return '';
        }
    };
    
    const isNextDisabled = () => {
        if (step === 1) return !bookingDetails.meetingType;
        if (step === 2) return !bookingDetails.topic || (bookingDetails.topic === 'other' && !bookingDetails.otherTopicText.trim());
        return false; // Step 3 has confirm, not next
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={handleClose}>
            <div className="bg-gray-800 border border-white/10 rounded-2xl shadow-xl w-full max-w-md m-4 p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">{getStepTitle()}</h2>
                    <button onClick={handleClose} className="p-1 rounded-full hover:bg-white/10 transition-colors"><CloseIcon className="w-5 h-5" /></button>
                </div>

                <div className="min-h-[250px]">{renderStepContent()}</div>

                <div className="flex items-center space-x-3 mt-6">
                    {step > 1 && (
                        <button onClick={prevStep} className="w-full bg-gray-600 text-white rounded-lg py-2.5 hover:bg-gray-700 transition-colors active:scale-95 transform font-semibold">{t('advisorBooking.back')}</button>
                    )}
                    {step < 3 ? (
                        <button onClick={nextStep} disabled={isNextDisabled()} className="w-full bg-emerald-600 text-white rounded-lg py-2.5 hover:bg-emerald-700 transition-colors active:scale-95 transform font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed">{t('advisorBooking.next')}</button>
                    ) : (
                        <button onClick={handleSubmit} disabled={!bookingDetails.timeSlot} className="w-full bg-emerald-600 text-white rounded-lg py-2.5 hover:bg-emerald-700 transition-colors active:scale-95 transform font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed">{t('advisorBooking.confirmBooking')}</button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Step Components ---

const Step1: React.FC<{ content: AdvisorBookingDetails; setContent: (update: Partial<AdvisorBookingDetails>) => void; }> = ({ content, setContent }) => {
    const { t } = useLocale();
    const meetingTypes: { id: MeetingType; icon: React.ReactNode; label: string }[] = [
        { id: 'face-to-face', icon: <BuildingOfficeIcon />, label: t('advisorBooking.meetingType.faceToFace') },
        { id: 'video', icon: <VideoCameraIcon />, label: t('advisorBooking.meetingType.video') },
        { id: 'whatsapp', icon: <ChatBubbleLeftRightIcon />, label: t('advisorBooking.meetingType.whatsapp') },
        { id: 'voice', icon: <PhoneIcon />, label: t('advisorBooking.meetingType.voice') },
    ];
    return (
        <div className="grid grid-cols-2 gap-4">
            {meetingTypes.map(type => (
                <button
                    key={type.id}
                    onClick={() => setContent({ meetingType: type.id })}
                    className={`p-4 rounded-lg flex flex-col items-center justify-center space-y-2 text-center border-2 transition-all duration-200 ${content.meetingType === type.id ? 'bg-emerald-500/20 border-emerald-500' : 'bg-gray-700/50 border-gray-600 hover:border-emerald-500/50'}`}
                >
                    <div className={content.meetingType === type.id ? 'text-emerald-400' : 'text-gray-300'}>{type.icon}</div>
                    <span className="text-sm font-semibold text-white">{type.label}</span>
                </button>
            ))}
        </div>
    );
};

const Step2: React.FC<{ content: AdvisorBookingDetails; setContent: (update: Partial<AdvisorBookingDetails>) => void; }> = ({ content, setContent }) => {
    const { t } = useLocale();
    const topics: { id: AdvisorTopic, label: string }[] = [
        { id: 'savings', label: t('advisorBooking.topic.savings') },
        { id: 'investment', label: t('advisorBooking.topic.investment') },
        { id: 'debt', label: t('advisorBooking.topic.debt') },
        { id: 'retirement', label: t('advisorBooking.topic.retirement') },
        { id: 'business', label: t('advisorBooking.topic.business') },
        { id: 'other', label: t('advisorBooking.topic.other') },
    ];
    return (
        <div>
            <div className="flex flex-wrap gap-3">
                {topics.map(topic => (
                    <button
                        key={topic.id}
                        onClick={() => setContent({ topic: topic.id })}
                        className={`px-4 py-2 text-sm font-semibold rounded-full border transition-colors ${content.topic === topic.id ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-emerald-500/20'}`}
                    >
                        {topic.label}
                    </button>
                ))}
            </div>
            {content.topic === 'other' && (
                <textarea
                    value={content.otherTopicText}
                    onChange={e => setContent({ otherTopicText: e.target.value })}
                    placeholder={t('advisorBooking.otherPlaceholder')}
                    className="mt-4 w-full bg-gray-700 border border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white animate-fade-in"
                    rows={3}
                />
            )}
        </div>
    );
};

const Step3: React.FC<{ content: AdvisorBookingDetails; setContent: (update: Partial<AdvisorBookingDetails>) => void; }> = ({ content, setContent }) => {
    const { t } = useLocale();
    const availableSlots = useMemo(() => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return [
            { day: 'Today', slots: ['10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
            { day: 'Tomorrow', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '03:00 PM'] },
        ];
    }, []);

    return (
        <div className="space-y-4">
            {availableSlots.map(({ day, slots }) => (
                <div key={day}>
                    <h4 className="font-semibold text-gray-300 mb-2">{day}</h4>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {slots.map(slot => (
                            <button
                                key={slot}
                                onClick={() => setContent({ timeSlot: `${day} at ${slot}` })}
                                className={`p-2 text-sm font-semibold rounded-md border transition-colors ${content.timeSlot === `${day} at ${slot}` ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-emerald-500/20'}`}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
             <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-start text-xs text-gray-400 bg-gray-700/50 p-3 rounded-lg">
                    <CheckCircleIcon className="w-8 h-8 flex-shrink-0 mr-2 text-emerald-500"/>
                    <p>{t('advisorBooking.disclaimer')}</p>
                </div>
            </div>
        </div>
    );
};

export default AdvisorBookingModal;