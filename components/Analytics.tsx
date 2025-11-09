import React, { useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import Tooltip from './Tooltip';

const Card: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-white/10 ${className}`}>
        <h2 className="font-semibold text-lg mb-4 text-white">{title}</h2>
        {children}
    </div>
);

const HealthScoreBreakdown: React.FC = () => (
    <div className="mt-6 space-y-3 text-sm">
        <h3 className="font-semibold text-center text-gray-300">How your score is calculated:</h3>
        <div className="p-3 bg-gray-700/50 rounded-lg">
            <div className="flex justify-between mb-1"><span className="text-gray-300">Savings & Investments</span><span className="font-medium text-white">40%</span></div>
            <div className="w-full bg-gray-600 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{width: '85%'}}></div></div>
        </div>
        <div className="p-3 bg-gray-700/50 rounded-lg">
            <div className="flex justify-between mb-1"><span className="text-gray-300">Debt Management</span><span className="font-medium text-white">30%</span></div>
            <div className="w-full bg-gray-600 rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full" style={{width: '60%'}}></div></div>
        </div>
        <div className="p-3 bg-gray-700/50 rounded-lg">
            <div className="flex justify-between mb-1"><span className="text-gray-300">Spending Habits</span><span className="font-medium text-white">30%</span></div>
            <div className="w-full bg-gray-600 rounded-full h-2"><div className="bg-rose-500 h-2 rounded-full" style={{width: '70%'}}></div></div>
        </div>
    </div>
);

const FinancialHealthScore: React.FC<{ score: number }> = ({ score }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getColor = () => {
        if (score > 66) return 'text-emerald-400';
        if (score > 33) return 'text-amber-400';
        return 'text-rose-500';
    }
    
    const getLabel = () => {
        if (score > 66) return 'Excellent';
        if (score > 33) return 'Good';
        return 'Needs Attention';
    }

    return (
        <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation={3.5} result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <circle
                        className="text-gray-700"
                        strokeWidth={10}
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx={70}
                        cy={70}
                    />
                    <circle
                        className={`transform -rotate-90 origin-center ${getColor()}`}
                        strokeWidth={10}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx={70}
                        cy={70}
                        style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                        filter="url(#glow)"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold ${getColor()}`}>{score}</span>
                    <span className="text-xs font-medium text-gray-400">Health Score</span>
                    <span className="text-sm font-medium text-gray-200 mt-1">{getLabel()}</span>
                </div>
            </div>
            <p className="text-center text-sm text-gray-400 max-w-xs">
                Your score is better than 60% of users. Keep up the great work!
            </p>
        </div>
    );
};


const spendingData = [
    { category: 'Food & Groceries', value: 45, color: 'bg-blue-500', cssColor: '#3b82f6' },
    { category: 'Transport', value: 20, color: 'bg-amber-500', cssColor: '#f59e0b' },
    { category: 'Bills & Utilities', value: 15, color: 'bg-rose-500', cssColor: '#f43f5e' },
    { category: 'Black Tax', value: 10, color: 'bg-indigo-500', cssColor: '#6366f1' },
    { category: 'Other', value: 10, color: 'bg-gray-500', cssColor: '#6b7280' },
];

const DonutSegment: React.FC<{
    radius: number;
    strokeWidth: number;
    angle: number;
    startAngle: number;
    color: string;
    isHovered: boolean;
}> = ({ radius, strokeWidth, angle, startAngle, color, isHovered }) => {
    const r = radius - strokeWidth / 2;
    const startX = radius + r * Math.cos(startAngle);
    const startY = radius + r * Math.sin(startAngle);
    const endX = radius + r * Math.cos(startAngle + angle);
    const endY = radius + r * Math.sin(startAngle + angle);
    const largeArcFlag = angle > Math.PI ? 1 : 0;
    const pathData = `M ${startX} ${startY} A ${r} ${r} 0 ${largeArcFlag} 1 ${endX} ${endY}`;

    return (
        <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth={isHovered ? strokeWidth * 1.3 : strokeWidth}
            strokeLinecap="round"
            style={{ transition: 'all 0.2s ease-out' }}
        />
    );
};

