"use client"

import React, { useState } from 'react';

type TimeFrame = 'monthly' | 'yearly';

interface CostDataType {
  withAutoRouter: number;
  withoutAutoRouter: number;
  savings: number;
  tokensProcessed: string;
}

const SavingsVisualizer = () => {
  const [activeTab, setActiveTab] = useState<TimeFrame>('monthly');

  const costData: Record<TimeFrame, CostDataType> = {
    monthly: {
      withAutoRouter: 285,
      withoutAutoRouter: 950,
      savings: 665,
      tokensProcessed: '450M',
    },
    yearly: {
      withAutoRouter: 3420,
      withoutAutoRouter: 11400,
      savings: 7980,
      tokensProcessed: '5.4B',
    }
  };

  const selectedData = costData[activeTab];
  const savingsPercentage = Math.round((selectedData.savings / selectedData.withoutAutoRouter) * 100);

  return (
    <div className="w-full max-w-xl mx-auto bg-black rounded-2xl border border-[#232323] shadow-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex justify-center gap-2 pt-6 pb-2">
        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-4 py-1 rounded-full text-sm font-semibold transition-all ${activeTab === 'monthly'
            ? 'bg-green-500 text-white'
            : 'bg-[#232323] text-gray-300 hover:bg-green-600 hover:text-white'
            }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setActiveTab('yearly')}
          className={`px-4 py-1 rounded-full text-sm font-semibold transition-all ${activeTab === 'yearly'
            ? 'bg-green-500 text-white'
            : 'bg-[#232323] text-gray-300 hover:bg-green-600 hover:text-white'
            }`}
        >
          Annual
        </button>
      </div>

      {/* Main savings highlight */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-8">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-green-400">${selectedData.savings}</span>
          <span className="text-xs text-gray-500 mt-1">Saved</span>
        </div>
        <div className="relative flex items-center justify-center">
          <svg className="w-16 h-16" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#232323"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#22c55e"
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 45 * savingsPercentage / 100} ${2 * Math.PI * 45 * (100 - savingsPercentage) / 100}`}
              strokeDashoffset={2 * Math.PI * 45 * 0.25}
              transform="rotate(-90 50 50)"
            />
            <text x="50" y="56" textAnchor="middle" className="text-lg font-bold" fill="#22c55e">
              {savingsPercentage}%
            </text>
          </svg>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-white">{selectedData.tokensProcessed}</span>
          <span className="text-xs text-gray-500 mt-1">Tokens</span>
        </div>
      </div>

      {/* Cost comparison bars */}
      <div className="px-6 pb-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            <span className="text-gray-200 text-xs">Auto-Router</span>
            <span className="ml-auto font-semibold text-green-400 text-xs">${selectedData.withAutoRouter}</span>
          </div>
          <div className="w-full bg-[#232323] rounded-full h-1 mb-1">
            <div
              className="bg-green-400 h-1 rounded-full"
              style={{ width: `${(selectedData.withAutoRouter / selectedData.withoutAutoRouter) * 100}%` }}
            ></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-500"></span>
            <span className="text-gray-400 text-xs">No Routing</span>
            <span className="ml-auto font-semibold text-gray-400 text-xs">${selectedData.withoutAutoRouter}</span>
          </div>
          <div className="w-full bg-[#232323] rounded-full h-1">
            <div className="bg-gray-500 h-1 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>

      {/* Minimal stats */}
      <div className="flex gap-2 px-6 pb-6">
        <div className="flex-1 bg-transparent border border-[#232323] rounded-xl p-3 text-center">
          <div className="text-xs text-gray-500">per 1K tokens</div>
          <div className="text-sm font-semibold text-green-400 mt-1">$0.0006</div>
        </div>
        <div className="flex-1 bg-transparent border border-[#232323] rounded-xl p-3 text-center">
          <div className="text-xs text-gray-500">Models Used</div>
          <div className="text-sm font-semibold text-green-400 mt-1">16</div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-transparent p-4 text-center rounded-b-2xl">
        <button className="bg-green-500 text-white hover:bg-green-600 py-2 px-6 rounded-full text-xs font-semibold transition-colors shadow">
          Calculate Your Savings
        </button>
      </div>
    </div>
  );
};

export default SavingsVisualizer;