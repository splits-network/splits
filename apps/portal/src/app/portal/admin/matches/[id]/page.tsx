import MatchDetailClient from "./match-detail-client";

export const metadata = {
    title: "Match Detail | Admin",
    description: "Detailed match analysis",
};

export default async function MatchDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <MatchDetailClient matchId={id} />;
}