const SpendingDonutChart: React.FC = () => {
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
    const size = 160;
    const radius = size / 2;
    const strokeWidth = 20;
    let startAngle = -Math.PI / 2;
    const totalSpent = "₦142,300";

    return (
        <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
                    <circle cx={radius} cy={radius} r={radius - strokeWidth / 2} fill="none" stroke="#4a5568" strokeWidth={strokeWidth} />
                    {spendingData.map(item => {
                        const angle = (item.value / 100) * 2 * Math.PI;
                        const segment = (
                            <DonutSegment
                                key={item.category}
                                radius={radius}
                                strokeWidth={strokeWidth}
                                angle={angle}
                                startAngle={startAngle}
                                color={item.cssColor}
                                isHovered={hoveredCategory === item.category}
                            />
                        );
                        startAngle += angle;
                        return segment;
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-bold text-white">{totalSpent}</span>
                    <span className="text-xs text-gray-400">Spent This Month</span>
                </div>
            </div>
            <ul className="space-y-2 text-sm w-full">
                {spendingData.map(item => (
                    <li
                        key={item.category}
                        className={`flex items-center justify-between p-2 rounded-md transition-all ${hoveredCategory === item.category ? 'bg-white/10' : ''}`}
                        onMouseEnter={() => setHoveredCategory(item.category)}
                        onMouseLeave={() => setHoveredCategory(null)}
                    >
                        <div className="flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-3 ${item.color}`}></span>
                            <span className="text-gray-300">{item.category}</span>
                        </div>
                        <span className="font-semibold text-white">{item.value}%</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

const monthlyTrendsData = [
    { month: 'Apr', income: 250, spending: 180 },
    { month: 'May', income: 260, spending: 210 },
    { month: 'Jun', income: 240, spending: 190 },
    { month: 'Jul', income: 280, spending: 220 },
];

const MonthlyTrendsChart: React.FC = () => {
    const [tooltip, setTooltip] = useState<{ visible: boolean; content: string; x: number; y: number } | null>(null);
    const maxVal = Math.max(...monthlyTrendsData.flatMap(d => [d.income, d.spending])) * 1.1; // Add padding
    const chartHeight = 256;
    const chartWidth = 500; // arbitrary width for calculations
    const barGroupWidth = chartWidth / monthlyTrendsData.length;
    const barWidth = barGroupWidth / 4;

    const handleMouseOver = (e: React.MouseEvent, data: typeof monthlyTrendsData[0]) => {
        setTooltip({
            visible: true,
            content: `<strong>${data.month}</strong><br/>Income: ₦${data.income}k<br/>Spending: ₦${data.spending}k`,
            x: e.clientX,
            y: e.clientY
        });
    };

    const handleMouseOut = () => {
        setTooltip(null);
    };

    return (
        <div className="relative">
            {tooltip?.visible && (
                <div
                    className="absolute z-10 p-2 text-xs text-white bg-gray-900 border border-gray-600 rounded-md shadow-lg pointer-events-none"
                    style={{ top: tooltip.y - 80, left: tooltip.x - 40 }}
                    dangerouslySetInnerHTML={{ __html: tooltip.content }}
                />
            )}
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-64" aria-label="Monthly income and spending trends" xmlns="http://www.w3.org/2000/svg">
                {/* Grid Lines */}
                {[...Array(5)].map((_, i) => (
                    <line
                        key={i}
                        x1={0}
                        y1={(chartHeight / 5) * i}
                        x2={chartWidth}
                        y2={(chartHeight / 5) * i}
                        stroke="#4a5568"
                        strokeWidth={1}
                        strokeDasharray="2 2"
                    />
                ))}
                {monthlyTrendsData.map((data, index) => {
                    const incomeHeight = (data.income / maxVal) * chartHeight;
                    const spendingHeight = (data.spending / maxVal) * chartHeight;
                    const xIncome = barGroupWidth * index + barGroupWidth / 4 - barWidth / 2;
                    const xSpending = barGroupWidth * index + barGroupWidth * (3 / 4) - barWidth / 2;

                    return (
                        <g key={data.month} onMouseOver={(e) => handleMouseOver(e, data)} onMouseOut={handleMouseOut}>
                             {/* Transparent hover area */}
                             <rect x={barGroupWidth * index} y="0" width={barGroupWidth} height={chartHeight} fill="transparent" />
                            {/* Income Bar */}
                            <rect
                                x={xIncome}
                                y={chartHeight - incomeHeight}
                                width={barWidth}
                                height={incomeHeight}
                                fill="#10b981"
                                rx={2}
                                className="origin-bottom transition-transform duration-500 ease-out animate-grow"
                            />
                            {/* Spending Bar */}
                            <rect
                                x={xSpending}
                                y={chartHeight - spendingHeight}
                                width={barWidth}
                                height={spendingHeight}
                                fill="#f43f5e"
                                rx={2}
                                className="origin-bottom transition-transform duration-500 ease-out animate-grow"
                                style={{animationDelay: '100ms'}}
                            />
                             <text x={barGroupWidth * index + barGroupWidth / 2} y={chartHeight - 5} textAnchor="middle" fill="#9ca3af" fontSize={12}>
                                {data.month}
                            </text>
                        </g>
                    );
                })}
            </svg>
            <style>{`
                @keyframes grow {
                    from { transform: scaleY(0); }
                    to { transform: scaleY(1); }
                }
                .animate-grow { animation: grow 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

const Analytics: React.FC = () => {
  const { t } = useLocale();

  return (
    <div className="animate-fade-in-up space-y-6 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        <Card title={t('analytics.healthScoreTitle')} className="lg:col-span-2">
            <Tooltip text={t('tooltips.healthScore')} position="bottom">
              <div><FinancialHealthScore score={72} /></div>
            </Tooltip>
            <HealthScoreBreakdown />
        </Card>
        
        <Card title={t('analytics.spendingBreakdownTitle')} className="lg:col-span-3">
          <Tooltip text={t('tooltips.spendingBreakdown')} position="bottom">
            <div><SpendingDonutChart /></div>
          </Tooltip>
        </Card>

        <Card title={t('analytics.monthlyTrendsTitle')} className="lg:col-span-5">
            <div className="flex items-center justify-center gap-6 mb-4 text-sm">
                <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-2 bg-emerald-500"></span> Income</div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-2 bg-rose-500"></span> Spending</div>
            </div>
            <Tooltip text={t('tooltips.monthlyTrends')} position="bottom">
              <div><MonthlyTrendsChart /></div>
            </Tooltip>
        </Card>

        <div className="lg:col-span-5">
             <button className="w-full text-center bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/40 transition p-4 rounded-xl font-semibold flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>Download Statement (PDF)</span>
            </button>
        </div>

      </div>
    </div>
  );
};

export default Analytics;