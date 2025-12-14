import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const gatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';
        const response = await fetch(`${gatewayUrl}/health`, {
            cache: 'no-store',
            signal: AbortSignal.timeout(5000),
        });
        const data = await response.json();
        
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        return NextResponse.json(
            {
                status: 'unhealthy',
                service: 'api-gateway',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            },
            { status: 503 }
        );
    }
}
