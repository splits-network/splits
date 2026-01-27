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

export function StripeProvider({
    children,
    clientSecret,
}: StripeProviderProps) {
    const stripe = useMemo(() => getStripe(), []);

    // DaisyUI-compatible appearance
    const appearance: Appearance = {
        theme: "stripe",
        variables: {
            colorPrimary: "oklch(var(--p))",
            colorBackground: "oklch(var(--b1))",
            colorText: "oklch(var(--bc))",
            colorDanger: "oklch(var(--er))",
            fontFamily: "inherit",
            borderRadius: "0.5rem",
            spacingUnit: "4px",
        },
        rules: {
            ".Input": {
                border: "1px solid oklch(var(--bc) / 0.2)",
                boxShadow: "none",
            },
            ".Input:focus": {
                border: "1px solid oklch(var(--p))",
                boxShadow: "0 0 0 2px oklch(var(--p) / 0.2)",
            },
            ".Label": {
                fontWeight: "500",
            },
        },
    };

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
