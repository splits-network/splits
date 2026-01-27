"use client";

import { useEffect } from "react";
import { usePageTitle } from "@/contexts/page-title-context";

interface PageTitleProps {
    title: string;
    subtitle?: string;
}

export function PageTitle({ title, subtitle }: PageTitleProps) {
    const { setTitle } = usePageTitle();

    useEffect(() => {
        setTitle(title, subtitle);
        return () => setTitle("");
    }, [title, subtitle, setTitle]);

    return null;
}
