"use client";

import React, { useState, useRef, useEffect } from "react";

// Mock LLMs
const LLM_MODELS = [
    { id: "gpt-4", name: "GPT-4", provider: "OpenAI" },
    { id: "claude-3", name: "Claude 3", provider: "Anthropic" },
    { id: "gemini-1.5", name: "Gemini 1.5", provider: "Google" },
    { id: "llama-3", name: "Llama 3", provider: "Meta" },
    { id: "mistral-large", name: "Mistral Large", provider: "Mistral" },
];

// Mock cost per message (USD)
const MODEL_COSTS: Record<string, number> = {
    "gpt-4": 0.02,
    "claude-3": 0.015,
    "gemini-1.5": 0.012,
    "llama-3": 0.005,
    "mistral-large": 0.004,
    "openrouter": 0.007,
};

function getRandomResponse(model: string, message: string) {
    return `(${model}) Response: "${message.slice(0, 40)}..."`;
}

export default function ChatPage() {
    const [selectedLLMs, setSelectedLLMs] = useState<string[]>(["gpt-4"]);
    const [useOpenRouter, setUseOpenRouter] = useState(true);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<{ user: string; responses: { [model: string]: string } }[]>([]);
    const [costHistory, setCostHistory] = useState<{ saved: number; spent: number }[]>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);
    // Track which model is currently responding (for animation)
    const [activeModel, setActiveModel] = useState<string | null>(null);

    // Function to clear conversation
    const clearConversation = () => {
        setMessages([]);
        setCostHistory([]);
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Limit selection to 3 models for smart routing
    const handleLLMChange = (id: string) => {
        setSelectedLLMs((prev) => {
            if (prev.includes(id)) {
                return prev.filter((m) => m !== id);
            }
            if (useOpenRouter && prev.length >= 3) {
                return prev;
            }
            return [...prev, id];
        });
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || selectedLLMs.length === 0) return;

        let responses: { [model: string]: string } = {};
        let spent = 0;
        let saved = 0;

        // Show typing animation for random model if auto-router is enabled
        const randomModelIndex = Math.floor(Math.random() * selectedLLMs.length);
        const randomModel = selectedLLMs[randomModelIndex];
        setActiveModel(useOpenRouter ? randomModel : selectedLLMs[0]);

        // Simulate response delay 
        setTimeout(() => {
            if (useOpenRouter) {
                // Smart routing simulation - choose best model for the input based on content
                // This simulates the auto-router analyzing the input and selecting the appropriate model
                const bestModelIndex = Math.floor(Math.random() * selectedLLMs.length);
                const bestModel = selectedLLMs[bestModelIndex];

                responses[bestModel] = getRandomResponse(bestModel, input);
                spent += MODEL_COSTS["openrouter"];
                saved += Math.max(0, MODEL_COSTS[bestModel] - MODEL_COSTS["openrouter"]);

                setActiveModel(null);
                setMessages((prev) => [...prev, { user: input, responses }]);
                setCostHistory((prev) => [...prev, { saved, spent }]);
            } else {
                selectedLLMs.forEach((model) => {
                    responses[model] = getRandomResponse(model, input);
                    spent += MODEL_COSTS[model];
                });

                setActiveModel(null);
                setMessages((prev) => [...prev, { user: input, responses }]);
                setCostHistory((prev) => [...prev, { saved, spent }]);
            }
        }, 800);

        setInput("");
    };

    // Minimal analytics
    const totalSpent = costHistory.reduce((sum, c) => sum + c.spent, 0);
    const totalSaved = costHistory.reduce((sum, c) => sum + c.saved, 0);

    return (
        <div className="flex max-h-[85vh] h-[700px] bg-white dark:bg-[#0a0a0a] rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Left sidebar - model selection */}
            <div className="w-60 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-gray-50 dark:bg-[#131314]">
                <div className="p-3 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-base font-medium text-gray-800 dark:text-gray-200">Auto-Router</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Smart AI model selection</p>
                </div>

                {/* Model selection - more compact */}
                <div className="flex-1 overflow-y-auto p-2">
                    <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Models</h3>
                            <div className="text-xs bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400">
                                {selectedLLMs.length} selected
                            </div>
                        </div>

                        <div className="space-y-1">
                            {LLM_MODELS.map((model) => {
                                const isSelected = selectedLLMs.includes(model.id);
                                const disabled = useOpenRouter && !isSelected && selectedLLMs.length >= 3;
                                const isActive = useOpenRouter && activeModel === model.id;

                                return (
                                    <div
                                        key={model.id}
                                        className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-colors
											${isSelected
                                                ? "border-green-400 bg-green-50 dark:bg-green-900/10"
                                                : "border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/40"}
											${disabled ? "opacity-40 cursor-not-allowed" : ""}
											${isActive ? "ring-2 ring-green-400" : ""}
										`}
                                        onClick={() => !disabled && handleLLMChange(model.id)}
                                    >
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded text-green-500 focus:ring-green-500 mr-2"
                                                checked={isSelected}
                                                onChange={() => { }}
                                                disabled={disabled}
                                            />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-200">{model.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{model.provider}</div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            ${MODEL_COSTS[model.id].toFixed(3)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Smart routing toggle - more compact */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300">Smart Routing</h3>
                            <div className={`text-xs px-1.5 py-0.5 rounded ${useOpenRouter ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
                                {useOpenRouter ? "ON" : "OFF"}
                            </div>
                        </div>

                        <label className="flex items-center space-x-2 cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={useOpenRouter}
                                    onChange={() => {
                                        setUseOpenRouter(v => !v);
                                        if (!useOpenRouter && selectedLLMs.length > 3) {
                                            setSelectedLLMs(prev => prev.slice(0, 3));
                                        }
                                    }}
                                />
                                <div className={`block w-8 h-4 rounded-full transition-colors ${useOpenRouter ? "bg-green-400" : "bg-gray-300 dark:bg-gray-700"}`}></div>
                                <div className={`absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${useOpenRouter ? "transform translate-x-4" : ""}`}></div>
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                                {useOpenRouter ? "Best model (max 3)" : "Use all models"}
                            </span>
                        </label>

                        {useOpenRouter && (
                            <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded">
                                <p>Price: ${MODEL_COSTS["openrouter"].toFixed(3)}/msg</p>
                                <p className="mt-0.5">Savings: ${totalSaved.toFixed(2)}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cost summary - more compact */}
                <div className="border-t border-gray-200 dark:border-gray-800 p-2 bg-gray-50 dark:bg-[#131314]">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Total spent:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-200">${totalSpent.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-0.5">
                        <span className="text-gray-600 dark:text-gray-400">Saved:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">${totalSaved.toFixed(3)}</span>
                    </div>
                </div>
            </div>

            {/* Main chat area */}
            <div className="flex-1 flex flex-col h-full border-r border-gray-200 dark:border-gray-800">
                {/* Chat header with clear button */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#131314]">
                    <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Chat {useOpenRouter && <span className="text-xs text-green-500">(Smart Routing)</span>}
                    </h2>
                    <button
                        onClick={clearConversation}
                        className="text-xs flex items-center gap-1 px-2 py-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Clear conversation"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Clear chat
                    </button>
                </div>

                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto" style={{ scrollBehavior: "smooth" }}>
                    <div className="max-w-3xl mx-auto px-4 py-8 w-full">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-10">
                                <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-600 dark:text-gray-300">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-200">How can I help you today?</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {useOpenRouter
                                        ? `Smart routing enabled with ${selectedLLMs.length} model${selectedLLMs.length !== 1 ? 's' : ''}`
                                        : 'Using all selected models for each message'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className="space-y-4">
                                        {/* User message */}
                                        <div className="flex items-start space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">U</span>
                                            </div>
                                            <div className="flex-1 max-w-[85%] px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-200">
                                                {msg.user}
                                            </div>
                                        </div>

                                        {/* Model responses */}
                                        {Object.entries(msg.responses).map(([model, response]) => {
                                            const modelInfo = LLM_MODELS.find(m => m.id === model);
                                            const colorVariants = [
                                                "bg-green-50 dark:bg-green-950/10 border-green-200 dark:border-green-900/30",
                                                "bg-blue-50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/30",
                                                "bg-purple-50 dark:bg-purple-950/10 border-purple-200 dark:border-purple-900/30",
                                                "bg-amber-50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/30",
                                                "bg-indigo-50 dark:bg-indigo-950/10 border-indigo-200 dark:border-indigo-900/30",
                                            ];
                                            const modelIndex = LLM_MODELS.findIndex(m => m.id === model) || 0;

                                            return (
                                                <div key={model} className="flex items-start space-x-2">
                                                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-sm font-semibold text-white">{modelInfo?.name[0] || "M"}</span>
                                                    </div>
                                                    <div className={`flex-1 max-w-[85%] px-4 py-2 border rounded-lg text-gray-800 dark:text-gray-200 ${colorVariants[modelIndex % colorVariants.length]}`}>
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{modelInfo?.name}</span>
                                                            {useOpenRouter && (
                                                                <span className="text-[10px] px-1 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                                                                    via Auto-Router
                                                                </span>
                                                            )}
                                                        </div>
                                                        {response}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}

                                {/* Show "typing" indicator when model is processing */}
                                {activeModel && (
                                    <div className="flex items-start space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-semibold text-white">{LLM_MODELS.find(m => m.id === activeModel)?.name[0] || "M"}</span>
                                        </div>
                                        <div className="py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-800 inline-flex">
                                            <div className="typing-indicator">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={chatEndRef} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Message input - more compact */}
                <div className="border-t border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-[#0a0a0a]">
                    <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-center space-x-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Message Auto-Router..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={selectedLLMs.length === 0}
                                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-[#131314] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!input.trim() || selectedLLMs.length === 0}
                            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </form>
                </div>
            </div>

            {/* Right sidebar for analytics & visualization */}
            <div className="w-64 flex-shrink-0 flex flex-col bg-gray-50 dark:bg-[#131314] overflow-hidden">
                <div className="p-3 border-b border-gray-200 dark:border-gray-800 bg-white/30 dark:bg-black/20 backdrop-blur-sm">
                    <h2 className="text-base font-medium text-gray-800 dark:text-gray-200">Analytics</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Real-time insights & savings</p>
                </div>

                <div className="flex-1 p-3 overflow-y-auto">
                    {/* Active model indicator - improved */}
                    <div className="mb-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Active Models</h3>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 font-medium">
                                {selectedLLMs.length} selected
                            </span>
                        </div>
                        <div className="space-y-2.5">
                            {selectedLLMs.map(modelId => {
                                const model = LLM_MODELS.find(m => m.id === modelId);
                                const isActive = activeModel === modelId;

                                const brandColors: Record<string, string> = {
                                    "OpenAI": "from-emerald-500 to-teal-500",
                                    "Anthropic": "from-indigo-500 to-blue-500",
                                    "Google": "from-blue-400 to-cyan-400",
                                    "Meta": "from-blue-600 to-indigo-600",
                                    "Mistral": "from-purple-500 to-fuchsia-500"
                                };

                                const gradientClass = brandColors[model?.provider || ""] || "from-gray-500 to-gray-600";

                                return (
                                    <div
                                        key={modelId}
                                        className={`flex items-center p-2 rounded-lg transition-all duration-200
                                            ${isActive
                                                ? 'border border-green-400 bg-green-50/50 dark:bg-green-900/10 shadow-sm'
                                                : 'bg-white dark:bg-gray-800/50 shadow-sm'}
                                        `}
                                    >
                                        <div className={`w-6 h-6 rounded-full mr-2.5 flex items-center justify-center text-white text-[10px] font-bold
                                            bg-gradient-to-br ${gradientClass} ${isActive ? 'ring-2 ring-green-400 ring-offset-1 ring-offset-white dark:ring-offset-gray-900' : ''}`
                                        }>
                                            {model?.name[0] || "M"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center">
                                                <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                                                    {model?.name}
                                                </div>
                                                {isActive && (
                                                    <span className="ml-1.5 flex space-x-0.5">
                                                        <span className="animate-pulse delay-0 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                                        <span className="animate-pulse delay-150 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                                        <span className="animate-pulse delay-300 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                                    ${MODEL_COSTS[modelId].toFixed(3)}/msg
                                                </div>
                                                {useOpenRouter && (
                                                    <div className="text-[10px] text-green-600 dark:text-green-400 font-medium">
                                                        ${(MODEL_COSTS[modelId] - MODEL_COSTS["openrouter"]).toFixed(3)} saved
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Cost savings visualization - improved */}
                    <div className="mb-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Cost Comparison</h3>
                            <div className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                Total: ${(totalSpent + totalSaved).toFixed(3)}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 relative">
                            <div className="flex items-end justify-around h-36 pb-6">
                                {/* Standard cost bar */}
                                <div className="flex flex-col items-center w-16">
                                    <div className="relative w-8 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg flex-1 max-h-24">
                                        {totalSpent + totalSaved > 0 && (
                                            <div
                                                className="absolute bottom-0 w-full bg-gradient-to-t from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-400 rounded-b-lg"
                                                style={{
                                                    height: `${Math.min(100, ((totalSpent + totalSaved) / Math.max(totalSpent + totalSaved, 0.01)) * 100)}%`
                                                }}
                                            ></div>
                                        )}
                                    </div>
                                    <div className="mt-2 text-center">
                                        <div className="text-[10px] text-gray-500 dark:text-gray-400">Standard</div>
                                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                            ${(totalSpent + totalSaved).toFixed(2)}
                                        </div>
                                    </div>
                                </div>

                                {/* Arrow graphic */}
                                {totalSaved > 0 && (
                                    <div className="flex flex-col items-center justify-center -mx-1 text-center">
                                        <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        <div className="text-[10px] text-green-600 dark:text-green-400 font-medium">
                                            {Math.round((totalSaved / (totalSpent + totalSaved)) * 100)}% saved
                                        </div>
                                    </div>
                                )}

                                {/* OpenRouter cost bar */}
                                <div className="flex flex-col items-center w-16">
                                    <div className="relative w-8 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg flex-1 max-h-24">
                                        {totalSpent > 0 && (
                                            <div
                                                className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 to-green-400 dark:from-green-600 dark:to-green-500 rounded-b-lg shadow-lg"
                                                style={{
                                                    height: `${Math.min(100, (totalSpent / Math.max(totalSpent + totalSaved, 0.01)) * 100)}%`
                                                }}
                                            ></div>
                                        )}
                                    </div>
                                    <div className="mt-2 text-center">
                                        <div className="text-[10px] text-gray-500 dark:text-gray-400">Smart</div>
                                        <div className="text-xs font-medium text-green-600 dark:text-green-400">
                                            ${totalSpent.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Usage chart - fixed and improved */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Message History</h3>
                            <div className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                {messages.length} messages
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 h-36 relative">
                            {messages.length > 0 ? (
                                <div className="absolute inset-0 p-3 flex flex-col">
                                    {/* Grid lines */}
                                    <div className="flex-1 border-b border-gray-200 dark:border-gray-700 grid grid-rows-4">
                                        <div className="border-b border-dashed border-gray-100 dark:border-gray-800"></div>
                                        <div className="border-b border-dashed border-gray-100 dark:border-gray-800"></div>
                                        <div className="border-b border-dashed border-gray-100 dark:border-gray-800"></div>
                                    </div>

                                    {/* Chart bars */}
                                    <div className="h-24 flex items-end gap-0.5 justify-between px-1 pb-1">
                                        {messages.slice(-10).map((msg, idx) => {
                                            const modelIds = Object.keys(msg.responses);
                                            const modelId = modelIds[0]; // Get first model in smart routing
                                            const model = LLM_MODELS.find(m => m.id === modelId);
                                            const modelIndex = LLM_MODELS.findIndex(m => m.id === modelId) || 0;

                                            // Different colors for each model
                                            const modelColors = [
                                                "bg-emerald-500",
                                                "bg-blue-500",
                                                "bg-purple-500",
                                                "bg-amber-500",
                                                "bg-rose-500"
                                            ];

                                            const color = modelColors[modelIndex % modelColors.length];

                                            // Generate a deterministic height based on model and message index
                                            const heightPercentage = 20 + ((modelIndex + 1) * 12) + (idx * 5) % 60;

                                            return (
                                                <div key={idx} className="flex flex-col items-center group">
                                                    <div className="relative w-full flex items-end">
                                                        <div
                                                            className={`w-full ${color} rounded-t opacity-90 group-hover:opacity-100`}
                                                            style={{ height: `${heightPercentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 z-10 absolute bottom-full mb-1 py-0.5 px-1.5 bg-gray-900 text-white text-[9px] rounded whitespace-nowrap transform -translate-x-1/2 left-1/2">
                                                        {model?.name}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* X-axis labels */}
                                    <div className="h-6 flex justify-between items-center">
                                        <div className="text-[9px] text-gray-400 dark:text-gray-500">Older</div>
                                        <div className="text-[9px] text-gray-400 dark:text-gray-500">Latest</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-600 mb-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                    </svg>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">No message history</div>
                                    <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Start a conversation</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Model selection history - NEW */}
                    {useOpenRouter && messages.length > 0 && (
                        <div className="mt-5">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Smart Router Choices</h3>
                                <div className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 font-medium">
                                    AI-optimized
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2">
                                <div className="space-y-1 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                                    {messages.slice(-5).map((msg, idx) => {
                                        const modelId = Object.keys(msg.responses)[0];
                                        const model = LLM_MODELS.find(m => m.id === modelId);
                                        return (
                                            <div key={idx} className="flex items-center justify-between text-xs py-0.5 px-1.5 rounded bg-gray-50 dark:bg-gray-800/50">
                                                <div className="truncate max-w-[130px] text-gray-600 dark:text-gray-400">
                                                    "{msg.user.slice(0, 15)}..."
                                                </div>
                                                <div className="text-green-600 dark:text-green-400 font-medium">
                                                    {model?.name || modelId}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CSS for typing indicator */}
            <style jsx global>{`
				.typing-indicator {
					display: flex;
					align-items: center;
					height: 17px;
				}
				.typing-indicator span {
					height: 5px;
					width: 5px;
					margin: 0 1px;
					background-color: #888;
					display: block;
					border-radius: 50%;
					opacity: 0.4;
				}
				.typing-indicator span:nth-of-type(1) {
					animation: 1s blink infinite 0.3333s;
				}
				.typing-indicator span:nth-of-type(2) {
					animation: 1s blink infinite 0.6666s;
				}
				.typing-indicator span:nth-of-type(3) {
					animation: 1s blink infinite 0.9999s;
				}
				@keyframes blink {
					50% {
						opacity: 1;
					}
				}
				.dark .typing-indicator span {
					background-color: #bbb;
				}
			`}</style>
        </div>
    );
}
