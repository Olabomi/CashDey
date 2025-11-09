import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useLocale } from '../contexts/LocaleContext';
import { RiceIcon, CementIcon, FuelIcon, RefreshIcon, BellIcon, TrashIcon, BellPlusIcon, CloseIcon } from './icons';
import type { Commodity, CommodityAlert } from '../types';
import Tooltip from './Tooltip';

type Trend = 'up' | 'down' | 'stable';

interface MarketMetric {
    value: string;
    trend: Trend;
}

interface MarketData {
    bagOfRice: MarketMetric;
    bagOfCement: MarketMetric;
    dieselPrice: MarketMetric;
}

interface CachedData {
    timestamp: number;
    data: MarketData;
}

const CACHE_KEY = 'naijaMarketWatchData';
const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours

const MarketDataItem: React.FC<{ icon: React.ReactNode; label: string; value: string; trend?: Trend }> = ({ icon, label, value, trend = 'stable' }) => {
    const { t } = useLocale();

    const getTrendDetails = () => {
        if (trend === 'stable') return { color: 'text-gray-400', arrow: '', title: '' };

        // For all prices, up is bad (rose), down is good (emerald)
        return trend === 'up'
            ? { color: 'text-rose-400', arrow: '↑', title: t('dashboard.tooltips.increasing') }
            : { color: 'text-emerald-400', arrow: '↓', title: t('dashboard.tooltips.decreasing') };
    };

    const { color, arrow, title } = getTrendDetails();
    
    return (
        <div className="flex items-center space-x-3 bg-gray-700/50 p-3 rounded-lg flex-1 min-w-[150px]">
            <div className="text-emerald-400">{icon}</div>
            <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-md font-bold text-white flex items-center">
                    {value}
                    {arrow && <span className={`ml-1.5 text-xs font-mono ${color}`} title={title}>{arrow}</span>}
                </p>
            </div>
        </div>
    );
};

