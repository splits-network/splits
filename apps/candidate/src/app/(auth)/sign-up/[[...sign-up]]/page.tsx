'use client';

import { useSignUp, useAuth } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { createAuthenticatedClient } from '@/lib/api-client';

export default function SignUpPage() {
    const { getToken } = useAuth();
    const { isLoaded, signUp, setActive } = useSignUp();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Get redirect parameter (from invitation or other flow) and store in state
    // so it persists through the entire sign-up flow even if URL changes
    const [redirectUrl] = useState(() => searchParams.get('redirect_url'));
    const isFromInvitation = redirectUrl?.includes('/invitation/');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        setError('');
        setIsLoading(true);

        try {
            await signUp.create({
                emailAddress: email,
                password,
                firstName,
                lastName,
            });

            // Send email verification code
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

            setPendingVerification(true);
        } catch (err: any) {
            setError(err.errors?.[0]?.message || 'Failed to create account');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerification = async (e: FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        setError('');
        setIsLoading(true);

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (completeSignUp.status === 'complete') {
                await setActive({ session: completeSignUp.createdSessionId });

                // Create user in our database immediately using Clerk data
                try {
                    const user = {
                        id: completeSignUp.createdUserId,
                        email: completeSignUp.emailAddress,
                        firstName: completeSignUp.firstName,
                        lastName: completeSignUp.lastName,
                    }

                    if (user) {

                        const token = await getToken();
                        if (!token) {
                            throw new Error('Failed to get auth token');
                        }
                        // Create authenticated API client with session token
                        const apiClient = createAuthenticatedClient(token);

                        // Create user record in our identity service using V2 registration endpoint
                        const newUser = await apiClient.post('/users/register', {
                            clerk_user_id: user.id,
                            email: user.email,
                            name: `${user.firstName || firstName} ${user.lastName || lastName}`.trim(),
                        });

                        console.log('User created successfully in identity service', newUser);

                        // Check ATS service for existing candidates with this email
                        const candidate = await apiClient.get(`/candidates`, {
                            params: {
                                email: encodeURIComponent(email)
                            }
                        });
                        if (candidate.data && candidate.data.length > 0) {
                            await apiClient.patch(`/candidates/${candidate.id}`, {
                                user_id: newUser.data.id,
                            });
                        } else {
                            await apiClient.post('/candidates', {
                                user_id: newUser.data.id,
                                email: user.email,
                                full_name: `${user.firstName || firstName} ${user.lastName || lastName}`.trim(),
                                created_by_user_id: newUser.data.id,
                            });

                        }

                        console.log('Candidate profile setup completed');
                    }
                } catch (userCreationError) {
                    // Log error but don't block the flow - webhook will catch this later
                    console.error('Failed to create user in database (webhook will handle):', userCreationError);
                }

                router.push(redirectUrl || '/portal/dashboard');
            } else {
                setError('Verification incomplete. Please try again.');
            }
        } catch (err: any) {
            setError(err.errors?.[0]?.message || 'Invalid verification code');
        } finally {
            setIsLoading(false);
        }
    };

    const signUpWithOAuth = (provider: 'oauth_google' | 'oauth_github' | 'oauth_microsoft') => {
        if (!isLoaded) return;

        signUp.authenticateWithRedirect({
            strategy: provider,
            redirectUrl: '/sso-callback',
            redirectUrlComplete: redirectUrl || '/portal/dashboard',
        });
    };

    if (pendingVerification) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
                <div className="card w-full max-w-md bg-base-100 shadow">
                    <div className="card-body">
                        <h2 className="card-title text-2xl font-bold justify-center mb-6">
                            Verify Your Email
                        </h2>

                        <div className="alert alert-info mb-4">
                            <i className="fa-solid fa-envelope"></i>
                            <span>We sent a verification code to {email}</span>
                        </div>

                        {error && (
                            <div className="alert alert-error mb-4">
                                <i className="fa-solid fa-circle-exclamation"></i>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleVerification} className="space-y-4">
                            <div id="clerk-captcha"></div>
                            <div className="fieldset">
                                <label className="label">Verification Code</label>
                                <input
                                    type="text"
                                    placeholder="123456"
                                    className="input w-full text-center text-2xl tracking-widest"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    maxLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-full"
                                disabled={isLoading || !isLoaded}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading loading-spinner"></span>
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify Email'
                                )}
                            </button>
                        </form>

                        <button
                            onClick={() => setPendingVerification(false)}
                            className="btn btn-ghost btn-sm w-full mt-2"
                        >
                            Back to sign up
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
            <div className="card w-full max-w-md bg-base-100 shadow">
                <div className="card-body">
                    <div className="text-center mb-6">
                        <i className="fa-solid fa-briefcase text-4xl text-primary mb-2"></i>
                        <h2 className="card-title text-2xl font-bold justify-center">
                            {isFromInvitation ? 'Complete Your Invitation' : 'Start Your Job Search'}
                        </h2>
                        <p className="text-sm text-base-content/70">
                            {isFromInvitation
                                ? 'Create your account to review your recruiter invitation'
                                : 'Create your free account in seconds'}
                        </p>
                    </div>

                    {isFromInvitation && (
                        <div className="alert alert-info mb-4">
                            <i className="fa-solid fa-envelope"></i>
                            <span>You've been invited by a recruiter. Sign up to continue.</span>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-error mb-4">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Clerk CAPTCHA widget container - required for bot protection */}
                        <div id="clerk-captcha"></div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="fieldset">
                                <label className="label">First Name</label>
                                <input
                                    type="text"
                                    placeholder="John"
                                    className="input w-full"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="fieldset">
                                <label className="label">Last Name</label>
                                <input
                                    type="text"
                                    placeholder="Doe"
                                    className="input w-full"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="fieldset">
                            <label className="label">Email</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="input w-full"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="fieldset">
                            <label className="label">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="input w-full"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                minLength={8}
                            />
                            <label className="label">
                                <span className="label-text-alt">Must be at least 8 characters</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={isLoading || !isLoaded}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading loading-spinner"></span>
                                    Creating account...
                                </>
                            ) : (
                                'Create Free Account'
                            )}
                        </button>
                    </form>

                    <div className="divider">OR</div>

                    <div className="space-y-2">
                        <button
                            onClick={() => signUpWithOAuth('oauth_google')}
                            className="btn btn-outline w-full"
                            disabled={!isLoaded}
                        >
                            <i className="fa-brands fa-google"></i>
                            Continue with Google
                        </button>
                        <button
                            onClick={() => signUpWithOAuth('oauth_github')}
                            className="btn btn-outline w-full"
                            disabled={!isLoaded}
                        >
                            <i className="fa-brands fa-github"></i>
                            Continue with GitHub
                        </button>
                        <button
                            onClick={() => signUpWithOAuth('oauth_microsoft')}
                            className="btn btn-outline w-full"
                            disabled={!isLoaded}
                        >
                            <i className="fa-brands fa-microsoft"></i>
                            Continue with Microsoft
                        </button>
                    </div>

                    <p className="text-center text-sm mt-4">
                        Already have an account?{' '}
                        <Link
                            href={redirectUrl ? `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}` : '/sign-in'}
                            className="link link-primary"
                        >
                            Sign in
                        </Link>
                    </p>

                    <p className="text-center text-xs text-base-content/60 mt-4">
                        By signing up, you agree to our{' '}
                        <Link href="/terms" className="link">Terms of Service</Link>
                        {' '}and{' '}
                        <Link href="/privacy" className="link">Privacy Policy</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
