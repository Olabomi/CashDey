import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useLocale } from '../contexts/LocaleContext';
import { BillIcon, PlusIcon, TvIcon, PowerIcon, WifiIcon, HomeIcon } from './icons';
import AddBillModal from './AddBillModal';
import type { Bill } from '../types';

const Section: React.FC<{ title: string; children: React.ReactNode; count: number }> = ({ title, children, count }) => (
    <div>
        <h2 className="text-sm font-semibold uppercase text-gray-500 tracking-wider px-2 mb-2">{title} ({count})</h2>
        <div className="space-y-3">{children}</div>
    </div>
);

const getBillIcon = (category: Bill['category']) => {
    switch (category) {
        case 'subscription': return <TvIcon />;
        case 'utilities': return <PowerIcon />;
        case 'rent': return <HomeIcon />;
        case 'loan': return <WifiIcon />; // Reusing Wifi for loan as a placeholder
        default: return <BillIcon />;
    }
};

const getDueDateStatus = (dueDate: string, t: (key: string, replacements?: Record<string, string | number>) => string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: t('dashboard.bills.overdueByDays', { count: Math.abs(diffDays) }), color: 'text-rose-400' };
    if (diffDays === 0) return { text: t('dashboard.bills.dueToday'), color: 'text-rose-400' };
    if (diffDays <= 7) return { text: t('dashboard.bills.dueInDays', { count: diffDays }), color: 'text-amber-400' };
    return { text: `Due: ${due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`, color: 'text-gray-400' };
};


const BillItem: React.FC<{ bill: Bill; onEdit: (bill: Bill) => void }> = ({ bill, onEdit }) => {
    const { t } = useLocale();
    const status = getDueDateStatus(bill.dueDate, t);
    return (
        <button onClick={() => onEdit(bill)} className="w-full text-left flex items-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/80 transition-colors">
            <div className="p-3 bg-gray-700/80 rounded-full text-emerald-400 mr-4">
                {getBillIcon(bill.category)}
            </div>
            <div className="flex-grow">
                <p className="font-semibold text-white">{bill.biller}</p>
                <p className={`text-sm font-medium ${status.color}`}>{status.text}</p>
            </div>
            <div className="text-right">
                <p className="font-bold text-lg text-white">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(bill.amount)}</p>
                <p className="text-xs text-gray-400 capitalize">{t(`billsScreen.modal.categories.${bill.category}`)}</p>
            </div>
        </button>
    );
};

const Bills: React.FC = () => {
    const { bills, addBill, updateBill, deleteBill } = useData();
    const { t } = useLocale();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [billToEdit, setBillToEdit] = useState<Bill | null>(null);

    const handleOpenAddModal = () => {
        setBillToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (bill: Bill) => {
        setBillToEdit(bill);
        setIsModalOpen(true);
    };

    const categorizedBills = useMemo(() => {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfWeek = new Date(startOfToday);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        const overdue: Bill[] = [];
        const dueThisWeek: Bill[] = [];
        const upcoming: Bill[] = [];

        bills.forEach(bill => {
            const dueDate = new Date(bill.dueDate);
            if (dueDate < startOfToday) {
                overdue.push(bill);
            } else if (dueDate >= startOfToday && dueDate < endOfWeek) {
                dueThisWeek.push(bill);
            } else {
                upcoming.push(bill);
            }
        });

        return { overdue, dueThisWeek, upcoming };
    }, [bills]);

    return (
        <>
            <div className="animate-fade-in-up space-y-8 pb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">{t('billsScreen.title')}</h1>
                    </div>
                    <button onClick={handleOpenAddModal} className="flex items-center space-x-2 text-sm font-semibold bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors active:scale-95 transform">
                        <PlusIcon className="w-5 h-5" />
                        <span>{t('billsScreen.addBill')}</span>
                    </button>
                </div>

                {bills.length === 0 ? (
                     <div className="text-center text-gray-400 py-16">
                        <div className="mx-auto w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                            <BillIcon />
                        </div>
                        <p className="font-semibold">{t('billsScreen.noBills')}</p>
                        <p className="text-sm">{t('billsScreen.noBillsDesc')}</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {categorizedBills.overdue.length > 0 && (
                            <Section title={t('billsScreen.overdue')} count={categorizedBills.overdue.length}>
                                {categorizedBills.overdue.map(bill => <BillItem key={bill.id} bill={bill} onEdit={handleOpenEditModal} />)}
                            </Section>
                        )}
                        {categorizedBills.dueThisWeek.length > 0 && (
                            <Section title={t('billsScreen.dueThisWeek')} count={categorizedBills.dueThisWeek.length}>
                                {categorizedBills.dueThisWeek.map(bill => <BillItem key={bill.id} bill={bill} onEdit={handleOpenEditModal} />)}
                            </Section>
                        )}
                        {categorizedBills.upcoming.length > 0 && (
                            <Section title={t('billsScreen.upcoming')} count={categorizedBills.upcoming.length}>
                                {categorizedBills.upcoming.map(bill => <BillItem key={bill.id} bill={bill} onEdit={handleOpenEditModal} />)}
                            </Section>
                        )}
                    </div>
                )}
            </div>

            <AddBillModal
                show={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={addBill}
                onUpdate={updateBill}
                onDelete={deleteBill}
                billToEdit={billToEdit}
            />
        </>
    );
};

export default Bills;
