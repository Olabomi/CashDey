import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { useData } from '../contexts/DataContext';
import { useLocale } from '../contexts/LocaleContext';
import { useNavigation } from '../contexts/NavigationContext';
import type { DashboardInsightsResponse } from '../types';
import { BellIcon, CrystalBallIcon, PathIcon, CashFlowIcon, CloseIcon } from './icons';

const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-white/10 animate-pulse ${className}`}>
        <div className="h-5 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
    </div>
);

const DashboardInsights: React.FC = () => {
    const [insights, setInsights] = useState<DashboardInsightsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [nudgeVisible, setNudgeVisible] = useState(true);

    const { user, wallet, transactions, portfolio, savingsGoals } = useData();
    const { t } = useLocale();
    const { setActiveView } = useNavigation();
    // FIX: Use environment variable for API key.
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);

    useEffect(() => {
        const fetchInsights = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                // Sanitize transactions to only include relevant fields for the prompt
                const sanitizedTransactions = transactions.map(({ id, notes, ...rest }) => rest);

                const financialContext = {
                    user: {
                        name: user?.name,
                        levelName: user?.levelName,
                        levelTier: user?.levelTier,
                    },
                    wallet: {
                        spendable: wallet?.spendable,
                        lockedInGoals: wallet?.lockedInGoals,
                        totalBalance: wallet?.totalBalance,
                    },
                    portfolio: {
                        totalValue: portfolio?.totalValue,
                        totalChange: portfolio?.totalChange,
                    },
                    savingsGoals: savingsGoals.map(({ id, ...rest }) => rest), // Remove id
                    recentTransactions: sanitizedTransactions.slice(0, 10) // Limit to last 10
                };
                
                const prompt = `
                    As CashDey Coach, analyze this Nigerian user's complete financial context provided as a JSON object.
                    Your primary goal is to provide a holistic, interconnected analysis.
                    Adopt a humble, observational tone ("I notice that...", "It looks like...").
                    Do not just repeat the data; interpret it and provide actionable, empathetic, and culturally relevant insights.
                    The current date is ${new Date().toDateString()}.

                    Financial Context:
                    \`\`\`json
                    ${JSON.stringify(financialContext, null, 2)}
                    \`\`\`

                    Based on the ENTIRE context, generate a response that is a single JSON object.
                `;

                const responseSchema = {
                    type: Type.OBJECT,
                    properties: {
                        cashFlowAnalysis: {
                            type: Type.OBJECT,
                            properties: {
                                income: { type: Type.NUMBER, description: "Total income from deposits and reward credits." },
                                expenses: { type: Type.NUMBER, description: "Total expenses from sends and expense types." },
                                netFlow: { type: Type.NUMBER, description: "Calculated as income minus expenses." },
                                commentary: { type: Type.STRING, description: "A short, insightful, and empathetic comment in Nigerian English about their cash flow for the month (e.g., 'You dey try! Your income pass your spending well well this month.')." }
                            }
                        },
                        keyInsight: {
                             type: Type.OBJECT,
                             properties: {
                                title: { type: Type.STRING, description: "A short, forward-looking title for the 'Next Best Step' (e.g., 'Build Your Emergency Fund')." },
                                description: { type: Type.STRING, description: "A one-sentence description of why this step is important, based on their data (e.g., 'Your savings fit cover you for 2 weeks, make we try extend am.')." },
                                reasoning: { type: Type.STRING, description: "A very brief explanation of the data that led to this insight (e.g., 'Based on your low emergency savings and high discretionary spending.')." }
                             }
                        },
                        actionableNudge: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING, description: "A catchy title for the nudge (e.g., 'Jumia Food Spending Alert!')." },
                                description: { type: Type.STRING, description: "A short, friendly nudge based on a specific observation from their data (e.g., 'I see say you spend ₦4,500 for Jumia Food. You wan create budget for food?')." },
                                actionText: { type: Type.STRING, description: "A short call-to-action for the button (e.g., 'Create Budget')." },
                                prompt: { type: Type.STRING, description: "A pre-filled prompt for the Coach chat if the user clicks the action (e.g., 'Help me create a monthly budget for food and drinks.')." }
                            }
                        }
                    }
                };

                const result = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: responseSchema,
                    }
                });

                const parsedResponse = JSON.parse(result.text) as DashboardInsightsResponse;
                setInsights(parsedResponse);

            } catch (err) {
                console.error("Failed to fetch dashboard insights:", err);
                setError("Sorry, the Coach couldn't analyze your data right now. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        if (user && wallet && transactions.length > 0) {
            fetchInsights();
        } else {
             setIsLoading(false);
        }
    }, [user, wallet, transactions, portfolio, savingsGoals, ai]);
    
    const handleNudgeClick = () => {
        if (insights?.actionableNudge?.prompt) {
            sessionStorage.setItem('coach_prompt', insights.actionableNudge.prompt);
            setActiveView('coach');
        }
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <SkeletonCard className="lg:col-span-3" />
                <SkeletonCard className="lg:col-span-2" />
                <SkeletonCard />
            </div>
        );
    }

    if (error || !insights) {
         // Gracefully hide the component if there's an error or no insights, instead of showing an error message which can cause alarm.
        return null;
    }
    
    const { cashFlowAnalysis, keyInsight, actionableNudge } = insights;

    // Defensive check to prevent crash if API response is incomplete
    if (!cashFlowAnalysis || !keyInsight || !actionableNudge) {
        return null;
    }

    const income = cashFlowAnalysis.income;
    const expenses = Math.abs(cashFlowAnalysis.expenses);
    const netFlow = cashFlowAnalysis.netFlow;
    const expensesPercentage = income > 0 ? (expenses / income) * 100 : 0;
    const cappedExpensesPercentage = Math.min(expensesPercentage, 100);

    return (
        <>
            {/* FutureSight & Key Insight Card */}
            <div className="bg-gradient-to-br from-emerald-900/50 to-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-emerald-500/30">
                <h2 className="font-semibold text-lg mb-4 text-white">{t('dashboard.futureSight.title')}</h2>
                <div className="flex items-start space-x-3 bg-gray-700/50 p-4 rounded-lg">
                    <div className="text-indigo-400 flex-shrink-0 mt-1"><PathIcon /></div>
                    <div>
                        <p className="font-semibold text-white text-sm">{keyInsight.title}</p>
                        <p className="text-xs text-gray-300 mt-1">{keyInsight.description}</p>
                        {keyInsight.reasoning && (
                            <div className="flex items-center mt-2 text-xs text-gray-400/80">
                                <svg className="w-3 h-3 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>{keyInsight.reasoning}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Cash Flow Card */}
                 <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-white/10 lg:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="font-semibold text-lg">{t('dashboard.cashFlow.title')}</h2>
                        <CashFlowIcon />
                    </div>
                    <p className={`text-4xl font-bold ${netFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {netFlow >= 0 ? '+' : ''} {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(netFlow)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 italic">"{cashFlowAnalysis.commentary}"</p>
                    <div className="mt-4 space-y-3">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium text-emerald-300">{t('dashboard.cashFlow.income')}</span>
                                <span>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(income)}</span>
                            </div>
                            <div className="w-full bg-emerald-500/20 rounded-full h-1.5">
                                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `100%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium text-rose-300">{t('dashboard.cashFlow.expenses')}</span>
                                <span>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(expenses)}</span>
                            </div>
                            <div className="w-full bg-rose-500/20 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${cappedExpensesPercentage}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coach's Nudge Card */}
                {nudgeVisible && (
                    <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-white/10 relative">
                         <button onClick={() => setNudgeVisible(false)} className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-colors" aria-label="Dismiss nudge">
                            <CloseIcon className="w-4 h-4" />
                        </button>
                        <h2 className="font-semibold text-lg mb-2">Coach's Nudges</h2>
                        <div className="flex items-start space-x-3 bg-gray-700/50 p-3 rounded-lg">
                            <div className="text-amber-400 flex-shrink-0 mt-1"><BellIcon /></div>
                            <div>
                                <p className="font-semibold text-white text-sm">{actionableNudge.title}</p>
                                <p className="text-xs text-gray-300 mt-1">{actionableNudge.description}</p>
                                <button onClick={handleNudgeClick} className="text-xs mt-3 bg-emerald-600 px-3 py-1 rounded-full hover:bg-emerald-700 transition">{actionableNudge.actionText}</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default DashboardInsights;