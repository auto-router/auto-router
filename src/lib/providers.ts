export interface Provider {
    id: string;
    name: string;
    inputPrice: number;
    outputPrice: number;
}

export async function getProviders(): Promise<Provider[]> {
    // Simulated provider data; in a real app, fetch from API or config
    return [
        { id: "openai", name: "OpenAI GPT-4", inputPrice: 0.03, outputPrice: 0.06 },
        { id: "anthropic", name: "Anthropic Claude", inputPrice: 0.025, outputPrice: 0.05 },
        { id: "google", name: "Google Gemini", inputPrice: 0.02, outputPrice: 0.04 },
    ];
}