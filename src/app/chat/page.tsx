"use client";

import React, { useState, useRef, useEffect } from "react";
import ModelSelectionDialog from '@/components/ModelSelectionDialog';

interface Model {
    id: string;
    name: string;
    provider: string;
    isNew?: boolean;
    isActive?: boolean;
    description?: string;
    cost?: number;
    input_modalities?: string[];
    output_modalities?: string[];
    is_free?: boolean; // Add is_free field
    context_length?: number;
}

interface ImageFile {
    file: File;
    base64: string;
    preview: string;
}

// Replace the mock function with actual API call
async function sendChatMessage(
    model: string,
    message: string,
    conversationHistory: any[],
    images: ImageFile[] = [],
    useAutoRouter: boolean = false,
    availableModels: string[] = []
) {
    try {
        // Prepare messages with image support
        let content: any = message;

        if (images.length > 0) {
            content = [
                { type: "text", text: message },
                ...images.map(img => ({
                    type: "image_url",
                    image_url: { url: `data:${img.file.type};base64,${img.base64}` }
                }))
            ];
        }

        // Prepare request body with auto-router support
        const requestBody: any = {
            model: useAutoRouter ? "auto-router/auto" : model,
            messages: [
                ...conversationHistory,
                { role: "user", content }
            ],
            max_tokens: 1000,
            temperature: 0.7,
        };

        // Add extra_body for auto-router with available models
        if (useAutoRouter && availableModels.length > 0) {
            requestBody.extra_body = {
                models: availableModels
            };
        }

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Extract token usage and model information for cost calculation
        const usage = data.usage || {};
        const promptTokens = usage.prompt_tokens || 0;
        const completionTokens = usage.completion_tokens || 0;

        // Extract the actual model used (for auto-router responses)
        const actualModelUsed = data.model || model;

        return {
            content: data.choices[0].message.content,
            actualModel: actualModelUsed, // Track which model was actually used
            usage: {
                promptTokens,
                completionTokens,
                totalTokens: usage.total_tokens || (promptTokens + completionTokens),
                imageCount: images.length
            }
        };
    } catch (error) {
        console.error('Chat API error:', error);
        return {
            content: `Error: Failed to get response from ${model}. Please try again.`,
            actualModel: model,
            usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, imageCount: 0 }
        };
    }
}

