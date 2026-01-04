import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export const revalidate = 0;

const SOURCE = 'portal-status';

interface StatusContactBody {
    name?: string;
    email?: string;
    topic?: string;
    urgency?: string;
    message?: string;
}

const sanitize = (value?: string) => (typeof value === 'string' ? value.trim() : '');

export async function POST(request: NextRequest) {
    const rateLimitResponse = rateLimit(request, {
        maxRequests: 5,
        windowMs: 60 * 1000,
    });

    if (rateLimitResponse) {
        return rateLimitResponse;
    }

    let body: StatusContactBody;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const name = sanitize(body.name);
    const email = sanitize(body.email).toLowerCase();
    const topic = sanitize(body.topic);
    const urgency = sanitize(body.urgency || 'normal');
    const message = sanitize(body.message);

    if (!name || !email || !message) {
        return NextResponse.json(
            { error: 'Name, email, and message are required.' },
            { status: 400 }
        );
    }

    if (!email.includes('@')) {
        return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (message.length < 10) {
        return NextResponse.json({ error: 'Please provide more detail in your message.' }, { status: 400 });
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const ipAddress =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown';

    const payload = {
        name,
        email,
        topic: topic || 'support',
        urgency,
        message,
        source: SOURCE,
        submitted_at: new Date().toISOString(),
        ip_address: ipAddress,
        user_agent: request.headers.get('user-agent') || 'unknown',
    };

    try {
        const response = await fetch(`${apiBase}/v2/status-contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const responseBody = await response.json().catch(() => ({}));

        return NextResponse.json(responseBody, { status: response.status });
    } catch (error) {
        console.error('[status-contact] Failed to submit contact form', error);
        return NextResponse.json(
            { error: 'Unable to submit your request. Please try again later.' },
            { status: 502 }
        );
    }
}
