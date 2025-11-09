import React, { useState, useEffect } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useData } from '../contexts/DataContext';
import { CloseIcon, TrashIcon } from './icons';
import type { Bill } from '../types';

interface AddBillModalProps {
    show: boolean;
    onClose: () => void;
    onSave: (bill: Omit<Bill, 'id'>) => void;
    onUpdate: (bill: Bill) => void;
    onDelete: (billId: number) => void;
    billToEdit?: Bill | null;
}

const AddBillModal: React.FC<AddBillModalProps> = ({ show, onClose, onSave, onUpdate, onDelete, billToEdit }) => {
    const { t } = useLocale();
    const [biller, setBiller] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<Bill['category']>('subscription');
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
    
    const isEditMode = !!billToEdit;

    useEffect(() => {
        if (show && isEditMode && billToEdit) {
            setBiller(billToEdit.biller);
            setAmount(String(billToEdit.amount));
            setCategory(billToEdit.category);
            setDueDate(new Date(billToEdit.dueDate).toISOString().split('T')[0]);
        } else if (show && !isEditMode) {
            setBiller('');
            setAmount('');
            setCategory('subscription');
            setDueDate(new Date().toISOString().split('T')[0]);
        }
    }, [show, isEditMode, billToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const billData = {
            biller,
            amount: parseFloat(amount),
            category,
            dueDate: new Date(dueDate).toISOString(),
        };

        if (isEditMode && billToEdit) {
            onUpdate({ ...billData, id: billToEdit.id });
        } else {
            onSave(billData);
        }
        onClose();
    };

    const handleDelete = () => {
        if (isEditMode && billToEdit && window.confirm(t('billsScreen.modal.deleteConfirm'))) {
            onDelete(billToEdit.id);
            onClose();
        }
    };

    if (!show) return null;

    return (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-white/10 rounded-2xl shadow-xl w-full max-w-sm m-4 p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">{isEditMode ? t('billsScreen.modal.editTitle') : t('billsScreen.modal.addTitle')}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors"><CloseIcon className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="biller" className="block text-sm font-medium text-gray-300 mb-1">{t('billsScreen.modal.biller')}</label>
                        <input
                            id="biller" type="text" value={biller} onChange={e => setBiller(e.target.value)}
                            placeholder={t('billsScreen.modal.billerPlaceholder')} required
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">{t('billsScreen.modal.amount')}</label>
                             <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">₦</span>
                                <input
                                    id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)}
                                    placeholder="0.00" required
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 pl-7 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">{t('billsScreen.modal.category')}</label>
                            <select
                                id="category" value={category} onChange={e => setCategory(e.target.value as Bill['category'])} required
                                 className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white h-[42px]"
                            >
                                <option value="subscription">{t('billsScreen.modal.categories.subscription')}</option>
                                <option value="utilities">{t('billsScreen.modal.categories.utilities')}</option>
                                <option value="rent">{t('billsScreen.modal.categories.rent')}</option>
                                <option value="loan">{t('billsScreen.modal.categories.loan')}</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-300 mb-1">{t('billsScreen.modal.dueDate')}</label>
                        <input
                            id="dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                        />
                    </div>
                    
                     <div className="pt-2 flex items-center space-x-3">
                        {isEditMode && (
                             <button type="button" onClick={handleDelete} className="p-3 bg-rose-600/20 text-rose-400 rounded-lg hover:bg-rose-600/40 transition-colors active:scale-95 transform">
                                <TrashIcon />
                             </button>
                        )}
                        <button type="submit" className="w-full bg-emerald-600 text-white rounded-lg py-2.5 hover:bg-emerald-700 transition-colors active:scale-95 transform font-semibold">
                            {isEditMode ? t('billsScreen.modal.update') : t('billsScreen.modal.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBillModal;
