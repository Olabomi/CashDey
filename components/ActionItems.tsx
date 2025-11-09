import React, { useState, useMemo } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { ListBulletIcon } from './icons';

interface FinancialTask {
  id: number;
  description: string;
  dueDate: Date;
  completed: boolean;
}

const getDueDateStatus = (dueDate: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)} day(s)`, color: 'text-rose-400' };
  if (diffDays === 0) return { text: 'Due today', color: 'text-amber-400' };
  return { text: `Due: ${due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`, color: 'text-gray-400' };
};

const TaskItem: React.FC<{ task: FinancialTask; onToggle: (id: number) => void }> = ({ task, onToggle }) => {
    const status = getDueDateStatus(task.dueDate);
    return (
        <div className={`flex items-center p-3 rounded-lg transition-all ${task.completed ? 'bg-gray-800/40' : 'bg-gray-700/60'}`}>
            <button
                onClick={() => onToggle(task.id)}
                className="flex-shrink-0 w-6 h-6 rounded-md border-2 border-gray-500 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-checked={task.completed}
            >
                {task.completed && <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>}
            </button>
            <div className={`flex-grow mx-4 ${task.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                {task.description}
            </div>
            <div className={`text-sm font-medium text-right flex-shrink-0 w-32 ${status.color}`}>
                {status.text}
            </div>
        </div>
    );
};

const ActionItems: React.FC = () => {
    const { t } = useLocale();
    const initialTasks = useMemo(() => {
        const today = new Date();
        return [
          { id: 1, description: "Pay DSTV subscription", dueDate: new Date(new Date().setDate(today.getDate() + 2)), completed: false },
          { id: 2, description: "Send money for Black Tax", dueDate: new Date(new Date().setDate(today.getDate() + 20)), completed: false },
          { id: 3, description: "Review monthly budget for transport costs", dueDate: new Date(new Date().setDate(today.getDate() - 2)), completed: true },
          { id: 4, description: "Follow up on Ajo contribution with Tunde", dueDate: new Date(new Date().setDate(today.getDate() + 5)), completed: false },
          { id: 5, description: "Pay NEPA bill (prepaid)", dueDate: new Date(new Date().setDate(today.getDate() - 1)), completed: false },
          { id: 6, description: "Plan for December Vibe savings", dueDate: new Date(new Date().setDate(today.getDate() + 30)), completed: false },
        ];
    }, []);

    const [tasks, setTasks] = useState<FinancialTask[]>(initialTasks);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

    const handleToggleTask = (id: number) => {
        setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
    };

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            if (filter === 'pending') return !task.completed;
            if (filter === 'completed') return task.completed;
            return true;
        }).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    }, [tasks, filter]);
    
    const completedCount = useMemo(() => tasks.filter(t => t.completed).length, [tasks]);
    const pendingCount = tasks.length - completedCount;

    return (
        <div className="animate-fade-in-up space-y-6 pb-8">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">{t('actionItems.title')}</h1>
                    <p className="text-md text-gray-400">{t('actionItems.subtitle')}</p>
                </div>
                <button className="text-sm font-semibold bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors active:scale-95 transform">
                    {t('actionItems.addTask')}
                </button>
            </div>

            <div className="flex justify-center p-1 bg-gray-800/80 rounded-full border border-white/10">
                <button onClick={() => setFilter('pending')} className={`w-1/3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-emerald-600 text-white' : 'text-gray-300'}`}>
                    {t('actionItems.pending')} ({pendingCount})
                </button>
                <button onClick={() => setFilter('completed')} className={`w-1/3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'completed' ? 'bg-emerald-600 text-white' : 'text-gray-300'}`}>
                     {t('actionItems.completed')} ({completedCount})
                </button>
                <button onClick={() => setFilter('all')} className={`w-1/3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-emerald-600 text-white' : 'text-gray-300'}`}>
                     {t('actionItems.all')}
                </button>
            </div>

            <div className="space-y-3">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => <TaskItem key={task.id} task={task} onToggle={handleToggleTask} />)
                ) : (
                    <div className="text-center text-gray-400 py-16">
                        <div className="mx-auto w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                            <ListBulletIcon />
                        </div>
                        <p className="font-semibold">{t('actionItems.noTasks')}</p>
                        <p className="text-sm">{t('actionItems.noTasksDesc')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActionItems;