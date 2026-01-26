'use client';

/**
 * Welcome Step - Step 1 of Candidate Onboarding
 * Welcome message and name confirmation
 */

import { useOnboarding } from '../onboarding-provider';
import { useUser } from '@clerk/nextjs';

export function WelcomeStep() {
    const { state, updateProfileData } = useOnboarding();
    const { user } = useUser();

    // Initialize name from Clerk user if not already set
    const displayName = state.profileData.full_name || user?.fullName || user?.firstName || '';

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateProfileData({ full_name: e.target.value });
    };

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <i className="fa-duotone fa-regular fa-hand-wave text-4xl text-primary"></i>
                </div>
                <h2 className="text-2xl font-bold mb-2">
                    Welcome to Splits Network!
                </h2>
                <p className="text-base-content/70">
                    We're excited to help you find your next opportunity. Let's get your profile set up in just a few quick steps.
                </p>
            </div>

            {/* Name Input */}
            <div className="mx-auto">
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Your Name</legend>
                    <input 
                        type="text"
                        className="input w-full"
                        value={displayName}
                        onChange={handleNameChange}
                        placeholder="Enter your full name"
                    />
                    <p className="fieldset-label">
                        This is how recruiters will see your name
                    </p>
                </fieldset>
            </div>

            {/* What to Expect */}
            <div className="bg-base-200 rounded-lg p-4 mx-auto">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-clipboard-list text-primary"></i>
                    What we'll cover:
                </h3>
                <ul className="space-y-2 text-sm text-base-content/80">
                    <li className="flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-phone text-success w-5"></i>
                        Contact information (optional)
                    </li>
                    <li className="flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-file-lines text-info w-5"></i>
                        Resume upload (optional)
                    </li>
                    <li className="flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-sliders text-warning w-5"></i>
                        Job preferences (optional)
                    </li>
                </ul>
                <p className="text-xs text-base-content/60 mt-3">
                    All fields are optional. You can always complete or update them later.
                </p>
            </div>
        </div>
    );
}
