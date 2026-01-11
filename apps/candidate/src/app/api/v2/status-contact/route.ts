import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export const revalidate = 0;

interface StatusContactRequest {
    name?: string;
    email?: string;
    topic?: string;
    urgency?: string;
    message?: string;
}

export async function POST(request: NextRequest) {
    // Rate limiting: 5 requests per minute
    const rateLimitResponse = rateLimit(request, {
        maxRequests: 5,
        windowMs: 60 * 1000,
    });

    if (rateLimitResponse) {
        return rateLimitResponse;
    }

    let body: StatusContactRequest;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // Basic client-side validation before forwarding
    if (!body.name?.trim() || !body.email?.trim() || !body.message?.trim()) {
        return NextResponse.json(
            { error: 'Name, email, and message are required.' },
            { status: 400 }
        );
    }

    try {
        const apiGatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

        // Forward to API Gateway V2 endpoint
        const response = await fetch(`${apiGatewayUrl}/api/v2/status-contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...body,
                source: 'candidate-status',
                submitted_at: new Date().toISOString(),
                ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
                user_agent: request.headers.get('user-agent') || 'unknown',
            }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            console.error('[status-contact] Gateway error:', response.status, data);
            return NextResponse.json(
                { error: data.error || 'Failed to submit contact form' },
                { status: response.status }
            );
        }

        return NextResponse.json({ success: true }, { status: 202 });
    } catch (error) {
        console.error('[status-contact] Failed to submit contact form', error);
        return NextResponse.json(
            { error: 'Service temporarily unavailable. Please try again.' },
            { status: 503 }
        );
    }
}
