"use client";

import { useEffect, ReactNode } from "react";
import { usePageTitle } from "@/contexts/page-title-context";

interface PageTitleProps {
    title: string;
    subtitle?: string;
    children?: ReactNode;
}

export function PageTitle({ title, subtitle, children }: PageTitleProps) {
    const { setTitle, setChildren } = usePageTitle();

    useEffect(() => {
        setTitle(title, subtitle);
        return () => setTitle("");
    }, [title, subtitle, setTitle]);

    useEffect(() => {
        setChildren(children);
        return () => setChildren(null);
    }, [children, setChildren]);

    return null;
}
