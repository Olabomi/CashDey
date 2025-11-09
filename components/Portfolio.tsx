import React from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useData } from '../contexts/DataContext';
import { InfoIcon } from './icons';
import Tooltip from './Tooltip';

const InfoTooltip: React.FC<{ text: string }> = ({ text }) => (
    <Tooltip text={text}>
        <InfoIcon />
    </Tooltip>
);

const AssetCard: React.FC<{ assetClass: string; value: number; change: number; color: string; tooltipText?: string; children: React.ReactNode }> = ({ assetClass, value, change, color, tooltipText, children }) => {
    const isPositive = change >= 0;
    return (
        <div className={`p-6 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-white/10`}>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <span>{assetClass}</span>
                    {tooltipText && <InfoTooltip text={tooltipText} />}
                </h3>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${isPositive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                    {isPositive ? '+' : ''}{change.toFixed(2)}%
                </span>
            </div>
            <p className={`text-3xl font-bold my-2 ${color}`}>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value)}</p>
            <div className="space-y-3 mt-4">
                {children}
            </div>
        </div>
    );
};

const AssetItem: React.FC<{ name: string; value: number; units: string }> = ({ name, value, units }) => (
    <div className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-white/5">
        <div>
            <p className="font-medium text-white">{name}</p>
            <p className="text-xs text-gray-400">{units}</p>
        </div>
        <p className="font-semibold text-white">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value)}</p>
    </div>
);


const Portfolio: React.FC = () => {
    const { t } = useLocale();
    const { portfolio } = useData();

    if (!portfolio) {
        return <div className="text-center text-gray-400">Loading portfolio...</div>;
    }

    const { totalValue, totalChange, assets } = portfolio;
    const isTotalPositive = totalChange >= 0;

    return (
        <div className="animate-fade-in-up space-y-8 pb-8">
            <div>
                <p className="text-lg font-medium text-gray-300">{t('portfolio.totalValue')}</p>
                <div className="flex items-baseline space-x-3">
                    <h1 className="text-5xl font-bold text-white">
                        {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(totalValue)}
                    </h1>
                    <span className={`text-xl font-bold ${isTotalPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isTotalPositive ? '↑' : '↓'} {totalChange.toFixed(2)}%
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AssetCard 
                    assetClass={t('portfolio.stocks')} 
                    value={assets.stocks.totalValue} 
                    change={assets.stocks.change} 
                    color="text-blue-400"
                    tooltipText={t('portfolio.tooltipStocks')}
                >
                    {assets.stocks.holdings.map(h => <AssetItem key={h.ticker} name={h.name} value={h.value} units={`${h.shares} Shares`} />)}
                </AssetCard>

                <AssetCard 
                    assetClass={t('portfolio.crypto')} 
                    value={assets.crypto.totalValue} 
                    change={assets.crypto.change} 
                    color="text-amber-400"
                    tooltipText={t('portfolio.tooltipCrypto')}
                >
                    {assets.crypto.holdings.map(h => <AssetItem key={h.ticker} name={h.name} value={h.value} units={`${h.amount} ${h.ticker}`} />)}
                </AssetCard>
                
                <AssetCard 
                    assetClass={t('portfolio.mutualFunds')} 
                    value={assets.mutualFunds.totalValue} 
                    change={assets.mutualFunds.change} 
                    color="text-indigo-400"
                    tooltipText={t('portfolio.tooltipMutualFunds')}
                >
                     {assets.mutualFunds.holdings.map(h => <AssetItem key={h.name} name={h.name} value={h.value} units={`${h.units} Units`} />)}
                </AssetCard>

                 <div className="p-6 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-white/10 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border-2 border-emerald-500/30 mb-4">
                        <span className="text-3xl font-bold text-emerald-400">+</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">{t('portfolio.addNew')}</h3>
                    <p className="text-sm text-gray-400 mt-1">{t('portfolio.addNewDesc')}</p>
                    <button className="mt-4 w-full text-sm bg-emerald-600/80 text-white rounded-lg py-2 hover:bg-emerald-600 transition-colors active:scale-95 transform font-semibold">
                        {t('portfolio.investNow')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Portfolio;