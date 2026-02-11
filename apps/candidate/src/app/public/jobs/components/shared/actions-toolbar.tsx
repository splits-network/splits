"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ModalPortal } from "@splits-network/shared-ui";
import ApplicationWizardModal from "@/components/application-wizard-modal";
import type { Job } from "../../types";
import { getCompanyName } from "../../types";

interface ActionsToolbarProps {
    item: Job;
    variant?: "icon-only" | "descriptive";
}

export default function ActionsToolbar({
    item,
    variant = "icon-only",
}: ActionsToolbarProps) {
    const router = useRouter();
    const { isSignedIn, getToken } = useAuth();
    const [showWizard, setShowWizard] = useState(false);
    const [hasActiveRecruiter, setHasActiveRecruiter] = useState(false);
    const [existingApplication, setExistingApplication] = useState<any>(null);

    const companyName = getCompanyName(item);

    // Fetch auth-related data (recruiter status, existing application)
    const fetchAuthData = useCallback(async () => {
        if (!isSignedIn) return;
        try {
            const token = await getToken();
            if (!token) return;
            const authClient = createAuthenticatedClient(token);
            const [recruitersResponse, applicationsResponse] =
                await Promise.all([
                    authClient.get<{ data: any[] }>("/recruiter-candidates"),
                    authClient.get<{ data: any[] }>("/applications"),
                ]);

            setHasActiveRecruiter(
                recruitersResponse.data && recruitersResponse.data.length > 0,
            );

            const applications = applicationsResponse.data || [];
            setExistingApplication(
                applications.find(
                    (app: any) =>
                        app.job_id === item.id &&
                        !["rejected", "withdrawn"].includes(app.stage),
                ) || null,
            );
        } catch (err) {
            console.error("Failed to fetch auth data:", err);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSignedIn, item.id]);

    useEffect(() => {
        fetchAuthData();
    }, [fetchAuthData]);

    const handleViewFull = () => {
        router.push(`/public/jobs/${item.id}`);
    };

    // Determine apply button config based on auth state
    const getButtonConfig = () => {
        if (!isSignedIn) {
            return {
                text: "Get Started",
                icon: "fa-rocket",
                action: () => {
                    window.location.href = `/sign-in?redirect=${encodeURIComponent(`/public/jobs/${item.id}`)}`;
                },
            };
        }

        if (existingApplication) {
            return {
                text: "Already Applied",
                icon: "fa-check-circle",
                action: () => {},
                disabled: true,
            };
        }

        return {
            text: hasActiveRecruiter ? "Send to Recruiter" : "Apply Now",
            icon: hasActiveRecruiter ? "fa-user-tie" : "fa-paper-plane",
            action: () => setShowWizard(true),
        };
    };

    const buttonConfig = getButtonConfig();

    if (variant === "descriptive") {
        return (
            <>
                <div className="flex items-center gap-2">
                    <button
                        className={`btn ${buttonConfig.disabled ? "btn-disabled" : "btn-primary"} btn-sm`}
                        onClick={buttonConfig.action}
                        disabled={buttonConfig.disabled}
                    >
                        <i
                            className={`fa-duotone fa-regular ${buttonConfig.icon} mr-1`}
                        />
                        {buttonConfig.text}
                    </button>
                    <button className="btn btn-outline btn-sm">
                        <i className="fa-duotone fa-regular fa-bookmark mr-1" />
                        Save
                    </button>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={handleViewFull}
                    >
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square mr-1" />
                        Full Page
                    </button>
                </div>

                <ModalPortal>
                    {showWizard && (
                        <ApplicationWizardModal
                            jobId={item.id}
                            jobTitle={item.title}
                            companyName={companyName}
                            onClose={() => setShowWizard(false)}
                            onSuccess={() => {
                                setShowWizard(false);
                                fetchAuthData();
                            }}
                        />
                    )}
                </ModalPortal>
            </>
        );
    }

    // Icon-only variant for sidebar header
    return (
        <>
            <div className="flex items-center gap-1">
                <button
                    className={`btn ${buttonConfig.disabled ? "btn-disabled" : "btn-primary"}`}
                    onClick={buttonConfig.action}
                    disabled={buttonConfig.disabled}
                    title={buttonConfig.text}
                >
                    <i
                        className={`fa-duotone fa-regular ${buttonConfig.icon}`}
                    />
                    {buttonConfig.text}
                </button>
                <button className="btn btn-sm btn-ghost" title="Save">
                    <i className="fa-duotone fa-regular fa-bookmark" />
                </button>
                <button
                    className="btn btn-sm btn-ghost"
                    onClick={handleViewFull}
                    title="View full job"
                >
                    <i className="fa-duotone fa-regular fa-arrow-up-right-from-square" />
                </button>
            </div>

            <ModalPortal>
                {showWizard && (
                    <ApplicationWizardModal
                        jobId={item.id}
                        jobTitle={item.title}
                        companyName={companyName}
                        onClose={() => setShowWizard(false)}
                        onSuccess={() => {
                            setShowWizard(false);
                            fetchAuthData();
                        }}
                    />
                )}
            </ModalPortal>
        </>
    );
}

