"use client"

import React, { useState, useContext } from "react";
import { AutoSwitchContext } from "../context/AutoSwitchContext";

const ChatInput = () => {
    const [input, setInput] = useState("");
    const { sendMessage, loading } = useContext(AutoSwitchContext);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        await sendMessage(input);
        setInput("");
    };

    return (
        <div className="w-full relative">
            <form onSubmit={handleSubmit} className="w-full relative">
                <div className="relative">
                    <input
                        type="text"
                        className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm text-gray-800 placeholder-gray-400"
                        placeholder="Start a message..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-indigo-500 hover:bg-indigo-600 text-white p-2.5 rounded-full transition-colors"
                        disabled={loading || !input.trim()}
                        aria-label="Send message"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </form>
            
            {/* Smart Routing Status Indicators */}
            <div className="absolute mt-3 flex items-center gap-6 text-xs text-gray-500">
                <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>Smart Routing Active</span>
                </div>
                
                <div className="flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1.5 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Auto-selecting from 300+ models</span>
                </div>
            </div>
        </div>
    );
};

export default ChatInput;