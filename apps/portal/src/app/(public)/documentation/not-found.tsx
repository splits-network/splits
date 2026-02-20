import Link from "next/link";

export default function DocumentationNotFound() {
    return (
        <div className="space-y-6">
            <div className="card bg-base-200 border border-base-300">
                <div className="card-body space-y-4">
                    <h1 className="text-2xl font-semibold">Page not found</h1>
                    <p className="text-base text-base-content/70">
                        The documentation page you are looking for does not
                        exist or has moved.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/documentation" className="btn btn-primary">
                            Documentation Home
                        </Link>
                        <Link
                            href="/documentation/getting-started"
                            className="btn btn-ghost"
                        >
                            Getting Started
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
