import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

export default async function CandidatesPage() {
    let candidates: any[] = [];

    try {
        const response = await apiClient.get('/candidates');
        candidates = response.data || [];
    } catch (error) {
        console.error('Failed to load candidates:', error);
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Candidates</h1>
                    <p className="text-base-content/70 mt-1">
                        View and manage all your submitted candidates
                    </p>
                </div>
            </div>

            {candidates.length === 0 ? (
                <div className="card bg-base-100 shadow-sm">
                    <div className="card-body items-center text-center py-12">
                        <i className="fa-solid fa-users text-6xl text-base-content/20"></i>
                        <h3 className="text-xl font-semibold mt-4">No Candidates Yet</h3>
                        <p className="text-base-content/70 mt-2">
                            Submit candidates to roles to see them appear here
                        </p>
                    </div>
                </div>
            ) : (
                <div className="card bg-base-100 shadow-sm">
                    <div className="card-body">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Candidate</th>
                                        <th>Email</th>
                                        <th>LinkedIn</th>
                                        <th>Added</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {candidates.map((candidate) => (
                                        <tr key={candidate.id} className="hover">
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar placeholder">
                                                        <div className="bg-primary/10 text-primary rounded-full w-10">
                                                            <span className="text-sm">{candidate.full_name[0]}</span>
                                                        </div>
                                                    </div>
                                                    <div className="font-semibold">{candidate.full_name}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <a href={`mailto:${candidate.email}`} className="link link-hover text-sm">
                                                    {candidate.email}
                                                </a>
                                            </td>
                                            <td>
                                                {candidate.linkedin_url ? (
                                                    <a
                                                        href={candidate.linkedin_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-ghost btn-xs"
                                                    >
                                                        <i className="fa-brands fa-linkedin"></i>
                                                    </a>
                                                ) : (
                                                    <span className="text-base-content/40 text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="text-sm text-base-content/70">
                                                {formatDate(candidate.created_at)}
                                            </td>
                                            <td>
                                                <Link
                                                    href={`/candidates/${candidate.id}`}
                                                    className="btn btn-ghost btn-sm"
                                                >
                                                    View
                                                    <i className="fa-solid fa-arrow-right ml-1"></i>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