export default function ChatPage() {
    // Add state for allModels and loading
    const [allModels, setAllModels] = useState<Model[]>([]);
    const [modelsLoading, setModelsLoading] = useState(true);

    // Selected models and other states
    const [selectedModels, setSelectedModels] = useState<Model[]>([]);
    const [useOpenRouter, setUseOpenRouter] = useState(true);
    const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<{
        user: string;
        responses: { [model: string]: string };
        actualCost?: number;
        tokensUsed?: number;
        images?: ImageFile[];
        actualModelUsed?: string; // Track which model was actually used
    }[]>([]);
    const [costHistory, setCostHistory] = useState<{ saved: number; spent: number }[]>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [activeModel, setActiveModel] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);

    // Model costs state - include image pricing
    const [modelCosts, setModelCosts] = useState<Record<string, { prompt: number; completion: number; image: number }>>({
        "openrouter": { prompt: 0.000007, completion: 0.000007, image: 0.001 }, // Keep openrouter as baseline
    });

    // Add conversation history state for API calls
    const [conversationHistory, setConversationHistory] = useState<Array<{ role: string, content: any }>>([]);

    // Fetch models from API on mount
    useEffect(() => {
        async function fetchModels() {
            setModelsLoading(true);
            try {
                const res = await fetch("/api/models");
                const json = await res.json();

                const seen = new Set<string>();
                const mapped: Model[] = (json.data || []).map((item: any, idx: number) => {
                    let baseId = item.slug || item.permaslug || item.endpoint?.model_variant_slug || item.endpoint?.provider_model_id || item.name;
                    let id = baseId;

                    if (seen.has(id)) {
                        id = `${baseId}__${idx}`;
                    }
                    seen.add(id);

                    return {
                        id,
                        name: item.name,
                        provider: item.endpoint?.provider_name || item.author || "Unknown",
                        isNew: false,
                        description: item.description,
                        cost: item.endpoint?.pricing?.prompt ? Number(item.endpoint.pricing.prompt) : undefined,
                        input_modalities: item.input_modalities || ["text"],
                        output_modalities: item.output_modalities || ["text"],
                        is_free: item.endpoint?.is_free || false, // Add free model detection
                        context_length: item.context_length || 0,
                    };
                });

                // Extract actual pricing from API response
                const costs: Record<string, { prompt: number; completion: number; image: number }> = {
                    "openrouter": { prompt: 0.000007, completion: 0.000007, image: 0.001 }
                };

                (json.data || []).forEach((item: any, idx: number) => {
                    let baseId = item.slug || item.permaslug || item.endpoint?.model_variant_slug || item.endpoint?.provider_model_id || item.name;
                    let id = baseId;
                    if (seen.has(id)) {
                        id = mapped[idx].id;
                    }

                    const pricing = item.endpoint?.pricing;
                    if (pricing) {
                        costs[id] = {
                            prompt: Number(pricing.prompt) || 0,
                            completion: Number(pricing.completion) || 0,
                            image: Number(pricing.image) || 0
                        };
                    }
                });

                setAllModels(mapped);
                setModelCosts(costs);
                setSelectedModels([]);
            } catch (e) {
                setAllModels([]);
            }
            setModelsLoading(false);
        }
        fetchModels();
    }, []);

    // Handle image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64 = event.target?.result as string;
                    const base64Data = base64.split(',')[1]; // Remove data:image/...;base64, prefix

                    setSelectedImages(prev => [...prev, {
                        file,
                        base64: base64Data,
                        preview: base64
                    }]);
                };
                reader.readAsDataURL(file);
            }
        });

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Remove image
    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    // Function to clear conversation
    const clearConversation = () => {
        setMessages([]);
        setCostHistory([]);
        setConversationHistory([]);
        setSelectedImages([]);
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Limit selection to 3 models for smart routing
    const handleLLMChange = (id: string) => {
        setSelectedModels(prev => {
            if (prev.some(m => m.id === id)) {
                return prev.filter((m) => m.id !== id);
            }
            if (useOpenRouter && prev.length >= 3) {
                return prev;
            }
            const modelToAdd = allModels.find(m => m.id === id);
            return modelToAdd ? [...prev, modelToAdd] : prev;
        });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!input.trim() && selectedImages.length === 0) || selectedModels.length === 0) return;

        const userMessage = input.trim() || "What do you see in this image?";
        const messagImages = [...selectedImages];
        setInput("");
        setSelectedImages([]);

        let responses: { [model: string]: string } = {};
        let actualCost = 0;
        let tokensUsed = 0;
        let actualModelUsed: string = "";

        // Determine which model to use
        let chosenModel: Model | undefined;
        let availableModelIds: string[] = [];

        if (useOpenRouter) {
            // For auto-router, collect all selected model IDs
            availableModelIds = selectedModels.map(m => m.id);
            chosenModel = selectedModels[0]; // Use first as fallback for UI display
        } else {
            chosenModel = selectedModels.find(m => m.isActive) || selectedModels[0];
        }

        if (chosenModel) {
            // Check if model supports images (skip check for auto-router as it can route to multimodal models)
            const supportsImages = chosenModel.input_modalities?.includes('image') || false;
            if (messagImages.length > 0 && !supportsImages && !useOpenRouter) {
                responses[chosenModel.id] = "This model doesn't support image inputs. Please select a multimodal model.";
                setMessages((prev) => [...prev, {
                    user: userMessage,
                    responses,
                    images: messagImages
                }]);
                return;
            }

            setActiveModel(useOpenRouter ? "auto-router/auto" : chosenModel.id);

            try {
                // Call the actual chat API with auto-router support
                const result = await sendChatMessage(
                    chosenModel.id,
                    userMessage,
                    conversationHistory,
                    messagImages,
                    useOpenRouter,
                    availableModelIds
                );

                actualModelUsed = result.actualModel;
                responses[actualModelUsed] = result.content;

                // Calculate actual costs based on the model that was actually used
                const modelPricing = modelCosts[actualModelUsed] || modelCosts[chosenModel.id];
                if (modelPricing && result.usage) {
                    const promptCost = result.usage.promptTokens * modelPricing.prompt;
                    const completionCost = result.usage.completionTokens * modelPricing.completion;
                    const imageCost = result.usage.imageCount * modelPricing.image;
                    actualCost = promptCost + completionCost + imageCost;
                    tokensUsed = result.usage.totalTokens;
                }

                // Update conversation history
                const messageContent = messagImages.length > 0
                    ? [
                        { type: "text", text: userMessage },
                        ...messagImages.map(img => ({
                            type: "image_url",
                            image_url: { url: img.preview }
                        }))
                    ]
                    : userMessage;

                setConversationHistory(prev => [
                    ...prev,
                    { role: "user", content: messageContent },
                    { role: "assistant", content: result.content }
                ]);

                // Update UI with actual cost data and model used
                setMessages((prev) => [...prev, {
                    user: userMessage,
                    responses,
                    actualCost,
                    tokensUsed,
                    images: messagImages,
                    actualModelUsed // Track which model was actually used for this message
                }]);

            } catch (error) {
                responses[chosenModel.id] = "Sorry, I encountered an error processing your request. Please try again.";
                setMessages((prev) => [...prev, {
                    user: userMessage,
                    responses,
                    images: messagImages
                }]);
            }

            setActiveModel(null);
        }
    };

    // Calculate total spent using actual costs from API responses
    const totalSpent = messages.reduce((sum, msg) => {
        return sum + (msg.actualCost || 0);
    }, 0);

    // Calculate savings (comparison with standard pricing)
    const totalSaved = messages.reduce((sum, msg) => {
        if (!useOpenRouter || !msg.actualCost || !msg.actualModelUsed) return sum;

        const actualModelPricing = modelCosts[msg.actualModelUsed];
        const autoRouterPricing = modelCosts["auto-router/auto"] || modelCosts["openrouter"];

        if (actualModelPricing && msg.tokensUsed) {
            // Calculate what it would have cost with the direct model
            const estimatedPromptTokens = Math.floor(msg.tokensUsed * 0.3);
            const estimatedCompletionTokens = msg.tokensUsed - estimatedPromptTokens;
            const directModelCost = (estimatedPromptTokens * actualModelPricing.prompt) +
                (estimatedCompletionTokens * actualModelPricing.completion);

            // Auto-router cost is much lower due to smart routing
            const autoRouterCost = msg.actualCost || 0;

            return sum + Math.max(0, directModelCost - autoRouterCost);
        }
        return sum;
    }, 0);

    // Calculate savings percentage
    const totalCostIfDirect = messages.reduce((sum, msg) => {
        if (!msg.actualModelUsed || !msg.tokensUsed) return sum;

        const actualModelPricing = modelCosts[msg.actualModelUsed];
        if (actualModelPricing) {
            const estimatedPromptTokens = Math.floor(msg.tokensUsed * 0.3);
            const estimatedCompletionTokens = msg.tokensUsed - estimatedPromptTokens;
            const directCost = (estimatedPromptTokens * actualModelPricing.prompt) +
                (estimatedCompletionTokens * actualModelPricing.completion);
            return sum + directCost;
        }
        return sum;
    }, 0);

    const savingsPercentage = totalCostIfDirect > 0 ? ((totalSaved / totalCostIfDirect) * 100) : 0;

    const selectedLLMs = selectedModels.map(model => model.id);

    const handleAddModel = (model: Model) => {
        // Add cost if not present
        if (model.id && modelCosts[model.id] === undefined) {
            setModelCosts(prev => ({ ...prev, [model.id]: { prompt: 0.000007, completion: 0.000007, image: 0 } }));
        }

        setSelectedModels(prev => {
            if (prev.some(m => m.id === model.id)) return prev;
            const shouldBeActive = !useOpenRouter && (prev.length === 0 || !prev.some(m => m.isActive));
            return [...prev, { ...model, isActive: shouldBeActive }];
        });
    };

    const handleRemoveModel = (modelId: string) => {
        setSelectedModels(prev => {
            const newModels = prev.filter(model => model.id !== modelId);

            // If we're removing the active model and smart routing is disabled,
            // we need to activate another model if available
            if (!useOpenRouter && prev.find(m => m.id === modelId)?.isActive && newModels.length > 0) {
                newModels[0].isActive = true;
            }

            return newModels;
        });
    };

    // Toggle model activation (used for non-smart routing mode)
    const handleToggleModelActive = (modelId: string) => {
        if (useOpenRouter) return; // No need to toggle if smart routing is on

        setSelectedModels(prev => {
            return prev.map(model => ({
                ...model,
                isActive: model.id === modelId // Only the clicked model should be active
            }));
        });
    };

    // Handle smart routing toggle
    const toggleSmartRouting = () => {
        setUseOpenRouter(prev => {
            const newValue = !prev;

            // If turning off smart routing, ensure only one model is active
            if (!newValue && selectedModels.length > 0) {
                setSelectedModels(models => {
                    const updated = [...models];
                    // Set only the first model as active
                    updated.forEach((model, index) => {
                        model.isActive = index === 0;
                    });
                    return updated;
                });
            }

            return newValue;
        });
    };

    // If loading, show loading spinner
    if (modelsLoading) {
        return (
            <div className="flex items-center justify-center h-[400px] w-full text-gray-500">
                Loading models...
            </div>
        );
    }

    // Check if any selected model supports images
    const hasMultimodalModel = selectedModels.some(model =>
        model.input_modalities?.includes('image')
    );

    return (
        <div className="flex max-h-[85vh] h-[700px] bg-white dark:bg-[#0a0a0a] rounded-xl shadow border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Left sidebar - model selection */}
            <div className="w-56 flex-shrink-0 border-r border-gray-100 dark:border-gray-800 flex flex-col bg-white dark:bg-[#161616]">
                <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Auto-Router</h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Smart model selection</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Models</h3>
                            <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400">{selectedModels.length}</span>
                        </div>
                        <button
                            onClick={() => setIsModelDialogOpen(true)}
                            className="w-full mb-3 flex items-center justify-center gap-2 px-2 py-1.5 text-xs font-medium text-white bg-green-500 hover:bg-green-600 rounded transition"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Add
                        </button>
                        <ModelSelectionDialog
                            isOpen={isModelDialogOpen}
                            onClose={() => setIsModelDialogOpen(false)}
                            onAddModel={handleAddModel}
                            selectedModelIds={selectedLLMs}
                            // @ts-ignore
                            availableModels={allModels}
                        />
                        <div className="space-y-1">
                            {selectedModels.map((model) => {
                                const isTyping = activeModel === model.id;
                                const isActive = useOpenRouter || model.isActive;
                                const isMultimodal = model.input_modalities?.includes('image');

                                return (
                                    <div
                                        key={model.id}
                                        className={`p-2 rounded border flex items-center justify-between transition
                                            ${isTyping
                                                ? 'border-green-400 bg-green-50 dark:bg-green-900/10'
                                                : isActive
                                                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10'
                                                    : 'border-gray-100 dark:border-gray-800'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`w-3 h-3 rounded-full border ${model.isActive ? 'border-blue-500' : 'border-gray-300'} flex-shrink-0`}
                                                onClick={() => handleToggleModelActive(model.id)}
                                                title={useOpenRouter ? "Smart routing enabled" : "Click to activate"}
                                                style={{ cursor: useOpenRouter ? "default" : "pointer" }}
                                            >
                                                {isTyping && <div className="w-2 h-2 rounded-full bg-green-500 mx-auto my-auto animate-pulse"></div>}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1">
                                                    <div className="text-xs font-medium text-gray-900 dark:text-gray-100">{model.name}</div>
                                                    {model.is_free && (
                                                        <span className="text-[8px] px-1 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                                                            FREE
                                                        </span>
                                                    )}
                                                    {isMultimodal && (
                                                        <span className="text-[8px] px-1 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded">
                                                            📷
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-gray-400 dark:text-gray-500">
                                                    {model.provider}
                                                    {!model.is_free && modelCosts[model.id] && (
                                                        <span className="ml-1">
                                                            • ${modelCosts[model.id].prompt.toFixed(6)}/tok
                                                            {modelCosts[model.id].image > 0 && (
                                                                <span>, ${modelCosts[model.id].image.toFixed(3)}/img</span>
                                                            )}
                                                        </span>
                                                    )}
                                                    {model.is_free && (
                                                        <span className="ml-1 text-green-600 dark:text-green-400">• Free</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveModel(model.id)}
                                            className="text-gray-300 dark:text-gray-500 hover:text-red-500 p-1"
                                            title="Remove"
                                        >
                                            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                );
                            })}
                            {selectedModels.length === 0 && (
                                <div className="p-3 text-center text-xs text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded">
                                    No models selected.
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Smart Routing</span>
                            <span className={`text-[10px] px-1 py-0.5 rounded ${useOpenRouter ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                {useOpenRouter ? "ON" : "OFF"}
                            </span>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={useOpenRouter}
                                onChange={toggleSmartRouting}
                            />
                            <div className={`w-8 h-4 rounded-full transition-colors ${useOpenRouter ? "bg-green-400" : "bg-gray-300 dark:bg-gray-700"}`}>
                                <div className={`absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${useOpenRouter ? "transform translate-x-4" : ""}`}></div>
                            </div>
                            <span className="text-[10px] text-gray-500">{useOpenRouter ? "Best (max 3)" : "Manual"}</span>
                        </label>
                        {useOpenRouter && (
                            <div className="mt-2 text-[11px] text-gray-500 bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
                                <div className="flex justify-between items-center mb-1">
                                    <span>Auto-Router Savings:</span>
                                    <span className="font-semibold text-green-600 dark:text-green-400">
                                        ${totalSaved.toFixed(6)}
                                    </span>
                                </div>
                                {savingsPercentage > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span>Savings:</span>
                                        <span className="font-semibold text-green-600 dark:text-green-400">
                                            {savingsPercentage.toFixed(1)}%
                                        </span>
                                    </div>
                                )}
                                <div className="text-[10px] text-gray-400 mt-1">
                                    vs. direct model usage
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 p-2 bg-white dark:bg-[#161616]">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Spent</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-100">${totalSpent.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                        <span className="text-gray-400">Saved</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                            ${totalSaved.toFixed(6)}
                            {savingsPercentage > 0 && (
                                <span className="ml-1 text-[10px]">({savingsPercentage.toFixed(1)}%)</span>
                            )}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                        <span className="text-gray-400">Tokens</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                            {messages.reduce((sum, msg) => sum + (msg.tokensUsed || 0), 0).toLocaleString()}
                        </span>
                    </div>
                    {useOpenRouter && totalSaved > 0 && (
                        <div className="mt-2 p-1 bg-green-50 dark:bg-green-900/20 rounded text-[10px] text-green-700 dark:text-green-400 text-center">
                            💰 Auto-Router saved you ${totalSaved.toFixed(6)}!
                        </div>
                    )}
                </div>
            </div>

            {/* Main chat area */}
            <div className="flex-1 flex flex-col h-full border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-[#181818]">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-[#181818]">
                    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Chat {useOpenRouter && <span className="text-xs text-green-500">(Smart Routing)</span>}
                    </h2>
                    <button
                        onClick={clearConversation}
                        className="text-xs flex items-center gap-1 px-2 py-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        title="Clear"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Clear
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-2xl mx-auto px-4 py-6 w-full">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-10">
                                <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-800">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400 dark:text-gray-500">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-base font-semibold text-gray-700 dark:text-gray-200">How can I help you today?</h3>
                                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                    {useOpenRouter
                                        ? `Smart routing enabled (${selectedLLMs.length} model${selectedLLMs.length !== 1 ? 's' : ''})`
                                        : 'Manual model selection'}
                                    {hasMultimodalModel && (
                                        <span className="block mt-1">📷 Image support available</span>
                                    )}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className="space-y-3">
                                        {/* User message */}
                                        <div className="flex items-start gap-2">
                                            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">U</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded text-gray-800 dark:text-gray-200 text-sm">
                                                    {msg.user}
                                                </div>
                                                {/* Display images if any */}
                                                {msg.images && msg.images.length > 0 && (
                                                    <div className="flex gap-2 mt-2 flex-wrap">
                                                        {msg.images.map((img, imgIdx) => (
                                                            <img
                                                                key={imgIdx}
                                                                src={img.preview}
                                                                alt="Uploaded"
                                                                className="w-20 h-20 object-cover rounded border"
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Model responses */}
                                        {Object.entries(msg.responses).map(([model, response]) => {
                                            const modelInfo = allModels.find(m => m.id === model);
                                            const isAutoRouted = useOpenRouter && msg.actualModelUsed && msg.actualModelUsed !== model;

                                            return (
                                                <div key={model} className="flex items-start gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs font-semibold text-white">{modelInfo?.name[0] || "M"}</span>
                                                    </div>
                                                    <div className="flex-1 px-3 py-2 border border-gray-100 dark:border-gray-800 rounded text-gray-800 dark:text-gray-200 text-sm bg-white dark:bg-[#191919]">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                {isAutoRouted ? allModels.find(m => m.id === msg.actualModelUsed)?.name : modelInfo?.name}
                                                            </span>
                                                            {useOpenRouter && (
                                                                <span className="text-[10px] px-1 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                                                                    via Auto-Router
                                                                </span>
                                                            )}
                                                            {msg.actualModelUsed && msg.actualModelUsed !== model && (
                                                                <span className="text-[10px] px-1 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                                                                    Selected: {allModels.find(m => m.id === msg.actualModelUsed)?.name}
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
                                    <div className="flex items-start gap-2">
                                        <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-semibold text-white">{allModels.find(m => m.id === activeModel)?.name[0] || "M"}</span>
                                        </div>
                                        <div className="py-2 px-3 rounded bg-gray-50 dark:bg-gray-800 inline-flex">
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

                {/* Message input with image upload */}
                <div className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#181818]">
                    {/* Image preview */}
                    {selectedImages.length > 0 && (
                        <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex gap-2 flex-wrap">
                                {selectedImages.map((img, idx) => (
                                    <div key={idx} className="relative">
                                        <img
                                            src={img.preview}
                                            alt="Preview"
                                            className="w-16 h-16 object-cover rounded border"
                                        />
                                        <button
                                            onClick={() => removeImage(idx)}
                                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="p-3">
                        <form onSubmit={handleSend} className="max-w-2xl mx-auto flex items-center gap-2">
                            {/* Image upload button */}
                            {hasMultimodalModel && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
                                    title="Upload image"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21,15 16,10 5,21" />
                                    </svg>
                                </button>
                            )}

                            <input
                                type="text"
                                placeholder={selectedImages.length > 0 ? "Ask about your images..." : "Message Auto-Router..."}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={selectedModels.length === 0}
                                className="flex-1 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white dark:bg-[#191919] text-sm text-gray-900 dark:text-gray-100 disabled:opacity-50"
                            />

                            <button
                                type="submit"
                                disabled={(!input.trim() && selectedImages.length === 0) || selectedModels.length === 0}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </form>
                    </div>
                </div>
            </div>

            {/* Right sidebar for analytics & visualization */}
            <div className="w-56 flex-shrink-0 flex flex-col bg-white dark:bg-[#161616] border-l border-gray-100 dark:border-gray-800">
                <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#161616]">
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Analytics</h2>
                </div>
                <div className="flex-1 p-3 overflow-y-auto">
                    <div className="mb-4">
                        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Active Models</h3>
                        <div className="space-y-1">
                            {selectedLLMs.map(modelId => {
                                const model = allModels.find(m => m.id === modelId);
                                return (
                                    <div key={modelId} className="flex items-center gap-2 p-2 rounded bg-gray-50 dark:bg-gray-800">
                                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px] font-bold">{model?.name[0] || "M"}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{model?.name}</div>
                                            <div className="text-[10px] text-gray-400">{model?.provider}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Cost Analysis</h3>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Spent</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-100">${totalSpent.toFixed(6)}</span>
                        </div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Saved</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">${totalSaved.toFixed(6)}</span>
                        </div>
                        {useOpenRouter && totalCostIfDirect > 0 && (
                            <>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-400">Would've Cost</span>
                                    <span className="font-semibold text-red-500 dark:text-red-400">${totalCostIfDirect.toFixed(6)}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Efficiency</span>
                                    <span className="font-semibold text-green-600 dark:text-green-400">{savingsPercentage.toFixed(1)}%</span>
                                </div>
                                <div className="mt-2 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                                    <div className="text-[10px] text-green-700 dark:text-green-400 text-center font-medium">
                                        Auto-Router Savings
                                    </div>
                                    <div className="text-xs text-green-600 dark:text-green-300 text-center font-bold">
                                        ${totalSaved.toFixed(6)}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
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