import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:9090";
const API_KEY = process.env.BACKEND_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5haGVlZDI4cmF5QGdtYWlsLmNvbSIsImV4cCI6MTc1MjMwMDc0MCwiaWQiOiI2ODQ4MjM5YmY5NjkwYmM0MjI0MWMwZTcifQ.I8RY2NlH-3ADRk0fLN4G9RZcT54u54ktpxQd8pul5KU";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { model, messages, max_tokens, temperature, top_p, extra_body } = body;

        console.log('Attempting to use model:', model);
        console.log('Extra body:', extra_body);

        // Prepare the request body for the backend
        const requestBody: any = {
            model,
            messages,
            max_tokens: max_tokens || 1000,
            temperature: temperature || 0.7,
            top_p: top_p || 1,
        };

        // Add extra_body if provided (for auto-router model selection)
        if (extra_body) {
            requestBody.extra_body = extra_body;
        }

        // Forward the request to your backend
        const response = await fetch(`${BACKEND_BASE_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Backend API error:', response.status, errorText);

            // Provide more specific error messages based on the error type
            if (response.status === 404) {
                return NextResponse.json(
                    {
                        error: 'Model not available or not found',
                        details: `The model "${model}" is not currently available. It may be disabled, deprecated, or have insufficient quota.`,
                        model: model
                    },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                {
                    error: 'Failed to get response from backend',
                    details: errorText,
                    status: response.status
                },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Log the actual model used for auto-router responses
        if (model === "auto-router/auto" && data.model) {
            console.log('Auto-router selected model:', data.model);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Chat API route error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
