'use client';

/**
 * Portal wrapper around @splits-network/shared-hooks useStandardList.
 * Auto-injects Clerk getToken and Next.js URL sync so existing consumers
 * continue to work without changes.
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

// Re-export UI components so existing consumers of this file continue to work
export {
    SearchInput,
    PaginationControls,
    EmptyState,
    StandardListLoadingState,
    // LoadingState alias for the one admin file that imports it from here
    StandardListLoadingState as LoadingState,
    ErrorState,
    ViewModeToggle,
    MobileDetailOverlay,
} from '@splits-network/shared-ui';

export type {
    UseStandardListOptions,
    UseStandardListReturn,
    FetchParams,
    FetchResponse,
} from '@splits-network/shared-hooks';
