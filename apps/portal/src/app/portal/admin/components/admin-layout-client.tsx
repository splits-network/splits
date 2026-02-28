"use client";

import { ReactNode } from "react";
import { AdminConfirmProvider } from "./admin-confirm-provider";

interface AdminLayoutClientProps {
    children: ReactNode;
}

export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
    return <AdminConfirmProvider>{children}</AdminConfirmProvider>;
}
