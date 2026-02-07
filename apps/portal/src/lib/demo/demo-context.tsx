"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface DemoModeContextType {
    isDemoMode: boolean;
    setDemoMode: (enabled: boolean) => void;
    demoFeature: string | null;
    setDemoFeature: (feature: string | null) => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(
    undefined,
);

interface DemoModeProviderProps {
    children: React.ReactNode;
}

export function DemoModeProvider({ children }: DemoModeProviderProps) {
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [demoFeature, setDemoFeature] = useState<string | null>(null);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        // Check for demo mode on mount
        const urlParams = new URLSearchParams(window.location.search);
        const demoParam = urlParams.get("demo");
        const featureParam = urlParams.get("feature");
        const storageValue = localStorage.getItem("splits-demo-mode");

        const initialDemoMode = demoParam === "true" || storageValue === "true";
        const initialFeature =
            featureParam || localStorage.getItem("splits-demo-feature");

        setIsDemoMode(initialDemoMode);
        setDemoFeature(initialFeature);
        setHydrated(true);
    }, []);

    const setDemoMode = (enabled: boolean) => {
        setIsDemoMode(enabled);
        localStorage.setItem("splits-demo-mode", enabled.toString());

        if (!enabled) {
            setDemoFeature(null);
            localStorage.removeItem("splits-demo-feature");
        }
    };

    const handleSetDemoFeature = (feature: string | null) => {
        setDemoFeature(feature);
        if (feature) {
            localStorage.setItem("splits-demo-feature", feature);
        } else {
            localStorage.removeItem("splits-demo-feature");
        }
    };

    // Prevent hydration mismatch
    if (!hydrated) {
        return (
            <DemoModeContext.Provider
                value={{
                    isDemoMode: false,
                    setDemoMode: () => {},
                    demoFeature: null,
                    setDemoFeature: () => {},
                }}
            >
                {children}
            </DemoModeContext.Provider>
        );
    }

    return (
        <DemoModeContext.Provider
            value={{
                isDemoMode,
                setDemoMode,
                demoFeature,
                setDemoFeature: handleSetDemoFeature,
            }}
        >
            {children}
        </DemoModeContext.Provider>
    );
}

export function useDemoMode() {
    const context = useContext(DemoModeContext);
    if (context === undefined) {
        throw new Error("useDemoMode must be used within a DemoModeProvider");
    }
    return context;
}

// Hook to detect if current page/feature is in demo mode
export function useDemoFeature(featureName: string) {
    const { isDemoMode, demoFeature } = useDemoMode();

    // Check URL for demo parameters
    const [isFeatureDemo, setIsFeatureDemo] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const urlParams = new URLSearchParams(window.location.search);
        const urlDemo = urlParams.get("demo") === "true";
        const urlFeature = urlParams.get("feature");

        // Demo mode if:
        // 1. Global demo mode is on, OR
        // 2. URL has demo=true and feature matches, OR
        // 3. URL path includes /demo/<feature>
        const pathDemo = window.location.pathname.includes(
            `/demo/${featureName}`,
        );
        const featureDemo =
            urlDemo && (urlFeature === featureName || !urlFeature);

        setIsFeatureDemo(isDemoMode || featureDemo || pathDemo);
    }, [isDemoMode, demoFeature, featureName]);

    return isFeatureDemo;
}
