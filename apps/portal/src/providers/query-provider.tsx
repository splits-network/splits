"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
    // useState ensures each browser session gets its own QueryClient instance,
    // which is important in Next.js to avoid sharing state between requests.
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // 30 seconds — list data is considered fresh within this window.
                        // Navigating back to a page won't re-fetch within this time.
                        staleTime: 30_000,
                        // 5 minutes — unused cache entries are garbage collected after this.
                        gcTime: 300_000,
                        // Don't refetch when the user re-focuses the window.
                        // Matches the previous useStandardList behaviour.
                        refetchOnWindowFocus: false,
                        // Retry once on failure before surfacing an error.
                        retry: 1,
                    },
                },
            }),
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
