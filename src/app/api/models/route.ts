import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const apiRes = await fetch("https://openrouter.ai/api/frontend/models", {
        headers: { "Accept": "application/json" },
    });
    const data = await apiRes.json();
    return NextResponse.json(data);
}
