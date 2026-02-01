import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const apiUrl = `${process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000'}/api/v2/plans${url.search}`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`API Gateway returned ${response.status}: ${response.statusText}`);
            return NextResponse.json(
                { error: 'Failed to fetch plans' }, 
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error fetching plans:', error);
        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}