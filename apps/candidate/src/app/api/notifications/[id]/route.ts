import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;
        const body = await request.json();
        const url = `${API_GATEWAY_URL}/api/v2/notifications/${id}`;

        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating notification:', error);
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Failed to update notification' } },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;
        const url = `${API_GATEWAY_URL}/api/v2/notifications/${id}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const data = await response.json();
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json({ data: { success: true } });
    } catch (error) {
        console.error('Error deleting notification:', error);
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete notification' } },
            { status: 500 }
        );
    }
}
