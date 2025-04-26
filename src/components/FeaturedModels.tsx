"use client"

import React from "react";

const FeaturedModels = () => {
    // Updated models data with additional models to showcase grid layout
    const models = [
        {
            id: "gemini-2.5-pro",
            name: "Gemini 2.5 Pro Preview",
            provider: "google",
            tokens: "83.1B",
            latency: "13.9s",
            growth: "+7.42%",
            isNew: true,
            tag: "Best for creative tasks"
        },
        {
            id: "gpt-4.1",
            name: "GPT-4.1",
            provider: "openai",
            tokens: "39.9B",
            latency: "584ms",
            growth: "+13.06%",
            isNew: true,
            tag: "Best for code"
        },
        {
            id: "claude-3.7-sonnet",
            name: "Claude 3.7 Sonnet",
            provider: "anthropic",
            tokens: "324.5B",
            latency: "1.5s",
            growth: "-3.37%",
            isNew: false,
            tag: "Best for long context"
        },
        {
            id: "mistral-large",
            name: "Mistral Large",
            provider: "mistral",
            tokens: "98.6B",
            latency: "780ms",
            growth: "+15.22%",
            isNew: true,
            tag: "Best value for money"
        },
        {
            id: "llama-3",
            name: "Llama 3 70B",
            provider: "meta",
            tokens: "157.4B",
            latency: "1.2s",
            growth: "+10.54%",
            isNew: false,
            tag: "Most versatile"
        },
        {
            id: "cohere-command",
            name: "Cohere Command R+",
            provider: "cohere",
            tokens: "76.1B",
            latency: "650ms",
            growth: "+8.92%",
            isNew: false,
            tag: "Best for reasoning"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model, index) => (
                <div key={model.id} className="relative isolate">
                    <div className="p-4 rounded-lg border border-gray-200 bg-white transition-all duration-300 hover:shadow-lg hover:border-indigo-200 hover:scale-102 group">
                        {/* Tag positioned with higher z-index */}
                        {model.tag && (
                            <div style={{zIndex: 50}} className="absolute -top-3 right-3 bg-indigo-100 text-indigo-800 text-xs py-1 px-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {model.tag}
                            </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                    model.provider === 'google' ? 'bg-blue-50 group-hover:bg-blue-100' : 
                                    model.provider === 'openai' ? 'bg-green-50 group-hover:bg-green-100' : 
                                    model.provider === 'anthropic' ? 'bg-amber-50 group-hover:bg-amber-100' :
                                    model.provider === 'mistral' ? 'bg-purple-50 group-hover:bg-purple-100' :
                                    model.provider === 'meta' ? 'bg-indigo-50 group-hover:bg-indigo-100' :
                                    'bg-teal-50 group-hover:bg-teal-100'
                                } transition-colors duration-300`}>
                                    <span className={`text-sm font-medium ${
                                        model.provider === 'google' ? 'text-blue-500' : 
                                        model.provider === 'openai' ? 'text-green-500' : 
                                        model.provider === 'anthropic' ? 'text-amber-700' :
                                        model.provider === 'mistral' ? 'text-purple-500' :
                                        model.provider === 'meta' ? 'text-indigo-500' :
                                        'text-teal-500'
                                    }`}>
                                        {model.provider === 'google' ? 'G' : 
                                         model.provider === 'openai' ? 'O' : 
                                         model.provider === 'anthropic' ? 'A' :
                                         model.provider === 'mistral' ? 'M' :
                                         model.provider === 'meta' ? 'L' :
                                         'C'}
                                    </span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-800 group-hover:text-black transition-colors duration-300">{model.name}</span>
                                        {model.isNew && (
                                            <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors duration-300">New</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500">by {model.provider}</div>
                                </div>
                            </div>
                            
                            {index === 0 && (
                                <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                            
                            {index === 1 && (
                                <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                                    <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            )}
                            
                            {index === 2 && (
                                <div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center">
                                    <span className="text-amber-700 text-xs">A</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mt-4">
                            <div className="group-hover:transform group-hover:translate-y-[-2px] transition-transform duration-300">
                                <div className="font-medium text-gray-800 group-hover:text-black transition-colors duration-300">{model.tokens}</div>
                                <div className="text-xs text-gray-500">Tokens/wk</div>
                            </div>
                            <div className="group-hover:transform group-hover:translate-y-[-2px] transition-transform duration-300">
                                <div className="font-medium text-gray-800 group-hover:text-black transition-colors duration-300">{model.latency}</div>
                                <div className="text-xs text-gray-500">Latency</div>
                            </div>
                            <div className="group-hover:transform group-hover:translate-y-[-2px] transition-transform duration-300">
                                <div className={`font-medium ${model.growth.startsWith("+") ? "text-green-500 group-hover:text-green-600" : "text-red-500 group-hover:text-red-600"} transition-colors duration-300`}>
                                    {model.growth}
                                </div>
                                <div className="text-xs text-gray-500">Weekly growth</div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FeaturedModels;