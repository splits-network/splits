"use client";

/**
 * Quick-create calendar event modal — supports both standalone events
 * and application-linked interview scheduling.
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type {
    OAuthConnectionPublic,
    CalendarInfo,
    CalendarEvent,
} from "@splits-network/shared-types";
import { ModalPortal } from "@splits-network/shared-ui";
import { BaselWizardModal, BaselAlertBox } from "@splits-network/basel-ui";
import ApplicationSearch, {
    type ApplicationSearchResult,
} from "@/components/basel/scheduling/application-search";
import PlatformSelector, {
    type MeetingPlatform,
} from "@/components/basel/scheduling/platform-selector";

/* ─── Types ────────────────────────────────────────────────────────── */

interface CreateEventModalProps {
    onClose: () => void;
    onSuccess?: (event: CalendarEvent) => void;
    /** Pre-select a connection if already known */
    preselectedConnectionId?: string;
    /** Pre-fill date from slot click (YYYY-MM-DD) */
    prefillDate?: string;
    /** Pre-fill start time from slot click (HH:MM) */
    prefillStartTime?: string;
}

type Step = "details" | "confirm";

const STEPS: { key: Step; label: string }[] = [
    { key: "details", label: "Event Details" },
    { key: "confirm", label: "Confirm" },
];

/* ─── Component ────────────────────────────────────────────────────── */

