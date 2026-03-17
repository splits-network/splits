"use client";

/**
 * Stripe Provider Component
 * Wraps children with Stripe Elements context
 */

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, Stripe, Appearance } from "@stripe/stripe-js";
import { ReactNode, useMemo } from "react";

// Initialize Stripe outside component to avoid recreation
let stripePromise: Promise<Stripe | null> | null = null;

function getStripe() {
    if (!stripePromise) {
        const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (!key) {
            console.error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
            return null;
        }
        stripePromise = loadStripe(key);
    }
    return stripePromise;
}

export interface StripeProviderProps {
    children: ReactNode;
    clientSecret?: string;
}

/**
 * Resolve DaisyUI theme CSS variables to hex values Stripe can use.
 * Stripe Elements only accepts HEX, rgb(), or hsl() — not oklch() or CSS variables.
 */
function getResolvedThemeColors() {
    if (typeof window === "undefined") return null;
    const style = getComputedStyle(document.documentElement);
    const resolve = (varName: string) => {
        const raw = style.getPropertyValue(varName).trim();
        // Create a temporary element to resolve the color to rgb
        const el = document.createElement("div");
        el.style.color = raw;
        document.body.appendChild(el);
        const resolved = getComputedStyle(el).color;
        document.body.removeChild(el);
        return resolved || "#000000";
    };
    return {
        primary: resolve("--color-primary"),
        background: resolve("--color-base-100"),
        text: resolve("--color-base-content"),
        danger: resolve("--color-error"),
        border: resolve("--color-base-300"),
    };
}

export function StripeProvider({
    children,
    clientSecret,
}: StripeProviderProps) {
    const stripe = useMemo(() => getStripe(), []);

    // Resolve theme colors synchronously to avoid re-mounting Elements
    const appearance: Appearance = useMemo(() => {
        const colors = getResolvedThemeColors() ?? {
            primary: "#233876",
            background: "#ffffff",
            text: "#18181b",
            danger: "#ef4444",
            border: "#e4e4e7",
        };
        return {
            theme: "stripe",
            variables: {
                colorPrimary: colors.primary,
                colorBackground: colors.background,
                colorText: colors.text,
                colorDanger: colors.danger,
                fontFamily: "inherit",
                borderRadius: "0px",
                spacingUnit: "4px",
            },
            rules: {
                ".Input": {
                    border: `1px solid ${colors.border}`,
                    boxShadow: "none",
                },
                ".Input:focus": {
                    border: `1px solid ${colors.primary}`,
                    boxShadow: `0 0 0 2px ${colors.primary}33`,
                },
                ".Label": {
                    fontWeight: "500",
                },
            },
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const options = clientSecret
        ? {
              clientSecret,
              appearance,
          }
        : { appearance };

    if (!stripe) {
        return (
            <div className="alert alert-error">
                <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                <span>Stripe is not configured. Please contact support.</span>
            </div>
        );
    }

    return (
        <Elements stripe={stripe} options={options}>
            {children}
        </Elements>
    );
}
