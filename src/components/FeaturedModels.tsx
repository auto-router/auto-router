"use client"

import React from "react";

const FeaturedModels = () => {
    const models = [
        {
            id: "gemini-2.5-pro",
            name: "Gemini 2.5 Pro Preview",
            provider: "Google",
            tokens: "83.1B",
            latency: "13.9s",
            growth: "+7.42%",
            isNew: true,
            tag: "Best for creative tasks"
        },
        {
            id: "gpt-4.1",
            name: "GPT-4.1",
            provider: "OpenAI",
            tokens: "39.9B",
            latency: "584ms",
            growth: "+13.06%",
            isNew: true,
            tag: "Best for code"
        },
        {
            id: "claude-3.7-sonnet",
            name: "Claude 3.7 Sonnet",
            provider: "Anthropic",
            tokens: "324.5B",
            latency: "1.5s",
            growth: "-3.37%",
            isNew: false,
            tag: "Best for long context"
        },
        {
            id: "mistral-large",
            name: "Mistral Large",
            provider: "Mistral",
            tokens: "98.6B",
            latency: "780ms",
            growth: "+15.22%",
            isNew: true,
            tag: "Best value for money"
        },
        {
            id: "llama-3",
            name: "Llama 3 70B",
            provider: "Meta",
            tokens: "157.4B",
            latency: "1.2s",
            growth: "+10.54%",
            isNew: false,
            tag: "Most versatile"
        },
        {
            id: "cohere-command",
            name: "Cohere Command R+",
            provider: "Cohere",
            tokens: "76.1B",
            latency: "650ms",
            growth: "+8.92%",
            isNew: false,
            tag: "Best for reasoning"
        }
    ];

    const providerColors: Record<string, string> = {
        Google: "bg-blue-100 text-blue-600",
        OpenAI: "bg-green-100 text-green-600",
        Anthropic: "bg-yellow-100 text-yellow-700",
        Mistral: "bg-purple-100 text-purple-600",
        Meta: "bg-indigo-100 text-indigo-600",
        Cohere: "bg-teal-100 text-teal-600",
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {models.map((model) => (
                <div
                    key={model.id}
                    className="flex flex-col items-center justify-between bg-gradient-to-br from-[#232323] to-[#181818] border border-[#232323] rounded-2xl shadow-md w-60 h-56 min-h-[14rem] max-h-[14rem] transition hover:scale-105 hover:border-green-400 duration-200 p-5 relative overflow-hidden"
                >
                    {/* Tag */}
                    {model.tag && (
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-green-100 text-green-700 text-xs py-1 px-3 rounded-full font-medium shadow-sm whitespace-nowrap z-10">
                            {model.tag}
                        </div>
                    )}
                    {/* Logo/Initial */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mt-8 mb-2 shadow ${providerColors[model.provider] || "bg-gray-100 text-gray-700"}`}>
                        <span className="text-lg font-bold">
                            {model.provider[0]}
                        </span>
                    </div>
                    {/* Name + New */}
                    <div className="flex items-center gap-2 mb-1 w-full justify-center">
                        <span className="text-base font-semibold text-white text-center truncate max-w-[8.5rem]">{model.name}</span>
                        {model.isNew && (
                            <span className="text-xs px-2 py-0.5 bg-green-500 text-white rounded-full font-semibold whitespace-nowrap">New</span>
                        )}
                    </div>
                    <div className="text-xs text-gray-400 text-center mb-2 truncate w-full">{model.provider}</div>
                    {/* Stats */}
                    <div className="flex justify-center gap-4 w-full mt-2">
                        <div className="flex flex-col items-center min-w-0">
                            <span className="text-sm font-medium text-gray-200 truncate">{model.tokens}</span>
                            <span className="text-[10px] text-gray-500">Tokens/wk</span>
                        </div>
                        <div className="flex flex-col items-center min-w-0">
                            <span className="text-sm font-medium text-gray-200 truncate">{model.latency}</span>
                            <span className="text-[10px] text-gray-500">Latency</span>
                        </div>
                        <div className="flex flex-col items-center min-w-0">
                            <span className={`text-sm font-medium truncate ${model.growth.startsWith("+") ? "text-green-400" : "text-red-400"}`}>{model.growth}</span>
                            <span className="text-[10px] text-gray-500">Growth</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FeaturedModels;