const MarketDataSkeleton: React.FC = () => (
    <div className="flex flex-wrap gap-3 animate-pulse">
        {[...Array(3)].map((_, i) => (
             <div key={i} className="flex items-center space-x-3 bg-gray-700/50 p-3 rounded-lg flex-1 min-w-[150px]">
                <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
                <div className="w-20">
                    <div className="h-2.5 bg-gray-600 rounded-full w-16 mb-2"></div>
                    <div className="h-4 bg-gray-600 rounded-full w-20"></div>
                </div>
            </div>
        ))}
    </div>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
    <button onClick={onChange} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${checked ? 'bg-emerald-500' : 'bg-gray-600'}`}>
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

const AddAlertModal: React.FC<{ show: boolean; onClose: () => void; onAddAlert: (alert: Omit<CommodityAlert, 'id' | 'active'>) => void; }> = ({ show, onClose, onAddAlert }) => {
    const { t } = useLocale();
    const commodities: Commodity[] = useMemo(() => [
        t('dashboard.bagOfRice') as Commodity, 
        t('dashboard.bagOfCement') as Commodity, 
        t('dashboard.dieselPrice') as Commodity
    ], [t]);

    const [commodity, setCommodity] = useState<Commodity>(commodities[0]);
    const [condition, setCondition] = useState<'rises_above' | 'falls_below'>('rises_above');
    const [value, setValue] = useState('');

    const handleSetAlert = () => {
        if (!value || isNaN(Number(value))) return;
        onAddAlert({
            commodity,
            condition,
            value: Number(value),
        });
        setValue('');
        onClose();
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-white/10 rounded-2xl shadow-xl w-full max-w-sm m-4 p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">{t('dashboard.alerts.modalTitle')}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><CloseIcon className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="commodity" className="block text-sm font-medium text-gray-300">{t('dashboard.alerts.commodity')}</label>
                        <select id="commodity" value={commodity} onChange={e => setCommodity(e.target.value as Commodity)} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white">
                            {commodities.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="condition" className="block text-sm font-medium text-gray-300">{t('dashboard.alerts.condition')}</label>
                            <select id="condition" value={condition} onChange={e => setCondition(e.target.value as any)} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white">
                                <option value="rises_above">{t('dashboard.alerts.risesAbove')}</option>
                                <option value="falls_below">{t('dashboard.alerts.fallsBelow')}</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-300">{t('dashboard.alerts.price')}</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">₦</span>
                                <input id="price" type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="100,000" className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 pl-7 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 mt-6">
                        <button onClick={onClose} className="w-full bg-gray-600 text-white rounded-lg py-2 hover:bg-gray-700 transition-colors active:scale-95 transform font-semibold">{t('dashboard.alerts.cancel')}</button>
                        <button onClick={handleSetAlert} className="w-full bg-emerald-600 text-white rounded-lg py-2 hover:bg-emerald-700 transition-colors active:scale-95 transform font-semibold">{t('dashboard.alerts.setAlert')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const NaijaMarketWatch: React.FC = () => {
    const { t } = useLocale();
    const [data, setData] = useState<MarketData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);

    const [alerts, setAlerts] = useState<CommodityAlert[]>([]);
    const [showAddAlertModal, setShowAddAlertModal] = useState(false);

    const handleAddAlert = (newAlertData: Omit<CommodityAlert, 'id' | 'active'>) => {
        const newAlert: CommodityAlert = {
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

    const getAlertDescription = (alert: CommodityAlert) => {
        const conditionText = alert.condition === 'rises_above' ? t('dashboard.alerts.risesAbove') : t('dashboard.alerts.fallsBelow');
        const valueFormatted = new Intl.NumberFormat('en-NG').format(alert.value);
        return t('dashboard.alerts.alertDesc', { commodity: alert.commodity, condition: conditionText, value: valueFormatted });
    };

    const fetchMarketData = useCallback(async (forceRefresh = false) => {
        setIsLoading(true);
        setError(null);

        // Check cache first
        if (!forceRefresh) {
            const cachedItem = localStorage.getItem(CACHE_KEY);
            if (cachedItem) {
                const { timestamp, data: cachedData } = JSON.parse(cachedItem) as CachedData;
                if (Date.now() - timestamp < CACHE_DURATION) {
                    setData(cachedData);
                    setLastUpdated(new Date(timestamp));
                    setIsLoading(false);
                    return;
                }
            }
        }
        
        try {
            const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const prompt = `
            As CashDey Coach, provide the most up-to-date Nigerian market data for common goods as of today, ${today}.
            Your response MUST be a single JSON object wrapped in a markdown code block (\`\`\`json ... \`\`\`).
            Do not include any text outside this block.

            The JSON object must have this exact structure:
            {
              "bagOfRice": { "value": "<e.g., '₦115,000'>", "trend": "<'up', 'down', or 'stable'>" },
              "bagOfCement": { "value": "<e.g., '₦15,000'>", "trend": "<'up', 'down', or 'stable'>" },
              "dieselPrice": { "value": "<e.g., '₦1,450'>", "trend": "<'up', 'down', or 'stable'>" }
            }

            RULES:
            1.  **Source Reliability**: For each metric, find a recent, verifiable price. National averages are acceptable.
            2.  **Bag of Rice**: The 'value' MUST be a string with the Naira symbol for a 50kg bag.
            3.  **Bag of Cement**: The 'value' MUST be a string with the Naira symbol for a 50kg bag.
            4.  **Diesel Price**: The 'value' MUST be a string with the Naira symbol for one litre.
            5.  **Trend**: The 'trend' MUST be one of 'up', 'down', or 'stable' compared to the previous week.
            6.  **No Extra Text**: Values must not contain ranges or extra descriptions.
            `;
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                }
            });

            const responseText = response.text.trim();
            const match = responseText.match(/```json\s*([\s\S]*?)\s*```/);
            let marketData: MarketData;

            if (match && match[1]) {
                marketData = JSON.parse(match[1]) as MarketData;
            } else {
                 try {
                    marketData = JSON.parse(responseText) as MarketData;
                 } catch (e) {
                    throw new Error("Failed to parse JSON response from API.");
                 }
            }
            
            const now = new Date();
            setData(marketData);
            setLastUpdated(now);
            localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: now.getTime(), data: marketData }));

        } catch (err) {
            console.error("Failed to fetch market data:", err);
            setError("Could not fetch market data. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, [ai]);

    useEffect(() => {
        fetchMarketData();
    }, [fetchMarketData]);

    const handleRefresh = () => {
        fetchMarketData(true);
    };
    
    const renderContent = () => {
        if (isLoading) {
            return <MarketDataSkeleton />;
        }
        if (error) {
            return <p className="text-rose-400 text-sm">{error}</p>;
        }
        if (data) {
             return (
                <div className="flex flex-wrap gap-3">
                    <MarketDataItem icon={<RiceIcon />} label={t('dashboard.bagOfRice')} value={data.bagOfRice.value} trend={data.bagOfRice.trend} />
                    <MarketDataItem icon={<CementIcon />} label={t('dashboard.bagOfCement')} value={data.bagOfCement.value} trend={data.bagOfCement.trend} />
                    <MarketDataItem icon={<FuelIcon />} label={t('dashboard.dieselPrice')} value={data.dieselPrice.value} trend={data.dieselPrice.trend} />
                </div>
             );
        }
        return null;
    };

    return (
        <>
        <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg text-white">{t('dashboard.marketWatchTitle')}</h2>
                <div className="flex items-center space-x-2">
                    {lastUpdated && !isLoading && (
                        <Tooltip text={t('tooltips.lastUpdatedInfo')}>
                          <p className="text-xs text-gray-400">
                              {t('dashboard.lastUpdated', { time: lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })}
                          </p>
                        </Tooltip>
                    )}
                    <Tooltip text={t('tooltips.refreshData')}>
                      <button onClick={handleRefresh} aria-label={t('dashboard.refreshAriaLabel')} disabled={isLoading} className="text-gray-400 hover:text-white transition-colors disabled:opacity-50">
                          <RefreshIcon className={isLoading ? 'animate-spin' : ''} />
                      </button>
                    </Tooltip>
                </div>
            </div>
            {renderContent()}

            <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">{t('dashboard.alerts.title')}</h3>
                    <button onClick={() => setShowAddAlertModal(true)} className="flex items-center space-x-2 text-xs font-semibold bg-emerald-600/50 text-white px-2.5 py-1 rounded-md hover:bg-emerald-600/70 transition-colors active:scale-95 transform">
                        <BellPlusIcon />
                        <span>{t('dashboard.alerts.add')}</span>
                    </button>
                </div>
                {alerts.length === 0 ? (
                    <div className="text-center text-gray-400 py-4 text-sm">
                        <p>{t('dashboard.alerts.noAlerts')}</p>
                        <p className="text-xs">{t('dashboard.alerts.noAlertsDesc')}</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {alerts.map(alert => (
                            <div key={alert.id} className={`flex items-center p-2 rounded-md ${alert.active ? 'bg-gray-700/60' : 'bg-gray-700/30'}`}>
                                <BellIcon />
                                <p className={`flex-grow mx-3 text-sm ${alert.active ? 'text-white' : 'text-gray-400 line-through'}`}>{getAlertDescription(alert)}</p>
                                <div className="flex items-center space-x-3">
                                    <ToggleSwitch checked={alert.active} onChange={() => handleToggleAlert(alert.id)} />
                                    <button onClick={() => handleDeleteAlert(alert.id)} className="text-gray-500 hover:text-rose-400 transition-colors"><TrashIcon /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
        <AddAlertModal show={showAddAlertModal} onClose={() => setShowAddAlertModal(false)} onAddAlert={handleAddAlert} />
        </>
    );
};

export default NaijaMarketWatch;