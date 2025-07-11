"use client";

import React, { useState, useEffect, useRef } from 'react';

interface Model {
    id: string;
    name: string;
    provider: string;
    description?: string;
    isNew?: boolean;
}

interface ModelSelectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAddModel: (model: Model) => void;
    selectedModelIds: string[];
    availableModels?: Model[]; // <-- add this prop
}

const ModelSelectionDialog: React.FC<ModelSelectionDialogProps> = ({
    isOpen,
    onClose,
    onAddModel,
    selectedModelIds = [],
    availableModels // <-- use this
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Use availableModels if provided, otherwise fallback to static list
    const defaultModels: Model[] = [
        { id: 'minimax-m1', name: 'MiniMax: MiniMax M1', provider: 'MiniMax' },
        { id: 'minimax-m1-extended', name: 'MiniMax: MiniMax M1 (extended)', provider: 'MiniMax' },
        { id: 'gemini-2.5-flash', name: 'Google: Gemini 2.5 Flash Lite Preview 06-17', provider: 'Google', isNew: true },
        { id: 'gemini-2.5', name: 'Google: Gemini 2.5 Flash', provider: 'Google' },
        { id: 'gemini-2.5-pro', name: 'Google: Gemini 2.5 Pro', provider: 'Google' },
        { id: 'kimi-dev-72b', name: 'Kimi Dev 72b (free)', provider: 'Kimi' },
        { id: 'openai-o3-pro', name: 'OpenAI: o3 Pro', provider: 'OpenAI' },
        { id: 'mistral-magistral', name: 'Mistral: Magistral Small 2506', provider: 'Mistral' }
    ];

    const modelsToShow = availableModels && availableModels.length > 0 ? availableModels : defaultModels;

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    const handleAddModel = (model: Model) => {
        onAddModel(model);
    };

    const filteredModels = modelsToShow.filter(model =>
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.provider.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
            <div
                className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col border border-gray-200 dark:border-gray-800"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add AI Models to Tray</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Select models to add to your selection</p>
                </div>

                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type="text"
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-md py-2 pl-8 pr-3 text-sm bg-white dark:bg-[#222] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                            placeholder="Search models..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <svg
                            className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-1 min-h-[200px]">
                    {filteredModels.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm py-8">
                            <svg className="h-12 w-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>No models found matching "{searchQuery}"</p>
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {filteredModels.map((model) => {
                                const isAlreadySelected = selectedModelIds.includes(model.id);
                                return (
                                    <div
                                        key={model.id}
                                        className={`p-3 rounded-lg border transition-all
                                        ${isAlreadySelected
                                                ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 opacity-60'
                                                : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {model.name}
                                                    </span>
                                                    {model.isNew && (
                                                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded font-medium">
                                                            new
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {model.provider}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAddModel(model)}
                                                disabled={isAlreadySelected}
                                                className={`px-3 py-1 text-xs rounded-md ${isAlreadySelected
                                                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                                    } transition-colors`}
                                            >
                                                {isAlreadySelected ? 'Added' : 'Add'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModelSelectionDialog;
