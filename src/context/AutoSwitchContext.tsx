"use client"

import React, { createContext, useState, useEffect } from "react";
import { getProviders } from "../lib/providers";

interface Provider {
    id: string;
    name: string;
    inputPrice: number;
    outputPrice: number;
}

interface Stats {
    totalRequests: number;
    tokensProcessed: number;
    providersUsed: number;
}

interface AutoSwitchContextProps {
    providers: Provider[];
    bestProvider: Provider | null;
    sendMessage: (message: string) => Promise<void>;
    loading: boolean;
    stats: Stats;
}

export const AutoSwitchContext = createContext<AutoSwitchContextProps>({
    providers: [],
    bestProvider: null,
    sendMessage: async () => { },
    loading: false,
    stats: { totalRequests: 0, tokensProcessed: 0, providersUsed: 0 },
});

export const AutoSwitchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [bestProvider, setBestProvider] = useState<Provider | null>(null);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<Stats>({ totalRequests: 0, tokensProcessed: 0, providersUsed: 0 });

    useEffect(() => {
        const fetchProviders = async () => {
            const list = await getProviders();
            setProviders(list);
            if (list.length > 0) {
                const best = list.reduce((a, b) =>
                    a.inputPrice + a.outputPrice < b.inputPrice + b.outputPrice ? a : b
                );
                setBestProvider(best);
            }
        };
        fetchProviders();
    }, []);

    const sendMessage = async (message: string) => {
        setLoading(true);
        // Simulate sending message and updating stats
        await new Promise(res => setTimeout(res, 1000));
        setStats(prev => ({
            totalRequests: prev.totalRequests + 1,
            tokensProcessed: prev.tokensProcessed + message.length,
            providersUsed: prev.providersUsed + (bestProvider ? 1 : 0),
        }));
        setLoading(false);
    };

    return (
        <AutoSwitchContext.Provider value={{ providers, bestProvider, sendMessage, loading, stats }}>
            {children}
        </AutoSwitchContext.Provider>
    );
};