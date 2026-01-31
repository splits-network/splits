"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { ApiResponse } from "@splits-network/shared-api-client";
import { useRouter } from "next/navigation";
import { startChatConversation } from "@/lib/chat-start";
import { useToast } from "@/lib/toast-context";
import {
  StatCard,
  StatCardGrid,
  ContentCard,
  EmptyState,
} from "@/components/ui/cards";
import {
  calculateProfileCompleteness,
  type ProfileCompleteness,
} from "@/lib/utils/profile-completeness";
import { ProfileCompletionBanner } from "@/components/profile-completion-banner";

interface DashboardStats {
  applications: number;
  interviews: number;
  offers: number;
  active_relationships: number;
}

interface RecentApplication {
  id: string;
  job_title: string;
  company: string;
  status: string;
  applied_at: string;
  recruiter_user_id?: string | null;
}

interface Application {
  id: string;
  stage: string;
  created_at: string;
  job?: {
    title?: string;
    company?: {
      name?: string;
    };
  };
  recruiter?: {
    user?: {
      id?: string;
    };
  };
}

interface RecruiterRelationship {
  id: string;
  status: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  location?: string;
  skills?: string[];
  years_of_experience?: number;
  desired_salary?: string;
  documents?: any[];
}

export default function DashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const toast = useToast();

  const [stats, setStats] = useState<DashboardStats>({
    applications: 0,
    interviews: 0,
    offers: 0,
    active_relationships: 0,
  });
  const [recentApplications, setRecentApplications] = useState<
    RecentApplication[]
  >([]);
  const [profileCompletion, setProfileCompletion] =
    useState<ProfileCompleteness | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [startingChatId, setStartingChatId] = useState<string | null>(null);

  // Load stats and applications data
  useEffect(() => {
    async function loadDashboardData() {
      try {
        const token = await getToken();
        if (!token) return;

        const client = createAuthenticatedClient(token);

        // Fetch applications with job data included
        const applicationsResponse = await client.get<
          ApiResponse<Application[]>
        >("/applications", { params: { include: "job,company,recruiter" } });
        const allApplications = applicationsResponse.data || [];

        // Calculate stats from applications
        const newStats = {
          applications: allApplications.length,
          interviews: allApplications.filter(
            (app) =>
              app.stage === "interview" || app.stage === "final_interview",
          ).length,
          offers: allApplications.filter((app) => app.stage === "offer").length,
          active_relationships: 0,
        };

        // Fetch recruiter relationships
        try {
          const recruitersResponse = await client.get<
            ApiResponse<RecruiterRelationship[]>
          >("/recruiter-candidates");
          const relationships = recruitersResponse.data || [];
          newStats.active_relationships = relationships.filter(
            (rel) => rel.status === "active",
          ).length;
        } catch (err) {
          console.error("Failed to load recruiter relationships:", err);
        }

        setStats(newStats);
        setStatsLoading(false);

        // Get recent applications (last 5)
        const recent = allApplications
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )
          .slice(0, 5)
          .map((app) => ({
            id: app.id,
            job_title: app.job?.title || "Unknown Position",
            company: app.job?.company?.name || "Unknown Company",
            status: app.stage || "applied",
            applied_at: app.created_at,
            recruiter_user_id: app.recruiter?.user?.id || null,
          }));

        setRecentApplications(recent);
        setApplicationsLoading(false);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setLoadError(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard data",
        );
        setLoading(false);
        setStatsLoading(false);
        setApplicationsLoading(false);
      }
    }

    loadDashboardData();
  }, [getToken]);

  // Load profile completion separately
  useEffect(() => {
    async function loadProfileCompletion() {
      try {
        const token = await getToken();
        if (!token) return;

        const client = createAuthenticatedClient(token);

        // Fetch candidate profile
        const candidateResponse = await client.get<ApiResponse<Candidate[]>>(
          "/candidates",
          { params: { limit: 1 } },
        );
        const candidates = candidateResponse.data || [];

        if (candidates.length > 0) {
          const profile = candidates[0];
          const completion = calculateProfileCompleteness(profile);
          setProfileCompletion(completion);
        }

        setProfileLoading(false);
      } catch (error) {
        console.error("Failed to load profile completion:", error);
        setProfileLoading(false);
      }
    }

    loadProfileCompletion();
  }, [getToken]);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in space-y-6 ">
      {/* Profile Completion Banner - shows when onboarding was skipped */}
      <ProfileCompletionBanner />

      {/* Error Alert */}
      {loadError && (
        <div className="alert alert-error">
          <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
          <div>
            <h3 className="font-bold">Failed to load dashboard data</h3>
            <div className="text-sm">{loadError}</div>
          </div>
        </div>
      )}

      {/* Welcome Header - Solid Background (No Gradient) */}
      <h1 className="text-3xl md:text-4xl font-bold mb-2">
        Welcome back, {user?.firstName || "there"}!
      </h1>
      <p className="text-lg text-primary-content/90">
        Here's an overview of your job search
      </p>

      {/* Stats Grid */}
      <div className="card bg-base-200">
        <StatCardGrid className="bg-base-100 stats-vertical lg-stats-horizontal m-2 shadow-lg">
          <StatCard
            value={stats.applications}
            title="Applications"
            description="Total submitted"
            icon="fa-file-lines"
            color="primary"
            href="/portal/applications"
            loading={statsLoading}
            animate={true}
          />
          <StatCard
            value={stats.interviews}
            title="Interviews"
            description="In progress"
            icon="fa-calendar-check"
            color="success"
            href="/portal/applications"
            loading={statsLoading}
            animate={true}
          />
          <StatCard
            value={stats.offers}
            title="Offers"
            description="Received"
            icon="fa-trophy"
            color="warning"
            href="/portal/applications"
            loading={statsLoading}
            animate={true}
          />
          <StatCard
            value={stats.active_relationships}
            title="Active Recruiters"
            description="Working with you"
            icon="fa-users"
            color="info"
            href="/portal/recruiters"
            loading={statsLoading}
            animate={true}
          />
        </StatCardGrid>
        <div className="p-4 pt-0">
          {/* Profile Completion */}
          {profileCompletion && (
            <div>
              <div className="flex flex-col md:flex-row items-center">
                <div className="flex items-center gap-6 mb-4 grow">
                  <div
                    className="radial-progress text-primary"
                    style={
                      {
                        "--value": profileCompletion.percentage,
                      } as React.CSSProperties
                    }
                    role="progressbar"
                  >
                    <span className="text-2xl font-bold">
                      {profileCompletion.percentage}%
                    </span>
                  </div>
                  <div className="">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">Completion Level:</span>
                      <span
                        className={`badge ${
                          profileCompletion.tier === "complete"
                            ? "badge-success"
                            : profileCompletion.tier === "strong"
                              ? "badge-info"
                              : profileCompletion.tier === "basic"
                                ? "badge-warning"
                                : "badge-error"
                        }`}
                      >
                        {profileCompletion.tier.charAt(0).toUpperCase() +
                          profileCompletion.tier.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-base-content/70">
                      A complete profile helps you stand out to recruiters
                    </p>
                  </div>
                </div>

                {profileCompletion.missingFields.length > 0 && (
                  <div className="mb-4 grow">
                    <p className="text-sm font-semibold mb-2">
                      Top Priorities:
                    </p>
                    <ul className="space-y-1">
                      {profileCompletion.missingFields
                        .slice(0, 3)
                        .map((field, index) => (
                          <li
                            key={index}
                            className="text-sm text-base-content/70 flex items-center gap-2"
                          >
                            <i className="fa-duotone fa-regular fa-circle-dot text-primary text-xs"></i>
                            {field.label}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Link href="/portal/profile" className="btn btn-primary btn-sm">
                  Complete Profile
                  <i className="fa-duotone fa-regular fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <ContentCard
          title="Recent Applications"
          icon="fa-clock-rotate-left"
          headerActions={
            <Link
              href="/portal/applications"
              className="link link-primary text-sm"
            >
              View All
            </Link>
          }
          loading={applicationsLoading}
        >
          {recentApplications.length > 0 ? (
            <div className="flex flex-col gap-4">
              {recentApplications.map((app) => {
                const canChat = Boolean(app.recruiter_user_id);
                const chatDisabledReason = canChat
                  ? null
                  : "Recruiter isn't linked to a user yet.";
                return (
                  <Link key={app.id} href={`/portal/applications/${app.id}`}>
                    <div className="p-4 bg-base-100 rounded-xl hover:bg-base-200/70 transition-all cursor-pointer group">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                            {app.job_title}
                          </h3>
                          <p className="text-sm text-base-content/70 mb-2">
                            {app.company}
                          </p>
                        </div>
                        <span title={chatDisabledReason || undefined}>
                          <button
                            className="btn btn-ghost btn-sm btn-square"
                            disabled={!canChat || startingChatId === app.id}
                            onClick={async (event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              if (!app.recruiter_user_id) {
                                return;
                              }
                              try {
                                setStartingChatId(app.id);
                                const conversationId =
                                  await startChatConversation(
                                    getToken,
                                    app.recruiter_user_id,
                                    { application_id: app.id },
                                  );
                                router.push(
                                  `/portal/messages?conversationId=${conversationId}`,
                                );
                              } catch (err: any) {
                                console.error(
                                  "Failed to start chat:",
                                  err,
                                );
                                toast.error(
                                  err?.message || "Failed to start chat",
                                );
                              } finally {
                                setStartingChatId(null);
                              }
                            }}
                          >
                            {startingChatId === app.id ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              <i className="fa-duotone fa-regular fa-messages"></i>
                            )}
                          </button>
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="badge badge-primary badge-sm">
                          {app.status}
                        </span>
                        <span className="text-xs text-base-content/70">
                          Applied{" "}
                          {new Date(app.applied_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon="fa-inbox"
              title="No applications yet"
              description="Start applying to jobs to see them here"
              size="sm"
              card={false}
              action={
                <Link href="/public/jobs" className="btn btn-primary btn-sm">
                  <i className="fa-duotone fa-regular fa-search"></i>
                  Browse Jobs
                </Link>
              }
            />
          )}
        </ContentCard>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <ContentCard title="Quick Actions" icon="fa-bolt">
            <div className="space-y-3">
              <Link
                href="/public/jobs"
                className="btn btn-primary btn-block justify-start"
              >
                <i className="fa-duotone fa-regular fa-search"></i>
                Browse Jobs
              </Link>
              <Link
                href="/portal/profile"
                className="btn btn-outline btn-block justify-start"
              >
                <i className="fa-duotone fa-regular fa-user"></i>
                Update Profile
              </Link>
              <Link
                href="/portal/documents"
                className="btn btn-outline btn-block justify-start"
              >
                <i className="fa-duotone fa-regular fa-upload"></i>
                Upload Resume
              </Link>
              <Link
                href="/portal/applications"
                className="btn btn-outline btn-block justify-start"
              >
                <i className="fa-duotone fa-regular fa-list"></i>
                View Applications
              </Link>
            </div>
          </ContentCard>
        </div>
      </div>
    </div>
  );
}

