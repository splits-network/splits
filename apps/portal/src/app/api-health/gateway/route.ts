import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

// Cache health check responses for 15 seconds
export const revalidate = 15;

export async function GET(request: NextRequest) {
    // Rate limit: max 10 requests per minute per IP
    const rateLimitResponse = rateLimit(request, {
        maxRequests: 10,
        windowMs: 60 * 1000, // 1 minute
    });
    
    if (rateLimitResponse) {
        return rateLimitResponse;
    }
    
    try {
        const gatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';
        const response = await fetch(`${gatewayUrl}/health`, {
            cache: 'no-store',
            signal: AbortSignal.timeout(5000),
        });
        const data = await response.json();
        
        return NextResponse.json(data, { 
            status: response.status,
            headers: {
                'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
            },
        });
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
