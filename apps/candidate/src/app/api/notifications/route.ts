import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
    try {
        const { userId, getToken } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
                { status: 401 }
            );
        }

        const token = await getToken();
        if (!token) {
            return NextResponse.json(
                { error: { code: 'UNAUTHORIZED', message: 'No auth token' } },
                { status: 401 }
            );
        }

        // Forward query params, translating camelCase to snake_case for V2
        const searchParams = request.nextUrl.searchParams;
        const forwarded = new URLSearchParams();
        searchParams.forEach((value, key) => {
            if (key === 'unreadOnly') {
                forwarded.set('unread_only', value);
            } else {
                forwarded.set(key, value);
            }
        });

        const queryString = forwarded.toString();
        const url = `${API_GATEWAY_URL}/api/v2/notifications${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        // V2 returns { data, pagination }; keep existing response shape for clients
        return NextResponse.json({ data: data.data || data });
    } catch (error) {
        console.error('Error proxying notifications request:', error);
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch notifications' } },
            { status: 500 }
        );
    }
}
