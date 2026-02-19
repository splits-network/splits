"use client";

import { createContext, useContext, useCallback, useSyncExternalStore } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "splits-theme";
const LIGHT = "splits-light";
const DARK = "splits-dark";

type Theme = typeof LIGHT | typeof DARK;

// ─── External store backed by localStorage + DOM attribute ───────────────────

let listeners: Array<() => void> = [];

function getSnapshot(): Theme {
    if (typeof document === "undefined") return LIGHT;
    return (document.documentElement.getAttribute("data-theme") as Theme) || LIGHT;
}

function getServerSnapshot(): Theme {
    return LIGHT;
}

function subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
        listeners = listeners.filter((l) => l !== listener);
    };
}

function setThemeValue(next: Theme) {
    document.documentElement.setAttribute("data-theme", next);
    try {
        localStorage.setItem(STORAGE_KEY, next);
    } catch {
        // localStorage may be unavailable (private browsing, quota)
    }
    listeners.forEach((l) => l());
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface ThemeContextValue {
    theme: Theme;
    setTheme: (t: Theme) => void;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const setTheme = useCallback((t: Theme) => setThemeValue(t), []);
    const toggleTheme = useCallback(
        () => setThemeValue(theme === DARK ? LIGHT : DARK),
        [theme],
    );

    return (
        <ThemeContext value={{ theme, setTheme, toggleTheme, isDark: theme === DARK }}>
            {children}
        </ThemeContext>
    );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme must be used within a <ThemeProvider>");
    }
    return ctx;
}
