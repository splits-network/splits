"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from "react";

interface PageTitleContextType {
    title: string;
    subtitle: string;
    setTitle: (title: string, subtitle?: string) => void;
}

const PageTitleContext = createContext<PageTitleContextType | undefined>(
    undefined,
);

export function PageTitleProvider({ children }: { children: ReactNode }) {
    const [title, setTitleState] = useState("");
    const [subtitle, setSubtitleState] = useState("");

    const setTitle = useCallback((newTitle: string, newSubtitle?: string) => {
        setTitleState(newTitle);
        setSubtitleState(newSubtitle || "");
    }, []);

    return (
        <PageTitleContext.Provider value={{ title, subtitle, setTitle }}>
            {children}
        </PageTitleContext.Provider>
    );
}

export function usePageTitle() {
    const context = useContext(PageTitleContext);
    if (!context) {
        throw new Error("usePageTitle must be used within a PageTitleProvider");
    }
    return context;
}
