import { currentUser } from '@clerk/nextjs/server';
import { UserButtonClient } from './user-button-client';

export default async function SecurePage() {
    const user = await currentUser();

    return (
        <div className="flex min-h-screen items-center justify-center p-6">
            <div className="card bg-base-100 shadow-xl w-full max-w-md">
                <div className="card-body gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">
                                Welcome, {user?.firstName ?? 'Admin'}
                            </h1>
                            <p className="text-sm text-base-content/60 mt-1">
                                Admin dashboard coming soon.
                            </p>
                        </div>
                        <UserButtonClient />
                    </div>

                    <div className="divider my-0" />

                    <div className="alert">
                        <i className="fa-duotone fa-regular fa-hammer-crash text-primary" />
                        <div>
                            <p className="font-semibold text-sm">Under Construction</p>
                            <p className="text-xs text-base-content/60">
                                Admin tools are being migrated. Check back soon.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
