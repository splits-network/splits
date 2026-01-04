import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000/api';

/**
 * POST /api/v2/documents - Upload document
 */
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json(
                { error: { message: 'Unauthorized' } },
                { status: 401 }
            );
        }

        // Get the FormData from the request
        const formData = await request.formData();

        // Forward to API Gateway with Bearer token
        const token = await fetch(`${process.env.CLERK_SECRET_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sub: userId }),
        }).then(res => res.json()).then(data => data.token).catch(() => null);

        if (!token) {
            // Fallback: use Clerk session token from request
            const authHeader = request.headers.get('authorization');
            if (!authHeader) {
                return NextResponse.json(
                    { error: { message: 'Missing authorization' } },
                    { status: 401 }
                );
            }

            const response = await fetch(`${API_GATEWAY_URL}/v2/documents`, {
                method: 'POST',
                headers: {
                    'Authorization': authHeader,
                },
                body: formData,
            });

            const data = await response.json();
            return NextResponse.json(data, { status: response.status });
        }

        // Forward with generated token
        const response = await fetch(`${API_GATEWAY_URL}/v2/documents`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Upload proxy error:', error);
        return NextResponse.json(
            { error: { message: 'Internal server error' } },
            { status: 500 }
        );
    }
}

/**
 * GET /api/v2/documents - List documents
 */
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json(
                { error: { message: 'Unauthorized' } },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const queryString = searchParams.toString();
        const url = `${API_GATEWAY_URL}/v2/documents${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': request.headers.get('authorization') || '',
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('List documents proxy error:', error);
        return NextResponse.json(
            { error: { message: 'Internal server error' } },
            { status: 500 }
        );
    }
}