export default function CreateEventModal({
    onClose,
    onSuccess,
    preselectedConnectionId,
    prefillDate,
    prefillStartTime,
}: CreateEventModalProps) {
    const { getToken } = useAuth();

    const [step, setStep] = useState<Step>("details");
    const [connections, setConnections] = useState<OAuthConnectionPublic[]>([]);
    const [calendars, setCalendars] = useState<CalendarInfo[]>([]);
    const [selectedConnection, setSelectedConnection] =
        useState<OAuthConnectionPublic | null>(null);
    const [selectedCalendar, setSelectedCalendar] =
        useState<CalendarInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    /* Form */
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(prefillDate ?? "");
    const [startTime, setStartTime] = useState(prefillStartTime ?? "09:00");
    const [duration, setDuration] = useState(60);
    const [timeZone] = useState(
        Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
    const [addVideo, setAddVideo] = useState(false);
    const [attendeeEmails, setAttendeeEmails] = useState("");

    /* Application linking */
    const [linkToApplication, setLinkToApplication] = useState(false);
    const [selectedApplication, setSelectedApplication] =
        useState<ApplicationSearchResult | null>(null);
    const [selectedPlatform, setSelectedPlatform] =
        useState<MeetingPlatform>("splits_video");
    const [showStageConfirm, setShowStageConfirm] = useState(false);
    const [stageConfirmPending, setStageConfirmPending] = useState(false);

    /* ── Fetch connections ── */
    const fetchConnections = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const res = (await client.get("/integrations/connections")) as {
                data: OAuthConnectionPublic[];
            };
            const calConns = (res.data ?? []).filter(
                (c) =>
                    (c.provider_slug.includes("calendar") ||
                        c.provider_slug.includes("combo")) &&
                    c.status === "active",
            );
            setConnections(calConns);

            const preselected = preselectedConnectionId
                ? calConns.find((c) => c.id === preselectedConnectionId)
                : null;
            const auto =
                preselected || (calConns.length === 1 ? calConns[0] : null);
            if (auto) {
                setSelectedConnection(auto);
                await fetchCalendars(auto.id, token);
            }
        } catch {
            setError("Failed to load calendar connections");
        } finally {
            setLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchCalendars = async (connectionId: string, token?: string) => {
        try {
            const t = token || (await getToken());
            if (!t) return;
            const client = createAuthenticatedClient(t);
            const res = (await client.get(
                `/integrations/calendar/${connectionId}/calendars`,
            )) as { data: CalendarInfo[] };
            const cals = res.data ?? [];
            setCalendars(cals);
            const primary = cals.find((c) => c.primary);
            if (primary) setSelectedCalendar(primary);
        } catch {
            setError("Failed to load calendars");
        }
    };

    useEffect(() => {
        fetchConnections();
    }, [fetchConnections]);

    const handleSelectConnection = async (conn: OAuthConnectionPublic) => {
        setSelectedConnection(conn);
        setCalendars([]);
        setSelectedCalendar(null);
        await fetchCalendars(conn.id);
    };

    /* ── Application linking handlers ── */
    const handleApplicationSelect = (app: ApplicationSearchResult) => {
        setSelectedApplication(app);
        setTitle(`Interview: ${app.candidateName} \u2014 ${app.jobTitle}`);
        setDuration(30);
        // Auto-add candidate email
        if (app.candidateEmail) {
            setAttendeeEmails((prev) => {
                const existing = prev
                    .split(",")
                    .map((e) => e.trim())
                    .filter(Boolean);
                if (existing.includes(app.candidateEmail)) return prev;
                return [...existing, app.candidateEmail]
                    .filter(Boolean)
                    .join(", ");
            });
        }
    };

    const handleLinkToggle = (checked: boolean) => {
        setLinkToApplication(checked);
        if (!checked) {
            setSelectedApplication(null);
            setTitle("");
            setDuration(60);
            setSelectedPlatform("splits_video");
        }
    };

    /* ── Stage promotion ── */
    const promoteToInterview = async (applicationId: string) => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        await client.patch(`/applications/${applicationId}`, {
            stage: "interview",
        });
    };

    /* ── Submit ── */
    const handleSubmit = async () => {
        if (!selectedConnection || !selectedCalendar || !date || !startTime)
            return;

        // Check if application needs stage promotion
        if (
            linkToApplication &&
            selectedApplication &&
            selectedApplication.stage !== "interview" &&
            !stageConfirmPending
        ) {
            setShowStageConfirm(true);
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            const startDateTime = `${date}T${startTime}:00`;
            const endMs =
                new Date(`${date}T${startTime}:00`).getTime() +
                duration * 60_000;
            const endDate = new Date(endMs);
            const endDateTime = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}T${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}:00`;

            const emails = attendeeEmails
                .split(",")
                .map((e) => e.trim())
                .filter(Boolean);

            // Determine video conference setting
            const shouldAddVideo =
                linkToApplication && selectedApplication
                    ? selectedPlatform === "google_meet" ||
                      selectedPlatform === "microsoft_teams"
                    : addVideo;

            // Stage promotion if confirmed
            if (stageConfirmPending && selectedApplication) {
                await promoteToInterview(selectedApplication.id);
            }

            // Create calendar event
            const res = (await client.post(
                `/integrations/calendar/${selectedConnection.id}/events`,
                {
                    calendar_id: selectedCalendar.id,
                    summary: title,
                    description,
                    start_date_time: startDateTime,
                    end_date_time: endDateTime,
                    time_zone: timeZone,
                    attendee_emails: emails.length > 0 ? emails : undefined,
                    add_video_conference: shouldAddVideo,
                },
            )) as { data: CalendarEvent };

            // Create interview record if linked to application with splits_video
            if (
                linkToApplication &&
                selectedApplication &&
                selectedPlatform === "splits_video"
            ) {
                await client.post("/interviews", {
                    application_id: selectedApplication.id,
                    scheduled_at: startDateTime,
                    duration_minutes: duration,
                    meeting_platform: "splits_video",
                    calendar_event_id: res.data.id,
                    time_zone: timeZone,
                });
            }

            onSuccess?.(res.data);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to create event");
        } finally {
            setSubmitting(false);
        }
    };

    const handleStageConfirm = (confirmed: boolean) => {
        setShowStageConfirm(false);
        if (confirmed) {
            setStageConfirmPending(true);
            // Re-trigger submit with stage promotion
            setTimeout(() => handleSubmit(), 0);
        }
    };

    /* Derived */
    const noConnections = !loading && connections.length === 0;
    const stepIndex = STEPS.findIndex((s) => s.key === step);
    const titleRequired = linkToApplication ? !!selectedApplication : !!title;
    const nextDisabled =
        loading ||
        noConnections ||
        !selectedCalendar ||
        !titleRequired ||
        !date ||
        !startTime;

    const isMicrosoft =
        selectedConnection?.provider_slug.startsWith("microsoft_");
    const hasGoogleConnection = connections.some(
        (c) =>
            c.provider_slug.includes("google") && c.status === "active",
    );
    const hasMicrosoftConnection = connections.some(
        (c) =>
            c.provider_slug.includes("microsoft") && c.status === "active",
    );

    return (
        <ModalPortal>
            <BaselWizardModal
                isOpen
                onClose={onClose}
                title={step === "details" ? "New Event" : "Review & Confirm"}
                icon="fa-calendar-plus"
                accentColor="primary"
                steps={STEPS.map((s) => ({ label: s.label }))}
                currentStep={stepIndex}
                onNext={() => setStep("confirm")}
                onBack={() => setStep("details")}
                onSubmit={handleSubmit}
                submitting={submitting}
                nextDisabled={nextDisabled}
                nextLabel="Continue"
                submitLabel={
                    linkToApplication && selectedPlatform === "splits_video"
                        ? "Create Event & Interview"
                        : "Create Event"
                }
                submittingLabel="Creating..."
                maxWidth="max-w-2xl"
                footer={
                    noConnections ? (
                        <div className="flex justify-end w-full">
                            <button
                                className="btn btn-ghost"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        </div>
                    ) : undefined
                }
            >
                {error && (
                    <BaselAlertBox variant="error" className="mb-4">
                        {error}
                    </BaselAlertBox>
                )}

                {loading && (
                    <div className="flex items-center justify-center py-16">
                        <span className="loading loading-spinner loading-md" />
                    </div>
                )}

                {noConnections && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-base-200 border border-base-300 flex items-center justify-center mx-auto mb-4">
                            <i className="fa-duotone fa-regular fa-calendar-xmark text-2xl text-base-content/30" />
                        </div>
                        <p className="text-sm font-bold text-base-content/50 mb-2">
                            No calendar connected
                        </p>
                        <p className="text-sm text-base-content/40 mb-4">
                            Connect Google Calendar or Outlook to create events.
                        </p>
                        <a
                            href="/portal/integrations"
                            className="btn btn-primary btn-sm"
                        >
                            <i className="fa-duotone fa-regular fa-plug" />
                            Connect Calendar
                        </a>
                    </div>
                )}

                {/* Step 1: Details */}
                {!loading && !noConnections && step === "details" && (
                    <div className="space-y-4">
                        {/* Link to Application toggle */}
                        <div className="flex items-center justify-between px-4 py-3 bg-base-200 border border-base-300">
                            <div className="flex items-center gap-3">
                                <i className="fa-duotone fa-regular fa-link text-primary" />
                                <div>
                                    <p className="text-sm font-bold">
                                        Link to Application
                                    </p>
                                    <p className="text-sm text-base-content/50">
                                        Schedule an interview for a candidate
                                    </p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={linkToApplication}
                                onChange={(e) =>
                                    handleLinkToggle(e.target.checked)
                                }
                                className="toggle toggle-primary"
                            />
                        </div>

                        {/* Application search when linked */}
                        {linkToApplication && (
                            <div className="space-y-4">
                                <ApplicationSearch
                                    onSelect={handleApplicationSelect}
                                    selectedApplication={selectedApplication}
                                />

                                {selectedApplication && (
                                    <>
                                        <div className="flex items-center gap-2 px-3 py-2 bg-accent/10 border border-accent/20">
                                            <i className="fa-duotone fa-regular fa-video text-accent" />
                                            <span className="badge badge-accent badge-sm">
                                                Interview
                                            </span>
                                            <span className="text-sm text-base-content/60">
                                                Title auto-generated from
                                                application
                                            </span>
                                        </div>

                                        <PlatformSelector
                                            selectedPlatform={selectedPlatform}
                                            onSelect={setSelectedPlatform}
                                            hasGoogleConnection={
                                                hasGoogleConnection
                                            }
                                            hasMicrosoftConnection={
                                                hasMicrosoftConnection
                                            }
                                        />
                                    </>
                                )}
                            </div>
                        )}

                        {/* Connection selector */}
                        {connections.length > 1 && (
                            <fieldset>
                                <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                    Account
                                </legend>
                                <div className="space-y-2">
                                    {connections.map((conn) => (
                                        <button
                                            key={conn.id}
                                            onClick={() =>
                                                handleSelectConnection(conn)
                                            }
                                            className={`w-full text-left px-4 py-3 border transition-colors ${
                                                selectedConnection?.id ===
                                                conn.id
                                                    ? "border-primary bg-primary/5"
                                                    : "border-base-300 hover:border-primary/30"
                                            }`}
                                        >
                                            <p className="text-sm font-bold">
                                                {conn.provider_account_name ||
                                                    conn.provider_slug}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </fieldset>
                        )}

                        {/* Calendar selector */}
                        {calendars.length > 1 && (
                            <fieldset>
                                <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                    Calendar
                                </legend>
                                <div className="space-y-2">
                                    {calendars
                                        .filter(
                                            (c) =>
                                                c.accessRole === "owner" ||
                                                c.accessRole === "writer",
                                        )
                                        .map((cal) => (
                                            <button
                                                key={cal.id}
                                                onClick={() =>
                                                    setSelectedCalendar(cal)
                                                }
                                                className={`w-full text-left px-4 py-3 border transition-colors ${
                                                    selectedCalendar?.id ===
                                                    cal.id
                                                        ? "border-primary bg-primary/5"
                                                        : "border-base-300 hover:border-primary/30"
                                                }`}
                                            >
                                                <p className="text-sm font-bold">
                                                    {cal.summary}
                                                    {cal.primary && (
                                                        <span className="ml-2 text-sm font-bold bg-primary/10 text-primary px-1.5 py-0.5">
                                                            Primary
                                                        </span>
                                                    )}
                                                </p>
                                            </button>
                                        ))}
                                </div>
                            </fieldset>
                        )}

                        {/* Title — only editable when NOT linked */}
                        {!linkToApplication && (
                            <fieldset>
                                <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                    Event Title
                                </legend>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Meeting, Interview, Call..."
                                    className="input w-full"
                                />
                            </fieldset>
                        )}

                        {linkToApplication && selectedApplication && (
                            <fieldset>
                                <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                    Event Title
                                </legend>
                                <input
                                    type="text"
                                    value={title}
                                    readOnly
                                    className="input w-full bg-base-200 cursor-not-allowed"
                                />
                            </fieldset>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <fieldset>
                                <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                    Date
                                </legend>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    min={new Date().toISOString().split("T")[0]}
                                    className="input w-full"
                                />
                            </fieldset>
                            <fieldset>
                                <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                    Start Time
                                </legend>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) =>
                                        setStartTime(e.target.value)
                                    }
                                    className="input w-full"
                                />
                            </fieldset>
                        </div>

                        <fieldset>
                            <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                Duration
                            </legend>
                            <select
                                value={duration}
                                onChange={(e) =>
                                    setDuration(Number(e.target.value))
                                }
                                className="select w-full"
                            >
                                <option value={15}>15 minutes</option>
                                <option value={30}>30 minutes</option>
                                <option value={45}>45 minutes</option>
                                <option value={60}>1 hour</option>
                                <option value={90}>1.5 hours</option>
                                <option value={120}>2 hours</option>
                            </select>
                        </fieldset>

                        <fieldset>
                            <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                Description
                            </legend>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Notes, agenda, details..."
                                rows={3}
                                className="textarea w-full"
                            />
                        </fieldset>

                        <fieldset>
                            <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                Attendee Emails
                            </legend>
                            <input
                                type="text"
                                value={attendeeEmails}
                                onChange={(e) =>
                                    setAttendeeEmails(e.target.value)
                                }
                                placeholder="email1@example.com, email2@example.com"
                                className="input w-full"
                            />
                            <p className="text-sm text-base-content/40 mt-1">
                                Comma-separated email addresses
                            </p>
                        </fieldset>

                        {/* Video conference — only show when NOT linked */}
                        {!linkToApplication && (
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={addVideo}
                                    onChange={(e) =>
                                        setAddVideo(e.target.checked)
                                    }
                                    className="checkbox checkbox-sm checkbox-primary"
                                />
                                <span className="text-sm font-semibold">
                                    {isMicrosoft ? (
                                        <>
                                            <i className="fa-brands fa-microsoft mr-1.5 text-primary" />
                                            Add Teams meeting link
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-brands fa-google mr-1.5 text-primary" />
                                            Add Google Meet link
                                        </>
                                    )}
                                </span>
                            </label>
                        )}
                    </div>
                )}

                {/* Step 2: Confirm */}
                {step === "confirm" && (
                    <div className="space-y-4">
                        <div className="bg-base-200 border border-base-300 p-5">
                            <p className="text-sm font-bold tracking-[0.2em] uppercase text-base-content/50 mb-3">
                                Review Details
                            </p>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-bold text-base-content/50 uppercase">
                                        Title
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold">
                                            {title}
                                        </p>
                                        {linkToApplication &&
                                            selectedApplication && (
                                                <span className="badge badge-accent badge-sm">
                                                    Interview
                                                </span>
                                            )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-sm font-bold text-base-content/50 uppercase">
                                            Date
                                        </p>
                                        <p className="text-sm font-semibold">
                                            {date &&
                                                new Date(
                                                    date + "T00:00:00",
                                                ).toLocaleDateString("en-US", {
                                                    weekday: "long",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-base-content/50 uppercase">
                                            Time
                                        </p>
                                        <p className="text-sm font-semibold">
                                            {startTime} ({duration} min)
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-base-content/50 uppercase">
                                        Calendar
                                    </p>
                                    <p className="text-sm font-semibold">
                                        {selectedCalendar?.summary}
                                    </p>
                                </div>
                                {linkToApplication &&
                                    selectedApplication && (
                                        <div>
                                            <p className="text-sm font-bold text-base-content/50 uppercase">
                                                Platform
                                            </p>
                                            <p className="text-sm font-semibold">
                                                {selectedPlatform ===
                                                "splits_video"
                                                    ? "Splits Network Video"
                                                    : selectedPlatform ===
                                                        "google_meet"
                                                      ? "Google Meet"
                                                      : "Microsoft Teams"}
                                            </p>
                                        </div>
                                    )}
                                {description && (
                                    <div>
                                        <p className="text-sm font-bold text-base-content/50 uppercase">
                                            Description
                                        </p>
                                        <p className="text-sm text-base-content/70">
                                            {description}
                                        </p>
                                    </div>
                                )}
                                {attendeeEmails && (
                                    <div>
                                        <p className="text-sm font-bold text-base-content/50 uppercase">
                                            Attendees
                                        </p>
                                        <p className="text-sm text-base-content/70">
                                            {attendeeEmails}
                                        </p>
                                    </div>
                                )}
                                {!linkToApplication && addVideo && (
                                    <div className="flex items-center gap-2 pt-1">
                                        <i
                                            className={`${isMicrosoft ? "fa-brands fa-microsoft" : "fa-brands fa-google"} text-primary text-sm`}
                                        />
                                        <p className="text-sm font-semibold text-primary">
                                            {isMicrosoft
                                                ? "Teams meeting included"
                                                : "Google Meet included"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </BaselWizardModal>

            {/* Stage promotion confirmation dialog */}
            {showStageConfirm && selectedApplication && (
                <dialog className="modal modal-open">
                    <div className="modal-box max-w-sm">
                        <h3 className="font-bold text-lg">
                            Move to Interview Stage?
                        </h3>
                        <p className="text-sm text-base-content/60 mt-2">
                            {selectedApplication.candidateName} is currently at{" "}
                            <span className="font-bold">
                                {selectedApplication.stage}
                            </span>{" "}
                            stage. Move to{" "}
                            <span className="font-bold">interview</span> stage?
                        </p>
                        <div className="modal-action">
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleStageConfirm(false)}
                            >
                                No, Cancel
                            </button>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleStageConfirm(true)}
                            >
                                Yes, Move to Interview
                            </button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={() => handleStageConfirm(false)}>
                            close
                        </button>
                    </form>
                </dialog>
            )}
        </ModalPortal>
    );
}
