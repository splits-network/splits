import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const serviceUrl = process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001';
        const response = await fetch(`${serviceUrl}/health`, {
            cache: 'no-store',
            signal: AbortSignal.timeout(5000),
        });
        const data = await response.json();
        
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        return NextResponse.json(
            {
                status: 'unhealthy',
                service: 'identity-service',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            },
            { status: 503 }
        );
    }
}
