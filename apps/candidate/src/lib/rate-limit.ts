import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

// Simple in-memory rate limiter (for single-instance use)
// For production with multiple instances, use Redis
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetAt < now) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
    maxRequests: number; // Maximum requests allowed
    windowMs: number; // Time window in milliseconds
}

export function rateLimit(request: NextRequest, config: RateLimitConfig): NextResponse | null {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const key = `${ip}:${request.nextUrl.pathname}`;
    const now = Date.now();
    
    const entry = rateLimitStore.get(key);
    
    if (!entry || entry.resetAt < now) {
        // First request or window expired
        rateLimitStore.set(key, {
            count: 1,
            resetAt: now + config.windowMs,
        });
        return null; // Allow request
    }
    
    if (entry.count >= config.maxRequests) {
        // Rate limit exceeded
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
        return NextResponse.json(
            {
                status: 'unhealthy',
                error: 'Rate limit exceeded',
                timestamp: new Date().toISOString(),
            },
            {
                status: 429,
                headers: {
                    'Retry-After': retryAfter.toString(),
                },
            }
        );
    }
    
    // Increment counter
    entry.count++;
    return null; // Allow request
}
