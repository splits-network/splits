'use client';

/**
 * Admin wrapper around @splits-network/shared-hooks useStandardList.
 * Auto-injects admin Clerk getToken and Next.js URL sync so consumers
 * don't need to wire these up manually.
 */

import { useAuth } from '@clerk/nextjs';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
    useStandardList as useStandardListBase,
    type UseStandardListOptions,
    type UseStandardListReturn,
} from '@splits-network/shared-hooks';

export function useStandardList<T = any, F extends Record<string, any> = Record<string, any>>(
    options: UseStandardListOptions<T, F>
): UseStandardListReturn<T, F> {
    const { getToken } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    return useStandardListBase<T, F>({
        ...options,
        getToken: options.getToken ?? getToken,
        urlSync: options.urlSync ?? (options.syncToUrl !== false ? {
            searchParams: searchParams,
            pathname,
            replace: (url: string, opts?: any) => router.replace(url, opts),
        } : undefined),
    });
}

export type {
    UseStandardListOptions,
    UseStandardListReturn,
} from '@splits-network/shared-hooks';
