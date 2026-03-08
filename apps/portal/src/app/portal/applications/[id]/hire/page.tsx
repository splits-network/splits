import HireClient from "./hire-client";

export default async function HirePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <HireClient applicationId={id} />;
}
