'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const promptColors = ['#1bd106', '#deb510', '#039dfc',];

const models = [
    {
        name: 'Gemini 1.5 Pro',
        provider: 'Google DeepMind',
        tokens: '83.1B',
        latency: '2.1 sec',
        growth: '+6.75%',
        isNew: true,
        icon: 'https://openrouter.ai/images/icons/GoogleGemini.svg',
        useFor: 'Advanced General Reasoning',
    },
    {
        name: 'GPT-4.1',
        provider: 'OpenAI',
        tokens: '39.9B',
        latency: '400ms',
        growth: '+13.06%',
        isNew: true,
        icon: 'https://openrouter.ai/images/icons/OpenAI.svg',
        useFor: 'Creative Writing and Coding',
    },
    {
        name: 'Claude 3 Opus',
        provider: 'Anthropic',
        tokens: '34.5B',
        latency: '1.5 sec',
        growth: '+5.20%',
        isNew: false,
        icon: 'https://openrouter.ai/images/icons/Anthropic.svg',
        useFor: 'Philosophical Reasoning and Deep Math',
    },
];


const prompts = [
    { text: 'Summarize the key points from this 2-hour video lecture.', color: promptColors[0] },
    { text: 'Refactor this 50,000-line codebase to improve performance and readability.', color: promptColors[1] },
    { text: 'Evaluate the logical consistency of this philosophical argument and provide a counterargument from a different ethical perspective.', color: promptColors[2] },
];


export default function UnifiedLLMInterface() {
    const [messageIndex, setMessageIndex] = useState(0);
    const [selectedModelIndex, setSelectedModelIndex] = useState(1);
    const [lineCoords, setLineCoords] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });
    const [currentColor, setCurrentColor] = useState(promptColors[0]);
    const canvasRef = useRef<SVGSVGElement>(null);
    const promptRef = useRef<HTMLDivElement>(null);
    const modelRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex(prev => {
                const newIndex = (prev + 1) % prompts.length;
                setCurrentColor(prompts[newIndex].color);
                return newIndex;
            });
            setSelectedModelIndex(prev => (prev + 1) % models.length);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const updateLineCoords = () => {
            if (!promptRef.current || !modelRefs.current[selectedModelIndex]) return;

            const promptRect = promptRef.current.getBoundingClientRect();
            const modelRect = modelRefs.current[selectedModelIndex].getBoundingClientRect();
            if (!canvasRef.current) return;
            const svgRect = canvasRef.current.getBoundingClientRect();

            setLineCoords({
                x1: promptRect.right - svgRect.left,
                y1: promptRect.top + 25 - svgRect.top,
                x2: modelRect.left - svgRect.left,
                y2: modelRect.top + modelRect.height / 2 - svgRect.top
            });
        };

        updateLineCoords();
        window.addEventListener('resize', updateLineCoords);
        return () => window.removeEventListener('resize', updateLineCoords);
    }, [selectedModelIndex, messageIndex]);

    return (
        <div className="relative flex flex-col lg:flex-row items-start justify-between p-10 w-full max-w-screen-xl mx-auto">
            <svg ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <motion.line
                    initial={false}
                    animate={{
                        x1: lineCoords.x1,
                        y1: lineCoords.y1,
                        x2: lineCoords.x2,
                        y2: lineCoords.y2,
                        stroke: currentColor
                    }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    strokeWidth="2"
                />
            </svg>

            <div className="flex-1 space-y-6 z-10">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl sm:text-5xl font-bold"
                >
                    The Unified <br /> Interface For LLMs
                </motion.h1>
                <p className="text-lg text-gray-500">
                    <span className="text-indigo-500 font-medium">Simplifying AI integration</span> across all major model providers
                </p>
                <div ref={promptRef} className="flex items-center gap-2 bg-white border shadow-md rounded-lg px-4 py-3 max-w-md">
                    <motion.span
                        className="w-3 h-3 rounded-full"
                        animate={{ backgroundColor: currentColor }}
                        transition={{ duration: 0.3 }}
                    />
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={messageIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="text-sm text-gray-800 font-medium"
                        >
                            <span className="text-gray-600 font-semibold">User Prompt:</span>
                            <motion.span
                                className="ml-1"
                                animate={{ color: currentColor }}
                                transition={{ duration: 0.3 }}
                            >
                                {prompts[messageIndex].text}
                            </motion.span>
                        </motion.p>
                    </AnimatePresence>
                </div>
            </div>

            <div className="mt-10 lg:mt-0 lg:ml-12 w-full max-w-md z-10">
                <p className="text-sm text-gray-600 mb-2">Featured Models</p>
                <div className="space-y-4">
                    {models.map((model, i) => (
                        <motion.div
                            key={i}
                            ref={el => { modelRefs.current[i] = el; }}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{
                                opacity: 1,
                                x: 0,
                                borderColor: i === selectedModelIndex ? currentColor : '#e5e7eb',
                                boxShadow: i === selectedModelIndex ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none'
                            }}
                            transition={{ delay: i * 0.2 }}
                            className="flex items-center justify-between p-4 rounded-xl border bg-white"
                            style={{ borderColor: '#e5e7eb' }}
                        >
                            <div className="flex items-center gap-3">
                                <img src={model.icon} alt={model.provider} className="w-6 h-6 rounded-full" />
                                <div>
                                    <p className="font-semibold text-sm">{model.name}</p>
                                    <p className="text-xs text-gray-400">by {model.provider}</p>
                                    <p className="text-xs italic text-gray-500">Best for: {model.useFor}</p>
                                </div>
                                {model.isNew && (
                                    <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">New</span>
                                )}
                            </div>
                            <div className="text-right space-y-1 text-xs">
                                <p>{model.tokens} <span className="text-gray-400">Tokens/wk</span></p>
                                <p>{model.latency} <span className="text-gray-400">Latency</span></p>
                                <p className={`${model.growth.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
                                    {model.growth} <span className="text-gray-400">Growth</span>
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}