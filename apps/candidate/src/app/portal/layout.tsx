import { PortalLayoutClient } from "./layout-client";

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <PortalLayoutClient>{children}</PortalLayoutClient>;
}
