"use client";

import { DrawerProvider } from "@/contexts";

export default function JobsBaselLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DrawerProvider>{children}</DrawerProvider>;
}
