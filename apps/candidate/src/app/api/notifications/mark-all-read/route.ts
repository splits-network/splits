import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

export async function POST() {
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

        const url = `${API_GATEWAY_URL}/api/v2/notifications/mark-all-read`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        });

        if (!response.ok) {
            const data = await response.json();
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json({ data: { success: true } });
    } catch (error) {
        console.error('Error marking all as read:', error);
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Failed to mark notifications as read' } },
            { status: 500 }
        );
    }
}
