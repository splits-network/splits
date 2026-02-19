import { Sidebar } from "@/components/sidebar";
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
            <div className="lg:ml-64 min-h-screen">
                <main className="p-2">{children}</main>
            </div>
        </AuthenticatedLayoutClient>
    );
}
