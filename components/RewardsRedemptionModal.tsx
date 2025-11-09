import React, { useState, useMemo, useEffect } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { CloseIcon } from './icons';

export type RedemptionType = 'bill' | 'airtime' | 'cash';

interface RewardsRedemptionModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (type: RedemptionType, amount: number, target?: string) => void;
    type: RedemptionType;
    balance: number;
}

const RewardsRedemptionModal: React.FC<RewardsRedemptionModalProps> = ({ show, onClose, onSubmit, type, balance }) => {
    const { t } = useLocale();
    const [amount, setAmount] = useState('');
    const [target, setTarget] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Reset state when the modal type changes or it's reopened
        if (show) {
            setAmount('');
            setTarget('');
            setError('');
        }
    }, [show, type]);


    const config = useMemo(() => {
        const balanceFormatted = new Intl.NumberFormat().format(balance);
        switch (type) {
            case 'bill':
                return {
                    title: t('rewardsScreen.rewardsRedemption.billTitle'),
                    targetLabel: t('rewardsScreen.rewardsRedemption.billerName'),
                    targetPlaceholder: t('rewardsScreen.rewardsRedemption.billerPlaceholder'),
                    submitText: t('rewardsScreen.rewardsRedemption.payNow'),
                };
            case 'airtime':
                return {
                    title: t('rewardsScreen.rewardsRedemption.airtimeTitle'),
                    targetLabel: t('rewardsScreen.rewardsRedemption.phoneNumber'),
                    targetPlaceholder: t('rewardsScreen.rewardsRedemption.phonePlaceholder'),
                    submitText: t('rewardsScreen.rewardsRedemption.buyNow'),
                };
            case 'cash':
            default:
                return {
                    title: t('rewardsScreen.rewardsRedemption.cashTitle'),
                    submitText: t('rewardsScreen.rewardsRedemption.convertNow'),
                    infoText: t('rewardsScreen.rewardsRedemption.balanceInfo', { balance: balanceFormatted }),
                };
        }
    }, [type, t, balance]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*\.?\d{0,2}$/.test(value)) { // Allow up to 2 decimal places
            setAmount(value);
            const numericValue = parseFloat(value);
            if (numericValue > balance) {
                setError(t('rewardsScreen.rewardsRedemption.insufficientBalance'));
            } else {
                setError('');
            }
        }
    };
    
    const setMaxAmount = () => {
        setAmount(String(balance));
        setError('');
    };

    const handleSubmit = () => {
        const numericAmount = parseFloat(amount);
        if (error || !amount || numericAmount <= 0) return;
        if (type !== 'cash' && !target.trim()) return;
        onSubmit(type, numericAmount, target);
    };
    

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-white/10 rounded-2xl shadow-xl w-full max-w-sm m-4 p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">{config.title}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors"><CloseIcon className="w-5 h-5" /></button>
                </div>
                
                <div className="space-y-4">
                    {config.infoText && (
                        <p className="text-sm text-center bg-gray-700/50 p-3 rounded-lg text-gray-300">{config.infoText}</p>
                    )}

                    {type !== 'cash' && (
                         <div>
                            <label htmlFor="target-input" className="block text-sm font-medium text-gray-300 mb-1">{config.targetLabel}</label>
                            <input
                                id="target-input"
                                type={type === 'airtime' ? 'tel' : 'text'}
                                value={target}
                                onChange={e => setTarget(e.target.value)}
                                placeholder={config.targetPlaceholder}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                            />
                        </div>
                    )}

                    <div>
                        <label htmlFor="amount-input" className="block text-sm font-medium text-gray-300 mb-1">{t('rewardsScreen.rewardsRedemption.amount')}</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">CP</span>
                            <input
                                id="amount-input"
                                type="text" 
                                inputMode="decimal"
                                value={amount}
                                onChange={handleAmountChange}
                                placeholder={t('rewardsScreen.rewardsRedemption.amountPlaceholder')}
                                className={`w-full bg-gray-700 border rounded-md p-2 pl-9 pr-16 focus:outline-none focus:ring-2 text-white ${error ? 'border-rose-500 ring-rose-500' : 'border-gray-600 focus:ring-emerald-500'}`}
                            />
                            <button onClick={setMaxAmount} className="absolute inset-y-0 right-0 flex items-center px-3 text-xs font-bold text-emerald-400 hover:text-emerald-300">
                                {t('rewardsScreen.rewardsRedemption.max')}
                            </button>
                        </div>
                        {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
                    </div>

                     <div className="flex items-center space-x-3 mt-6">
                        <button onClick={onClose} className="w-full bg-gray-600 text-white rounded-lg py-2.5 hover:bg-gray-700 transition-colors active:scale-95 transform font-semibold">{t('marketNewsScreen.cancel')}</button>
                        <button onClick={handleSubmit} disabled={!!error || !amount || parseFloat(amount) <= 0 || (type !== 'cash' && !target.trim())} className="w-full bg-emerald-600 text-white rounded-lg py-2.5 hover:bg-emerald-700 transition-colors active:scale-95 transform font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed">
                            {config.submitText}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RewardsRedemptionModal;