import React, { useState, useMemo, useEffect } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { CloseIcon } from './icons';
import type { Transaction } from '../types';

interface AddTransactionModalProps {
    show: boolean;
    onClose: () => void;
    transactionToEdit?: Transaction | null;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ show, onClose, transactionToEdit }) => {
    const { t } = useLocale();
    const { categories, accounts, addTransaction, updateTransaction } = useData();
    const { user } = useAuth();
    const { addToast } = useToast();

    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const isEditMode = !!transactionToEdit;

    const availableCategories = useMemo(() => {
        return categories.filter(c => c.kind === type);
    }, [categories, type]);

    const resetForm = () => {
        setType('expense');
        setAmount('');
        setCategoryId('');
        setDate(new Date().toISOString().split('T')[0]);
        setNotes('');
        setIsSubmitting(false);
    };
    
    useEffect(() => {
        if (show) {
            if (isEditMode && transactionToEdit) {
                const txType = transactionToEdit.amount < 0 ? 'expense' : 'income';
                setType(txType);
                setAmount(String(Math.abs(transactionToEdit.amount)));
                setCategoryId(String(transactionToEdit.category_id));
                setDate(new Date(transactionToEdit.date).toISOString().split('T')[0]);
                setNotes(transactionToEdit.notes || '');
            } else {
                resetForm();
            }
        }
    }, [show, isEditMode, transactionToEdit]);

     // When type changes, if the selected category is no longer valid, reset it.
    useEffect(() => {
        if (!availableCategories.some(c => c.id === parseInt(categoryId))) {
            setCategoryId('');
        }
    }, [type, availableCategories, categoryId]);


    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !categoryId || !user || !accounts.length) return;

        setIsSubmitting(true);
        const finalAmount = type === 'expense' ? -parseFloat(amount) : parseFloat(amount);
        
        try {
            if (isEditMode && transactionToEdit) {
                await updateTransaction(transactionToEdit.id, {
                    amount: finalAmount,
                    category_id: parseInt(categoryId),
                    date: new Date(date).toISOString(),
                    notes: notes,
                });
                addToast('Transaction updated successfully!', 'success');
            } else {
                const cashAccount = accounts.find(acc => acc.type === 'cash');
                if (!cashAccount) {
                    throw new Error("No cash account found to log transaction against.");
                }
                
                const newTx = {
                    account_id: cashAccount.id,
                    amount: finalAmount,
                    currency: 'NGN' as const,
                    type: type,
                    category_id: parseInt(categoryId),
                    merchant: 'Manual Entry',
                    date: new Date(date).toISOString(),
                    source: 'manual' as const,
                    notes: notes,
                };
                
                await addTransaction(newTx);
                addToast('Transaction added successfully!', 'success');
            }
            handleClose();
        } catch (error) {
            console.error('Failed to save transaction:', error);
            addToast(isEditMode ? 'Failed to update transaction.' : 'Failed to add transaction.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };


    if (!show) return null;

    const modalTitle = isEditMode
        ? 'Edit Transaction'
        : (type === 'expense' ? t('addTxModal.titleExpense') : t('addTxModal.titleIncome'));


    return (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={handleClose}>
            <div className="bg-gray-800 border border-white/10 rounded-2xl shadow-xl w-full max-w-sm m-4 p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">{modalTitle}</h2>
                    <button onClick={handleClose} className="p-1 rounded-full hover:bg-white/10 transition-colors"><CloseIcon className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isEditMode && (
                         <div className="flex space-x-2 bg-gray-900/50 p-1 rounded-full">
                            <button type="button" onClick={() => setType('expense')} className={`w-full py-1.5 text-sm font-semibold rounded-full transition-colors ${type === 'expense' ? 'bg-rose-600 text-white' : 'text-gray-300'}`}>{t('addTxModal.expense')}</button>
                            <button type="button" onClick={() => setType('income')} className={`w-full py-1.5 text-sm font-semibold rounded-full transition-colors ${type === 'income' ? 'bg-emerald-600 text-white' : 'text-gray-300'}`}>{t('addTxModal.income')}</button>
                        </div>
                    )}

                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">{t('addTxModal.amount')}</label>
                         <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">₦</span>
                            <input
                                data-testid="amount-input"
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="0.00"
                                required
                                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 pl-7 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">{t('addTxModal.category')}</label>
                        <select
                            data-testid="category-select"
                            id="category"
                            value={categoryId}
                            onChange={e => setCategoryId(e.target.value)}
                            required
                             className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                        >
                            <option value="" disabled>{t('addTxModal.selectCategory')}</option>
                            {availableCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">{t('addTxModal.date')}</label>
                        <input
                            id="date"
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                        />
                    </div>

                     <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">{t('addTxModal.notes')}</label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder={t('addTxModal.notesPlaceholder')}
                            rows={2}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                        />
                    </div>
                    
                     <div className="pt-2">
                        <button type="submit" data-testid="save-transaction-button" disabled={isSubmitting || !categoryId} className="w-full bg-emerald-600 text-white rounded-lg py-2.5 hover:bg-emerald-700 transition-colors active:scale-95 transform font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed">
                            {isSubmitting ? (isEditMode ? 'Saving...' : 'Adding...') : (isEditMode ? 'Save Changes' : t('addTxModal.addTransaction'))}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AddTransactionModal;