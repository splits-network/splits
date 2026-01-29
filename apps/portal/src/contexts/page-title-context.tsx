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
    children: ReactNode;
    setTitle: (title: string, subtitle?: string) => void;
    setChildren: (children: ReactNode) => void;
}

const PageTitleContext = createContext<PageTitleContextType | undefined>(
    undefined,
);

export function PageTitleProvider({ children }: { children: ReactNode }) {
    const [title, setTitleState] = useState("");
    const [subtitle, setSubtitleState] = useState("");
    const [titleChildren, setTitleChildren] = useState<ReactNode>(null);

    const setTitle = useCallback((newTitle: string, newSubtitle?: string) => {
        setTitleState(newTitle);
        setSubtitleState(newSubtitle || "");
    }, []);

    const setChildren = useCallback((newChildren: ReactNode) => {
        setTitleChildren(newChildren);
    }, []);

    return (
        <PageTitleContext.Provider
            value={{
                title,
                subtitle,
                children: titleChildren,
                setTitle,
                setChildren,
            }}
        >
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
