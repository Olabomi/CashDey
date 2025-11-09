import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { useLocale } from '../contexts/LocaleContext';
import { UsdIcon, EurIcon, BankIcon, RefreshIcon } from './icons';

type Trend = 'up' | 'down' | 'stable';

interface Rate {
    value: number;
    trend: Trend;
}

interface RatesData {
    usd: Rate;
    eur: Rate;
    mpr: Rate;
}

interface CachedData {
    timestamp: number;
    data: RatesData;
}

const CACHE_KEY = 'realTimeRatesData';
const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours

const RateCard: React.FC<{ icon: React.ReactNode; label: string; value: string; trend: Trend; }> = ({ icon, label, value, trend }) => {
    const trendIcon = { up: '↑', down: '↓', stable: '' }[trend];
    const trendColor = { up: 'text-rose-400', down: 'text-emerald-400', stable: 'text-gray-400' }[trend];

    return (
        <div className="flex items-center space-x-3 bg-gray-700/50 p-3 rounded-lg flex-1 min-w-[150px] transition-all duration-300">
            <div className="text-emerald-400">{icon}</div>
            <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-lg font-bold text-white flex items-center">
                    {value}
                    {trendIcon && <span className={`ml-2 text-sm ${trendColor}`}>{trendIcon}</span>}
                </p>
            </div>
        </div>
    );
};

const RatesSkeleton: React.FC = () => (
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


const RealTimeRates: React.FC = () => {
    const { t } = useLocale();
    const [rates, setRates] = useState<RatesData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    // FIX: Use environment variable for API key.
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);

    const fetchRates = useCallback(async (forceRefresh = false) => {
        setIsLoading(true);
        setError(null);

        if (!forceRefresh) {
            const cachedItem = localStorage.getItem(CACHE_KEY);
            if (cachedItem) {
                const { timestamp, data: cachedData } = JSON.parse(cachedItem) as CachedData;
                if (Date.now() - timestamp < CACHE_DURATION) {
                    setRates(cachedData);
                    setLastUpdated(new Date(timestamp));
                    setIsLoading(false);
                    return;
                }
            }
        }
        
        try {
            const prompt = `
            As CashDey Coach, provide the most up-to-date Nigerian financial rates. Your response must be a single JSON object wrapped in a markdown code block (\`\`\`json ... \`\`\`).

            RULES:
            1.  **USD Rate**: Provide the current parallel market (e.g., AbokiFX) USD to NGN exchange rate. The 'value' MUST be a number.
            2.  **EUR Rate**: Provide the current parallel market EUR to NGN exchange rate. The 'value' MUST be a number.
            3.  **MPR**: Provide the current Monetary Policy Rate (MPR) from the Central Bank of Nigeria (CBN). The 'value' MUST be a number representing the percentage.
            4.  **Trend**: For each rate, indicate if the value is trending 'up', 'down', or is 'stable' compared to the previous day.
            5.  **Structure**: The response must be a JSON object with this exact structure: { "usd": { "value": <number>, "trend": "<'up'|'down'|'stable'>" }, "eur": { "value": <number>, "trend": "<'up'|'down'|'stable'>" }, "mpr": { "value": <number>, "trend": "<'up'|'down'|'stable'>" } }.
            `;
            
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                }
            });

            const match = result.text.match(/```json\s*([\s\S]*?)\s*```/);
            if (!match || !match[1]) throw new Error("Invalid JSON format from API");

            const ratesData = JSON.parse(match[1]) as RatesData;
            const now = new Date();
            setRates(ratesData);
            setLastUpdated(now);
            localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: now.getTime(), data: ratesData }));

        } catch (err) {
            console.error("Failed to fetch real-time rates:", err);
            setError("Could not fetch rates. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [ai]);

    useEffect(() => {
        fetchRates();
    }, [fetchRates]);

    const handleRefresh = () => {
        fetchRates(true);
    };

    return (
        <div className="bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm border border-white/10">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-md font-semibold text-white">{t('marketNewsScreen.realTimeRates.title')}</h2>
                 <div className="flex items-center space-x-2">
                    {lastUpdated && !isLoading && (
                        <p className="text-xs text-gray-400" title="Market data is refreshed every 4 hours.">
                            {t('marketNewsScreen.realTimeRates.lastUpdated', { time: lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })}
                        </p>
                    )}
                    <button onClick={handleRefresh} disabled={isLoading} className="text-gray-400 hover:text-white transition-colors disabled:opacity-50">
                        <RefreshIcon className={isLoading ? 'animate-spin' : ''} />
                    </button>
                 </div>
            </div>
            {isLoading ? (
                <RatesSkeleton />
            ) : error ? (
                <p className="text-rose-400 text-sm">{error}</p>
            ) : rates && (
                <div className="flex flex-wrap gap-3">
                    <RateCard 
                        icon={<UsdIcon />} 
                        label={t('marketNewsScreen.realTimeRates.usd')} 
                        value={`₦${rates.usd.value.toFixed(2)}`} 
                        trend={rates.usd.trend}
                    />
                    <RateCard 
                        icon={<EurIcon />} 
                        label={t('marketNewsScreen.realTimeRates.eur')} 
                        value={`₦${rates.eur.value.toFixed(2)}`} 
                        trend={rates.eur.trend}
                    />
                    <RateCard 
                        icon={<BankIcon />} 
                        label={t('marketNewsScreen.realTimeRates.mpr')} 
                        value={`${rates.mpr.value.toFixed(2)}%`} 
                        trend={rates.mpr.trend}
                    />
                </div>
            )}
        </div>
    );
};

export default RealTimeRates;