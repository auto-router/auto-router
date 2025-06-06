'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const promptColors = ['#1bd106', '#deb510', '#039dfc',];

const models = [
    {
        name: 'Gemini 1.5 Pro',
        provider: 'Google DeepMind',
        icon: 'https://openrouter.ai/images/icons/GoogleGemini.svg',
    },
    {
        name: 'GPT-4.1',
        provider: 'OpenAI',
        icon: 'https://openrouter.ai/images/icons/OpenAI.svg',
    },
    {
        name: 'Claude 3 Opus',
        provider: 'Anthropic',
        icon: 'https://openrouter.ai/images/icons/Anthropic.svg',
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
        }, 1500);
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
                // Start at bottom center of prompt panel
                x1: promptRect.left + promptRect.width / 2 - svgRect.left,
                y1: promptRect.bottom - svgRect.top,
                // End at top center of selected model card
                x2: modelRect.left + modelRect.width / 2 - svgRect.left,
                y2: modelRect.top - svgRect.top
            });
        };

        updateLineCoords();
        window.addEventListener('resize', updateLineCoords);
        return () => window.removeEventListener('resize', updateLineCoords);
    }, [selectedModelIndex, messageIndex]);

    return (
        <div className="relative flex flex-col items-center p-10 w-full max-w-2xl mx-auto bg-black">
            {/* Headings and prompt */}
            <div className="w-full space-y-6 z-10 mb-30">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl sm:text-5xl font-bold text-white text-center"
                >
                    One Platform. Every Model. Smart AI Routing.
                </motion.h1>
                <p className="text-lg text-gray-300 text-center">
                    <span className="text-green-500 font-medium">Seamlessly access the best AI models</span>
                    —automatically routed, cost-optimized, and unified under one simple API.
                </p>
                <div className="relative w-full flex flex-col items-center" style={{ minHeight: 220 }}>
                    <svg
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
                        style={{ height: "100%" }}
                    >
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
                    <div
                        ref={promptRef}
                        className="flex items-center gap-3 bg-gradient-to-br from-[#232323] to-[#181818] border-2 rounded-xl w-[420px] h-20 min-h-[120px] max-w-full mx-auto mt-0 mb-16 z-10 overflow-hidden shadow-lg"
                        style={{
                            position: "relative",
                            justifyContent: "center",
                            borderColor: currentColor,
                            padding: "0 1.5rem"
                        }}
                    >
                        <motion.span
                            className="w-4 h-4 rounded-full mr-2"
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
                                className="text-sm sm:text-base text-gray-100 font-medium leading-snug"
                            >
                                <span className="text-gray-400 font-semibold">User Prompt:</span>
                                <motion.span
                                    className="ml-2"
                                    animate={{ color: currentColor }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {prompts[messageIndex].text}
                                </motion.span>
                            </motion.p>
                        </AnimatePresence>
                    </div>
                    <div className="flex flex-row justify-center gap-4 w-full z-10 mt-2">
                        {models.map((model, i) => (
                            <motion.div
                                key={i}
                                ref={el => { modelRefs.current[i] = el; }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    borderColor: i === selectedModelIndex ? currentColor : '#222',
                                    boxShadow: i === selectedModelIndex ? '0 4px 8px 0 rgba(0,0,0,0.08)' : 'none'
                                }}
                                transition={{ delay: i * 0.15 }}
                                className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-[#161616] min-w-[120px]"
                                style={{ borderColor: i === selectedModelIndex ? currentColor : '#222' }}
                            >
                                <img
                                    src={model.icon}
                                    alt={model.provider}
                                    className={`w-8 h-8 rounded-full ${model.provider === "OpenAI" ? "invert" : ""}`}
                                />
                                <p className="font-semibold text-sm text-white text-center">{model.name}</p>
                                <p className="text-xs text-gray-400 text-center">{model.provider}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}