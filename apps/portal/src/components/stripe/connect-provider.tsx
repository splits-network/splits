"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { StripeConnectInstance } from "@stripe/connect-js";

interface ConnectContextValue {
    connectInstance: StripeConnectInstance | null;
    loading: boolean;
    error: string | null;
}

const ConnectContext = createContext<ConnectContextValue>({
    connectInstance: null,
    loading: true,
    error: null,
});

export function useConnectInstance() {
    return useContext(ConnectContext);
}

interface ConnectProviderProps {
    children: ReactNode;
}

export function ConnectProvider({ children }: ConnectProviderProps) {
    const { getToken } = useAuth();
    const [connectInstance, setConnectInstance] =
        useState<StripeConnectInstance | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function initConnect() {
            try {
                const publishableKey =
                    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
                if (!publishableKey) {
                    setError("Stripe publishable key not configured");
                    setLoading(false);
                    return;
                }

                const { loadConnectAndInitialize } = await import(
                    "@stripe/connect-js"
                );

                const instance = loadConnectAndInitialize({
                    publishableKey,
                    fetchClientSecret: async () => {
                        const token = await getToken();
                        if (!token)
                            throw new Error("Not authenticated");
                        const api = createAuthenticatedClient(token);
                        const response: any = await api.post(
                            "/stripe/connect/account-session"
                        );
                        return response?.data?.client_secret;
                    },
                    appearance: {
                        variables: {
                            colorPrimary: "#570df8",
                            fontFamily: "inherit",
                            borderRadius: "8px",
                            fontSizeBase: "14px",
                            spacingUnit: "12px",
                            colorBackground: "#ffffff",
                            colorText: "#1f2937",
                            colorDanger: "#ef4444",
                        },
                    },
                });

                if (!cancelled) {
                    setConnectInstance(instance);
                    setLoading(false);
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(
                        err?.message ||
                            "Failed to initialize Stripe Connect"
                    );
                    setLoading(false);
                }
            }
        }

        initConnect();

        return () => {
            cancelled = true;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ConnectContext.Provider
            value={{ connectInstance, loading, error }}
        >
            {children}
        </ConnectContext.Provider>
    );
}
