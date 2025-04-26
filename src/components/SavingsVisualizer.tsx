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
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 border-b border-gray-100">
        <h3 className="text-2xl font-medium mb-2 text-gray-800 text-center">Cost Comparison</h3>
        <p className="text-center text-gray-600 mb-6">Experience significant savings with intelligent model routing</p>
      
        {/* Tab selector */}
        <div className="flex justify-center mb-2">
          <div className="inline-flex rounded-full p-1 bg-gray-100 shadow-inner">
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === 'monthly' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setActiveTab('yearly')}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
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
      
      <div className="p-8">
        {/* Main savings highlight */}
        <div className="flex justify-center items-center mb-12">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-500">${selectedData.savings}</div>
            <div className="text-sm text-gray-500 mt-1">Total Savings</div>
          </div>
          <div className="mx-4 w-24 h-24 relative">
            <svg className="w-24 h-24" viewBox="0 0 100 100">
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
              <text x="50" y="55" textAnchor="middle" className="text-xl font-bold" fill="#4f46e5">
                {savingsPercentage}%
              </text>
            </svg>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-500">{selectedData.tokensProcessed}</div>
            <div className="text-sm text-gray-500 mt-1">Tokens Processed</div>
          </div>
        </div>

        {/* Cost comparison */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h4 className="font-medium text-gray-800 mb-6">Cost Breakdown</h4>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 rounded-full bg-indigo-500 mr-2"></div>
                <span className="text-gray-700">With Auto-Router</span>
                <span className="ml-auto font-medium text-indigo-600">${selectedData.withAutoRouter}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-indigo-500 h-3 rounded-full" 
                  style={{ width: `${(selectedData.withAutoRouter / selectedData.withoutAutoRouter) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 rounded-full bg-gray-400 mr-2"></div>
                <span className="text-gray-700">Without Auto-Router</span>
                <span className="ml-auto font-medium text-gray-600">${selectedData.withoutAutoRouter}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gray-400 h-3 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional statistics */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-500">Avg. Cost per 1K tokens</div>
            <div className="text-xl font-medium text-indigo-600 mt-1">$0.0006</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-500">Models Utilized</div>
            <div className="text-xl font-medium text-purple-600 mt-1">16 different</div>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-center">
        <button className="bg-white text-indigo-600 hover:bg-gray-50 py-3 px-8 rounded-full text-sm font-medium transition-colors shadow-md hover:shadow-lg">
          Calculate Your Custom Savings
        </button>
      </div>
    </div>
  );
};

export default SavingsVisualizer; 