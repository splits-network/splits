import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { PortalHeader } from "@/components/portal-header";
import { AuthenticatedLayoutClient } from "./layout-client";
import { Footer } from "@/components/footer";

export default async function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    return (
        <AuthenticatedLayoutClient>
            <PortalHeader />
            <div className="drawer lg:drawer-open">
                <input
                    id="sidebar-drawer"
                    type="checkbox"
                    className="drawer-toggle"
                />
                <Sidebar />
                <div className="drawer-content flex flex-col min-h-[calc(100vh-4rem)]">
                    <main className="p-2 flex-1">{children}</main>
                </div>
            </div>
            <Footer />
        </AuthenticatedLayoutClient>
    );
}
