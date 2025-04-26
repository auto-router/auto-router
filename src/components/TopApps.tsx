"use client"

import React from "react";

const TopApps = () => {
    const apps = [
        {
            id: "roo-code",
            name: "Roo Code",
            description: "A whole dev team of AI agents",
            tokens: "37.6B",
            icon: "👨‍💻",
            rank: 1
        },
        {
            id: "cline",
            name: "Cline",
            description: "Autonomous coding agent right in your terminal",
            tokens: "35.7B",
            icon: "🖥️",
            rank: 2
        },
        {
            id: "yourware",
            name: "yourware",
            description: "Vibe coder's Instagram",
            tokens: "5.03B",
            icon: "W",
            rank: 3
        },
        {
            id: "sillytavern",
            name: "SillyTavern",
            description: "LLM frontend for power users",
            tokens: "4.73B",
            icon: "🍺",
            rank: 4
        },
        {
            id: "shapes-inc",
            name: "shapes inc",
            description: "General purpose social agents",
            tokens: "4.18B",
            icon: "📊",
            rank: 5
        },
        {
            id: "chub-ai",
            name: "Chub AI",
            description: "GenAI for everyone",
            tokens: "3.73B",
            icon: "🦴",
            rank: 6
        },
        {
            id: "fraction-ai",
            name: "Fraction AI",
            description: "Large perpetual datasets with perfect recall",
            tokens: "1.26B",
            icon: "📈",
            rank: 11
        },
        {
            id: "infinite-worlds",
            name: "Infinite Worlds",
            description: "Build your own adventures, share with friends",
            tokens: "1.11B",
            icon: "🌍",
            rank: 12
        }
    ];

    return (
        <div className="bg-indigo-50 rounded-xl py-8 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 20H7C5.89543 20 5 19.1046 5 18V6C5 4.89543 5.89543 4 7 4H17C18.1046 4 19 4.89543 19 6V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M13 15H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M17 11V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <h2 className="text-xl font-medium text-gray-800">Top Apps</h2>
                    </div>
                    <div className="bg-white bg-opacity-70 px-3 py-1 rounded-md text-sm text-gray-600">
                        Today
                    </div>
                </div>
                <p className="text-gray-500 text-sm mb-6">
                    Largest public apps <span className="text-blue-500">opting into</span> usage tracking on Auto-Router
                </p>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
                        {apps.map((app) => (
                            <div key={app.id} className="flex items-center space-x-4 py-2 hover:bg-gray-50 px-2 rounded-md transition-colors duration-150">
                                <div className="w-6 text-right text-gray-500">{app.rank}.</div>
                                <div className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100">
                                    <span className="text-lg">{app.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-1">
                                        <span className="font-medium text-gray-800">{app.name}</span>
                                        <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <p className="text-xs text-gray-500">{app.description}</p>
                                </div>
                                <div className="w-20 text-right">
                                    <div className="font-medium text-gray-600">{app.tokens}</div>
                                    <div className="text-xs text-gray-400">tokens</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopApps;