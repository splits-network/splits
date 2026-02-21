import { Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { LoadingState } from "@splits-network/shared-ui";
import { AuthenticatedLayoutClient } from "./layout-client";

// Auth is enforced by proxy.ts for all /portal/* routes — no redirect needed here.
export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthenticatedLayoutClient>
            <Sidebar />
            <div className="lg:ml-64 min-h-screen flex">
                <main className="p-2 flex-1 min-w-0 transition-all duration-300">
                    <Suspense fallback={<LoadingState message="Loading..." />}>
                        {children}
                    </Suspense>
                </main>
            </div>
        </AuthenticatedLayoutClient>
    );
}
