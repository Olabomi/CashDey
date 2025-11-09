import { GoogleGenAI, Type } from "@google/genai";
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { BellIcon, TrashIcon, BellPlusIcon } from "./icons";
import RealTimeRates from "./RealTimeRates";

// --- Types ---
// FIX: Corrected the `Source` type to match the object structure stored in state, which is the `web` object from grounding chunks.
type Source = { uri: string; title: string };
type Trend = 'up' | 'down' | 'stable';
type Sentiment = 'Positive' | 'Negative' | 'Neutral';

interface MarketNewsResponse {
    headline: string;
    gist: string;
    keyNumbers: { label: string; value: string; trend: Trend }[];
    sentiment: Sentiment;
    implications: string;
    summary: string;
}

interface Alert {
  id: number;
  type: 'price' | 'keyword';
  target: string;
  condition?: 'rises_above' | 'falls_below';
  value?: number;
  active: boolean;
}

const initialAlerts: Alert[] = [
    { id: 1, type: 'price', target: 'MTNN', condition: 'rises_above', value: 250, active: true },
    { id: 2, type: 'keyword', target: 'inflation', active: true },
    { id: 3, type: 'price', target: 'GTCO', condition: 'falls_below', value: 35, active: false },
];

// --- Sub-components ---

const SentimentBadge: React.FC<{ sentiment: Sentiment }> = ({ sentiment }) => {
    const details = {
        Positive: { text: 'Positive', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: '↑' },
        Negative: { text: 'Negative', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30', icon: '↓' },
        Neutral: { text: 'Neutral', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', icon: '→' },
    }[sentiment];

    return (
        <div className={`flex items-center space-x-2 text-sm font-semibold px-3 py-1 rounded-full border ${details.color}`}>
            <span>{details.icon}</span>
            <span>{details.text}</span>
        </div>
    );
};

const KeyNumberCard: React.FC<{ label: string; value: string; trend: Trend }> = ({ label, value, trend }) => {
    const trendIcon = { up: '↑', down: '↓', stable: '' }[trend];
    const trendColor = { up: 'text-emerald-400', down: 'text-rose-400', stable: 'text-gray-400' }[trend];
    
    return (
        <div className="bg-gray-700/60 p-3 rounded-lg flex-1 min-w-[120px]">
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-lg font-bold text-white flex items-center">
                {value}
                {trendIcon && <span className={`ml-2 text-sm ${trendColor}`}>{trendIcon}</span>}
            </p>
        </div>
    );
};

const SkeletonLoader: React.FC = () => (
    <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="flex flex-wrap gap-3">
            <div className="h-16 bg-gray-700 rounded-lg flex-1"></div>
            <div className="h-16 bg-gray-700 rounded-lg flex-1"></div>
            <div className="h-16 bg-gray-700 rounded-lg flex-1"></div>
        </div>
        <div className="h-20 bg-gray-700 rounded-lg"></div>
        <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
    </div>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
    <button onClick={onChange} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${checked ? 'bg-emerald-500' : 'bg-gray-600'}`}>
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

const AddAlertModal: React.FC<{ show: boolean; onClose: () => void; onAddAlert: (alert: Omit<Alert, 'id' | 'active'>) => void; }> = ({ show, onClose, onAddAlert }) => {
    const { t } = useLocale();
    const [alertType, setAlertType] = useState<'price' | 'keyword'>('price');
    const [target, setTarget] = useState('');
    const [condition, setCondition] = useState<'rises_above' | 'falls_below'>('rises_above');
    const [value, setValue] = useState('');

    const handleSetAlert = () => {
        if (!target.trim()) return;
        if (alertType === 'price' && (!value || isNaN(Number(value)))) return;

        onAddAlert({
            type: alertType,
            target: target.toUpperCase(),
            ...(alertType === 'price' && { condition, value: Number(value) }),
        });
        // Reset form and close
        setTarget('');
        setValue('');
        setAlertType('price');
        onClose();
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-white/10 rounded-2xl shadow-xl w-full max-w-sm m-4 p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-4">{t('marketNewsScreen.modalTitle')}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">{t('marketNewsScreen.alertType')}</label>
                        <div className="flex space-x-2">
                            <button onClick={() => setAlertType('price')} className={`flex-1 py-2 text-sm rounded-md transition-colors ${alertType === 'price' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{t('marketNewsScreen.priceAlertType')}</button>
                            <button onClick={() => setAlertType('keyword')} className={`flex-1 py-2 text-sm rounded-md transition-colors ${alertType === 'keyword' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{t('marketNewsScreen.keywordAlertType')}</button>
                        </div>
                    </div>

                    {alertType === 'price' ? (
                        <>
                            <div>
                                <label htmlFor="stock-ticker" className="block text-sm font-medium text-gray-300">{t('marketNewsScreen.stockTicker')}</label>
                                <input id="stock-ticker" type="text" value={target} onChange={e => setTarget(e.target.value)} placeholder={t('marketNewsScreen.stockTickerPlaceholder')} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="condition" className="block text-sm font-medium text-gray-300">{t('marketNewsScreen.condition')}</label>
                                    <select id="condition" value={condition} onChange={e => setCondition(e.target.value as any)} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white">
                                        <option value="rises_above">{t('marketNewsScreen.risesAbove')}</option>
                                        <option value="falls_below">{t('marketNewsScreen.fallsBelow')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-300">{t('marketNewsScreen.price')}</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">₦</span>
                                        <input id="price" type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="250.00" className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 pl-7 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white" />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div>
                            <label htmlFor="keyword" className="block text-sm font-medium text-gray-300">{t('marketNewsScreen.keyword')}</label>
                            <input id="keyword" type="text" value={target} onChange={e => setTarget(e.target.value)} placeholder={t('marketNewsScreen.keywordPlaceholder')} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white" />
                        </div>
                    )}
                    
                    <div className="flex items-center space-x-3 mt-6">
                        <button onClick={onClose} className="w-full bg-gray-600 text-white rounded-lg py-2 hover:bg-gray-700 transition-colors active:scale-95 transform font-semibold">{t('marketNewsScreen.cancel')}</button>
                        <button onClick={handleSetAlert} className="w-full bg-emerald-600 text-white rounded-lg py-2 hover:bg-emerald-700 transition-colors active:scale-95 transform font-semibold">{t('marketNewsScreen.setAlert')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const MarketNews: React.FC = () => {
    const { t } = useLocale();
    const [news, setNews] = useState<MarketNewsResponse | null>(null);
    const [sources, setSources] = useState<Source[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // FIX: Use environment variable for API key.
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);
    const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
    const [showAddAlertModal, setShowAddAlertModal] = useState(false);

    const fetchNews = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const prompt = `
        As CashDey Coach, analyze the latest Nigerian financial news for today. 
        Focus on one major story relevant to a typical Nigerian (e.g., inflation, exchange rates, major policy changes, key stock market movements).
        Your response MUST be a single JSON object. Do not include markdown backticks.

        JSON Structure:
        {
            "headline": "<string: A compelling, concise headline>",
            "gist": "<string: A one-sentence summary in simple Nigerian English>",
            "keyNumbers": [
                { "label": "<string>", "value": "<string>", "trend": "<'up'|'down'|'stable'>" }
            ],
            "sentiment": "<'Positive'|'Negative'|'Neutral'>",
            "implications": "<string: Explain what this news means for a regular person's money in 1-2 sentences. Be practical and empathetic.>",
            "summary": "<string: A detailed but easy-to-understand summary of the news, around 3-4 sentences long.>"
        }
        `;

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                }
            });

            const responseText = response.text.trim();
            const jsonString = responseText.replace(/^```json\s*|\s*```$/g, '');
            
            const marketNews = JSON.parse(jsonString) as MarketNewsResponse;
            setNews(marketNews);

            const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
            if (groundingMetadata?.groundingChunks) {
                // FIX: Filter out grounding chunks that are missing a URI and ensure the mapped object matches the `Source` type.
                const webSources: Source[] = groundingMetadata.groundingChunks
                    .filter(chunk => chunk.web && chunk.web.uri)
                    .map(chunk => ({
                        uri: chunk.web!.uri!,
                        title: chunk.web!.title || new URL(chunk.web!.uri!).hostname,
                    }));
                setSources(webSources);
            }

        } catch (err) {
            console.error("Failed to fetch market news:", err);
            setError("Sorry, the Coach couldn't get the latest news. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, [ai]);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    const handleAddAlert = (newAlertData: Omit<Alert, 'id' | 'active'>) => {
        const newAlert: Alert = {
            id: Date.now(),
            ...newAlertData,
            active: true,
        };
        setAlerts(prev => [newAlert, ...prev]);
    };

    const handleToggleAlert = (id: number) => {
        setAlerts(alerts.map(a => a.id === id ? { ...a, active: !a.active } : a));
    };

    const handleDeleteAlert = (id: number) => {
        setAlerts(alerts.filter(a => a.id !== id));
    };

    return (
        <div className="animate-fade-in-up space-y-6 pb-8">
            <RealTimeRates />
    
            <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-white/10">
                {isLoading ? (
                    <SkeletonLoader />
                ) : error ? (
                    <p className="text-center text-rose-400">{error}</p>
                ) : news && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <h1 className="text-2xl font-bold text-white">{news.headline}</h1>
                            <SentimentBadge sentiment={news.sentiment} />
                        </div>
                        <p className="text-md text-gray-300 italic">"{news.gist}"</p>
                        <div className="flex flex-wrap gap-3">
                            {news.keyNumbers.map((kn, i) => <KeyNumberCard key={i} {...kn} />)}
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-white mb-2">What This Means For You</h3>
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{news.implications}</p>
                        </div>
                         <div>
                            <h3 className="font-semibold text-lg text-white mb-2">Full Summary</h3>
                            <p className="text-sm text-gray-400 whitespace-pre-wrap">{news.summary}</p>
                        </div>
                        {sources.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-2">Sources:</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    {sources.map((source, i) => (
                                        <li key={i} className="text-xs">
                                            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
                                                {source.title || new URL(source.uri).hostname}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
    
            <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-white/10">
                 <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">{t('marketNewsScreen.alertsTitle')}</h3>
                    <button onClick={() => setShowAddAlertModal(true)} className="flex items-center space-x-2 text-xs font-semibold bg-emerald-600/50 text-white px-2.5 py-1 rounded-md hover:bg-emerald-600/70 transition-colors active:scale-95 transform">
                        <BellPlusIcon />
                        <span>{t('marketNewsScreen.addAlert')}</span>
                    </button>
                </div>
                {alerts.length === 0 ? (
                    <div className="text-center text-gray-400 py-4 text-sm">
                        <p>{t('marketNewsScreen.noAlerts')}</p>
                        <p className="text-xs">{t('marketNewsScreen.noAlertsDesc')}</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {alerts.map(alert => (
                            <div key={alert.id} className={`flex items-center p-2 rounded-md ${alert.active ? 'bg-gray-700/60' : 'bg-gray-700/30'}`}>
                                <BellIcon />
                                <p className={`flex-grow mx-3 text-sm ${alert.active ? 'text-white' : 'text-gray-400 line-through'}`}>
                                    {alert.type === 'price'
                                        ? t('marketNewsScreen.alertDescPrice', { target: alert.target, condition: alert.condition === 'rises_above' ? t('marketNewsScreen.risesAbove') : t('marketNewsScreen.fallsBelow'), value: alert.value })
                                        : t('marketNewsScreen.alertDescKeyword', { target: alert.target })
                                    }
                                </p>
                                <div className="flex items-center space-x-3">
                                    <ToggleSwitch checked={alert.active} onChange={() => handleToggleAlert(alert.id)} />
                                    <button onClick={() => handleDeleteAlert(alert.id)} className="text-gray-500 hover:text-rose-400 transition-colors"><TrashIcon /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <AddAlertModal show={showAddAlertModal} onClose={() => setShowAddAlertModal(false)} onAddAlert={handleAddAlert} />
        </div>
    );
};