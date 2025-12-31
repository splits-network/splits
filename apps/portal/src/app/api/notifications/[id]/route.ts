import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

async function requireAuth() {
    const { userId, getToken } = await auth();

    if (!userId) {
        return {
            error: NextResponse.json(
                { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
                { status: 401 }
            ),
        };
    }

    const token = await getToken();
    if (!token) {
        return {
            error: NextResponse.json(
                { error: { code: 'UNAUTHORIZED', message: 'No auth token' } },
                { status: 401 }
            ),
        };
    }

    return { userId, token };
}

async function forwardRequest(
    method: 'PATCH' | 'DELETE',
    request: NextRequest,
    params: Promise<{ id: string }>
) {
    const authResult = await requireAuth();
    if ('error' in authResult) {
        return authResult.error;
    }

    try {
        const { id } = await params;
        const url = `${API_GATEWAY_URL}/api/v2/notifications/${id}`;
        const headers: Record<string, string> = {
            Authorization: `Bearer ${authResult.token}`,
        };
        let body: string | undefined;

        if (method === 'PATCH') {
            headers['Content-Type'] = 'application/json';
            const payload = await request.json();
            body = JSON.stringify({ ...payload, userId: authResult.userId });
        }

        const response = await fetch(url, {
            method,
            headers,
            body,
        });

        if (response.status === 204) {
            return NextResponse.json({}, { status: 204 });
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error proxying notification request:', error);
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Failed to process notification request' } },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    return forwardRequest('PATCH', request, context.params);
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    return forwardRequest('DELETE', request, context.params);
}
