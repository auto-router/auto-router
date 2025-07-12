import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:9090";
const API_KEY = process.env.BACKEND_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5haGVlZDI4cmF5QGdtYWlsLmNvbSIsImV4cCI6MTc1MjMwMDc0MCwiaWQiOiI2ODQ4MjM5YmY5NjkwYmM0MjI0MWMwZTcifQ.I8RY2NlH-3ADRk0fLN4G9RZcT54u54ktpxQd8pul5KU";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { model, messages, max_tokens, temperature, top_p } = body;

        // Forward the request to your backend
        const response = await fetch(`${BACKEND_BASE_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model,
                messages,
                max_tokens: max_tokens || 1000,
                temperature: temperature || 0.7,
                top_p: top_p || 1,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Backend API error:', response.status, errorText);
            return NextResponse.json(
                { error: 'Failed to get response from backend' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Chat API route error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
