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

  // Cost data
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
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 border-b border-gray-100">
        <h3 className="text-xl font-medium mb-1 text-gray-800 text-center">Cost Comparison</h3>
        <p className="text-center text-gray-600 text-sm mb-4">Experience significant savings with intelligent model routing</p>
      
        {/* Tab selector */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-full p-1 bg-gray-100 shadow-inner">
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-4 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                activeTab === 'monthly' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setActiveTab('yearly')}
              className={`px-4 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                activeTab === 'yearly' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Annual
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        {/* Main savings highlight */}
        <div className="flex justify-center items-center mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500">${selectedData.savings}</div>
            <div className="text-xs text-gray-500 mt-1">Total Savings</div>
          </div>
          <div className="mx-4 w-20 h-20 relative">
            <svg className="w-20 h-20" viewBox="0 0 100 100">
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#e5e7eb" 
                strokeWidth="10"
              />
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 45 * savingsPercentage / 100} ${2 * Math.PI * 45 * (100 - savingsPercentage) / 100}`}
                strokeDashoffset={2 * Math.PI * 45 * 25 / 100}
                transform="rotate(-90 50 50)"
              />
              <text x="50" y="55" textAnchor="middle" className="text-base font-bold" fill="#4f46e5">
                {savingsPercentage}%
              </text>
            </svg>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-500">{selectedData.tokensProcessed}</div>
            <div className="text-xs text-gray-500 mt-1">Tokens Processed</div>
          </div>
        </div>

        {/* Cost comparison */}
        <div className="bg-gray-50 rounded-xl p-4 mb-5">
          <h4 className="font-medium text-gray-800 text-sm mb-3">Cost Breakdown</h4>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                <span className="text-gray-700 text-sm">With Auto-Router</span>
                <span className="ml-auto font-medium text-indigo-600 text-sm">${selectedData.withAutoRouter}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-500 h-2 rounded-full" 
                  style={{ width: `${(selectedData.withAutoRouter / selectedData.withoutAutoRouter) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                <span className="text-gray-700 text-sm">Without Auto-Router</span>
                <span className="ml-auto font-medium text-gray-600 text-sm">${selectedData.withoutAutoRouter}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-400 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional statistics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-indigo-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">Cost per 1K tokens</div>
            <div className="text-base font-medium text-indigo-600 mt-1">$0.0006</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">Models Utilized</div>
            <div className="text-base font-medium text-purple-600 mt-1">16 different</div>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 text-center">
        <button className="bg-white text-indigo-600 hover:bg-gray-50 py-2 px-6 rounded-full text-xs font-medium transition-colors shadow-sm hover:shadow">
          Calculate Your Custom Savings
        </button>
      </div>
    </div>
  );
};

export default SavingsVisualizer; 