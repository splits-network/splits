"use client";

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
import PlatformSelector from "./platform-selector";
import type { MeetingPlatform } from "./platform-selector";
import AvailableSlotsList from "./available-slots-list";
import type { TimeSlot } from "./available-slots-list";

/* ─── Types ────────────────────────────────────────────────────────────── */

interface ScheduleInterviewModalProps {
    candidateName: string;
    candidateEmail?: string;
    jobTitle?: string;
    applicationId?: string;
    applicationStage?: string;
    onClose: () => void;
    onSuccess?: (event?: CalendarEvent) => void;
}

type Step = "platform-calendar" | "pick-time" | "confirm";

const STEPS: { key: Step; label: string }[] = [
    { key: "platform-calendar", label: "Platform & Calendar" },
    { key: "pick-time", label: "Date & Time" },
    { key: "confirm", label: "Confirm" },
];

const TERMINAL_STAGES = new Set(["rejected", "hired", "withdrawn"]);

const DURATION_OPTIONS = [
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: 45, label: "45 minutes" },
    { value: 60, label: "1 hour" },
    { value: 90, label: "1.5 hours" },
    { value: 120, label: "2 hours" },
];

/* ─── Component ────────────────────────────────────────────────────────── */

export default function ScheduleInterviewModal({
    candidateName,
    candidateEmail,
    jobTitle,
    applicationId,
    applicationStage,
    onClose,
    onSuccess,
}: ScheduleInterviewModalProps) {
    const { getToken } = useAuth();

    /* ── Terminal state check ── */
    const isTerminalState = applicationStage
        ? TERMINAL_STAGES.has(applicationStage)
        : false;

    /* ── State ── */
    const [step, setStep] = useState<Step>("platform-calendar");
    const [connections, setConnections] = useState<OAuthConnectionPublic[]>([]);
    const [calendars, setCalendars] = useState<CalendarInfo[]>([]);
    const [selectedConnection, setSelectedConnection] =
        useState<OAuthConnectionPublic | null>(null);
    const [selectedCalendar, setSelectedCalendar] =
        useState<CalendarInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    /* ── Platform ── */
    const [platform, setPlatform] = useState<MeetingPlatform>("splits_video");

    /* ── Recording ── */
    const [recordingEnabled, setRecordingEnabled] = useState(false);

    /* ── Round name ── */
    const [roundName, setRoundName] = useState("");

    /* ── Slots ── */
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [slotsLoading, setSlotsLoading] = useState(false);

    /* ── Form fields ── */
    const autoTitle = jobTitle
        ? `Interview: ${candidateName} \u2014 ${jobTitle}`
        : `Interview with ${candidateName}`;
    const autoDescription = jobTitle
        ? `Interview for ${jobTitle} position\nCandidate: ${candidateName}${applicationId ? `\nApplication: /portal/applications/${applicationId}` : ""}`
        : `Interview with ${candidateName}`;

    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("09:00");
    const [duration, setDuration] = useState(30);
    const [timeZone] = useState(
        Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
    const [attendeeEmails, setAttendeeEmails] = useState("");

    /* ── Derived ── */
    const hasGoogleConnection = connections.some(
        (c) =>
            c.provider_slug.includes("google") && c.status === "active",
    );
    const hasMicrosoftConnection = connections.some(
        (c) =>
            c.provider_slug.includes("microsoft") && c.status === "active",
    );
    const hasCalendarConnection = selectedConnection && selectedCalendar;
    const isMicrosoft =
        selectedConnection?.provider_slug.startsWith("microsoft_");

    /* ── Fetch calendar connections ── */
    const fetchConnections = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const res = (await client.get("/integrations/connections")) as {
                data: OAuthConnectionPublic[];
            };
            const calendarConns = (res.data ?? []).filter(
                (c) =>
                    (c.provider_slug.includes("calendar") ||
                        c.provider_slug.includes("combo")) &&
                    c.status === "active",
            );
            setConnections(calendarConns);

            if (calendarConns.length === 1) {
                setSelectedConnection(calendarConns[0]);
                await fetchCalendars(calendarConns[0].id, token);
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
            setError(
                "Failed to load calendars. Your connection may have expired.",
            );
        }
    };

    useEffect(() => {
        fetchConnections();
    }, [fetchConnections]);

    /* ── Fetch available slots when calendar is connected ── */
    const fetchAvailableSlots = useCallback(async () => {
        if (!selectedConnection || !selectedCalendar) return;

        setSlotsLoading(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);

            const now = new Date();
            const twoWeeks = new Date(
                now.getTime() + 14 * 24 * 60 * 60 * 1000,
            );

            const availability = (await client.post(
                `/integrations/calendar/${selectedConnection.id}/availability`,
                {
                    calendar_ids: [selectedCalendar.id],
                    time_min: now.toISOString(),
                    time_max: twoWeeks.toISOString(),
                },
            )) as { data: any };

            // Compute 30-min available slots from busy data
            const slots = computeAvailableSlots(
                availability.data,
                now,
                twoWeeks,
                30,
            );
            setAvailableSlots(slots);
        } catch {
            // Silently fail — user can still use manual time entry
            setAvailableSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    }, [selectedConnection, selectedCalendar]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (step === "pick-time" && hasCalendarConnection) {
            fetchAvailableSlots();
        }
    }, [step, hasCalendarConnection, fetchAvailableSlots]);

    /* ── Handlers ── */

    const handleSelectConnection = async (conn: OAuthConnectionPublic) => {
        setSelectedConnection(conn);
        setCalendars([]);
        setSelectedCalendar(null);
        await fetchCalendars(conn.id);
    };

    const handleSlotSelect = (slot: TimeSlot) => {
        setSelectedSlot(slot);
        const slotDate = new Date(slot.start);
        setDate(slotDate.toISOString().split("T")[0]);
        setStartTime(
            `${String(slotDate.getHours()).padStart(2, "0")}:${String(slotDate.getMinutes()).padStart(2, "0")}`,
        );
    };

    const handleNext = () => {
        if (step === "platform-calendar") {
            setStep("pick-time");
        } else if (step === "pick-time" && date && startTime) {
            setStep("confirm");
        }
    };

    const handleBack = () => {
        if (step === "confirm") setStep("pick-time");
        else if (step === "pick-time") setStep("platform-calendar");
    };

    const handleSubmit = async () => {
        if (!date || !startTime) return;
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

            const allEmails = [
                candidateEmail,
                ...attendeeEmails
                    .split(",")
                    .map((e) => e.trim())
                    .filter(Boolean),
            ].filter(Boolean) as string[];

            let calendarEvent: CalendarEvent | undefined;

            // Step 1: Create calendar event if calendar connected
            if (hasCalendarConnection && selectedConnection && selectedCalendar) {
                const addVideoConference =
                    platform === "google_meet"
                        ? true
                        : platform === "microsoft_teams"
                          ? true
                          : false;

                const res = (await client.post(
                    `/integrations/calendar/${selectedConnection.id}/events`,
                    {
                        calendar_id: selectedCalendar.id,
                        summary: autoTitle,
                        description: autoDescription,
                        start_date_time: startDateTime,
                        end_date_time: endDateTime,
                        time_zone: timeZone,
                        attendee_emails: allEmails,
                        add_video_conference: addVideoConference,
                    },
                )) as { data: CalendarEvent };

                calendarEvent = res.data;
            }

            // Step 2: Create interview record for splits_video only
            if (platform === "splits_video" && applicationId) {
                await client.post("/interviews", {
                    application_id: applicationId,
                    interview_type: "screening",
                    title: autoTitle,
                    round_name: roundName || undefined,
                    scheduled_at: startDateTime,
                    scheduled_duration_minutes: duration,
                    calendar_event_id: calendarEvent?.id || undefined,
                    calendar_connection_id: selectedConnection?.id || undefined,
                    meeting_platform: "splits_video",
                    recording_enabled: recordingEnabled,
                    participants: [],
                });
            }

            onSuccess?.(calendarEvent);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to schedule interview");
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Derived UI ── */
    const noConnections = !loading && connections.length === 0;
    const stepIndex = STEPS.findIndex((s) => s.key === step);

    const nextDisabled =
        isTerminalState ||
        loading ||
        (step === "pick-time" && (!date || !startTime));

    const stepTitle =
        step === "platform-calendar"
            ? "Platform & Calendar"
            : step === "pick-time"
              ? "Date & Time"
              : "Review & Confirm";

    const platformIcon =
        platform === "splits_video"
            ? "fa-duotone fa-regular fa-video"
            : platform === "google_meet"
              ? "fa-brands fa-google"
              : "fa-brands fa-microsoft";

    const platformLabel =
        platform === "splits_video"
            ? "Splits Network Video"
            : platform === "google_meet"
              ? "Google Meet"
              : "Microsoft Teams";

    /* ── Render ── */
    return (
        <ModalPortal>
            <BaselWizardModal
                isOpen
                onClose={onClose}
                title={stepTitle}
                icon="fa-calendar-plus"
                accentColor="primary"
                steps={STEPS.map((s) => ({ label: s.label }))}
                currentStep={stepIndex}
                onNext={handleNext}
                onBack={handleBack}
                onSubmit={handleSubmit}
                submitting={submitting}
                nextDisabled={nextDisabled}
                nextLabel="Continue"
                submitLabel="Schedule Interview"
                submittingLabel="Scheduling..."
                maxWidth="max-w-2xl"
                footer={
                    isTerminalState ? (
                        <div className="flex justify-end w-full">
                            <button className="btn btn-ghost" onClick={onClose}>
                                Close
                            </button>
                        </div>
                    ) : undefined
                }
            >
                {/* Terminal state blocking */}
                {isTerminalState && (
                    <BaselAlertBox variant="error" className="mb-4">
                        Cannot schedule interview for an application in{" "}
                        <strong>{applicationStage}</strong> state
                    </BaselAlertBox>
                )}

                {/* Error */}
                {error && !isTerminalState && (
                    <BaselAlertBox variant="error" className="mb-4">
                        {error}
                    </BaselAlertBox>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-16">
                        <span className="loading loading-spinner loading-md" />
                    </div>
                )}

                {/* Step 1: Platform & Calendar */}
                {!loading && !isTerminalState && step === "platform-calendar" && (
                    <div className="space-y-6">
                        <PlatformSelector
                            selectedPlatform={platform}
                            onSelect={setPlatform}
                            hasGoogleConnection={hasGoogleConnection}
                            hasMicrosoftConnection={hasMicrosoftConnection}
                        />

                        {/* Record interview toggle — splits_video only */}
                        {platform === "splits_video" && (
                            <fieldset className="mt-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary"
                                        checked={recordingEnabled}
                                        onChange={(e) =>
                                            setRecordingEnabled(e.target.checked)
                                        }
                                    />
                                    <div>
                                        <span className="text-sm font-semibold">
                                            Record this interview
                                        </span>
                                        <p className="text-sm text-base-content/50">
                                            Interview will be recorded, transcribed,
                                            and summarized
                                        </p>
                                    </div>
                                </label>
                            </fieldset>
                        )}

                        {/* Calendar connection selector */}
                        {connections.length > 0 ? (
                            <div className="space-y-4">
                                {connections.length > 1 && (
                                    <fieldset>
                                        <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                            Calendar Account
                                        </legend>
                                        <div className="space-y-2">
                                            {connections.map((conn) => (
                                                <button
                                                    key={conn.id}
                                                    type="button"
                                                    onClick={() =>
                                                        handleSelectConnection(
                                                            conn,
                                                        )
                                                    }
                                                    className={`w-full text-left px-4 py-3 border transition-colors ${
                                                        selectedConnection
                                                            ?.id === conn.id
                                                            ? "border-primary bg-primary/5"
                                                            : "border-base-300 hover:border-primary/30"
                                                    }`}
                                                >
                                                    <p className="text-sm font-bold">
                                                        {conn.provider_account_name ||
                                                            conn.provider_slug}
                                                    </p>
                                                    <p className="text-sm text-base-content/50">
                                                        {
                                                            conn.provider_account_id
                                                        }
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </fieldset>
                                )}

                                {calendars.length > 0 && (
                                    <fieldset>
                                        <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                            Calendar
                                        </legend>
                                        <div className="space-y-2">
                                            {calendars
                                                .filter(
                                                    (c) =>
                                                        c.accessRole ===
                                                            "owner" ||
                                                        c.accessRole ===
                                                            "writer",
                                                )
                                                .map((cal) => (
                                                    <button
                                                        key={cal.id}
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedCalendar(
                                                                cal,
                                                            )
                                                        }
                                                        className={`w-full text-left px-4 py-3 border transition-colors ${
                                                            selectedCalendar
                                                                ?.id === cal.id
                                                                ? "border-primary bg-primary/5"
                                                                : "border-base-300 hover:border-primary/30"
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <i className="fa-duotone fa-regular fa-calendar text-primary" />
                                                            <div>
                                                                <p className="text-sm font-bold">
                                                                    {
                                                                        cal.summary
                                                                    }
                                                                    {cal.primary && (
                                                                        <span className="ml-2 text-sm font-bold uppercase bg-primary/10 text-primary px-1.5 py-0.5">
                                                                            Primary
                                                                        </span>
                                                                    )}
                                                                </p>
                                                                {cal.description && (
                                                                    <p className="text-sm text-base-content/50">
                                                                        {
                                                                            cal.description
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                        </div>
                                    </fieldset>
                                )}

                                {selectedConnection &&
                                    calendars.length === 0 &&
                                    !loading && (
                                        <div className="text-center py-8">
                                            <span className="loading loading-spinner loading-sm" />
                                            <p className="text-sm text-base-content/50 mt-2">
                                                Loading calendars...
                                            </p>
                                        </div>
                                    )}
                            </div>
                        ) : (
                            <BaselAlertBox variant="info" className="mt-2">
                                <div className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-info-circle" />
                                    <span>
                                        No calendar connected. The interview
                                        will be created in Splits Network only.{" "}
                                        <a
                                            href="/portal/integrations"
                                            className="font-bold text-primary hover:underline"
                                        >
                                            Connect a calendar
                                        </a>
                                    </span>
                                </div>
                            </BaselAlertBox>
                        )}
                    </div>
                )}

                {/* Step 2: Pick Date & Time */}
                {!isTerminalState && step === "pick-time" && (
                    <div className="space-y-4">
                        {/* Available slots from calendar */}
                        {hasCalendarConnection && (
                            <AvailableSlotsList
                                slots={availableSlots}
                                selectedSlot={selectedSlot}
                                onSelect={handleSlotSelect}
                                loading={slotsLoading}
                                timezone={timeZone}
                            />
                        )}

                        {/* Manual time entry */}
                        {hasCalendarConnection && availableSlots.length > 0 && (
                            <div className="divider text-sm text-base-content/40">
                                Or pick a custom time
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <fieldset>
                                <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                    Date
                                </legend>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => {
                                        setDate(e.target.value);
                                        setSelectedSlot(null);
                                    }}
                                    min={
                                        new Date().toISOString().split("T")[0]
                                    }
                                    className="input w-full rounded-none"
                                />
                            </fieldset>

                            <fieldset>
                                <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                    Start Time
                                </legend>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => {
                                        setStartTime(e.target.value);
                                        setSelectedSlot(null);
                                    }}
                                    className="input w-full rounded-none"
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
                                className="select w-full rounded-none"
                            >
                                {DURATION_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </fieldset>

                        <fieldset>
                            <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                Additional Attendees
                            </legend>
                            <input
                                type="text"
                                value={attendeeEmails}
                                onChange={(e) =>
                                    setAttendeeEmails(e.target.value)
                                }
                                placeholder="email1@example.com, email2@example.com"
                                className="input w-full rounded-none"
                            />
                            <p className="text-sm text-base-content/40 mt-1">
                                Comma-separated. Candidate ({candidateEmail}) is
                                auto-added.
                            </p>
                        </fieldset>
                    </div>
                )}

                {/* Step 3: Confirm */}
                {!isTerminalState && step === "confirm" && (
                    <div className="space-y-4">
                        {/* Round Name (optional) */}
                        <fieldset>
                            <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                Round Name (optional)
                            </legend>
                            <input
                                type="text"
                                value={roundName}
                                onChange={(e) => setRoundName(e.target.value)}
                                placeholder="e.g., Technical Screen, Culture Fit"
                                maxLength={100}
                                className="input w-full rounded-none"
                            />
                            <p className="text-sm text-base-content/40 mt-1">
                                Label this round for multi-interview tracking
                            </p>
                        </fieldset>

                        <div className="bg-base-200 border border-base-300 p-5">
                            <p className="text-sm font-bold tracking-[0.2em] uppercase text-base-content/50 mb-3">
                                Review Details
                            </p>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-bold text-base-content/50 uppercase">
                                        Title
                                    </p>
                                    <p className="text-sm font-semibold">
                                        {autoTitle}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-base-content/50 uppercase">
                                        Platform
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <i
                                            className={`${platformIcon} text-primary text-sm`}
                                        />
                                        <p className="text-sm font-semibold">
                                            {platformLabel}
                                        </p>
                                    </div>
                                </div>

                                {platform === "splits_video" && (
                                    <div>
                                        <p className="text-sm font-bold text-base-content/50 uppercase">
                                            Recording
                                        </p>
                                        <p className="text-sm font-semibold">
                                            {recordingEnabled
                                                ? "Enabled"
                                                : "Disabled"}
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-sm font-bold text-base-content/50 uppercase">
                                            Date
                                        </p>
                                        <p className="text-sm font-semibold">
                                            {new Date(
                                                date + "T00:00:00",
                                            ).toLocaleDateString("en-US", {
                                                weekday: "long",
                                                month: "long",
                                                day: "numeric",
                                                year: "numeric",
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

                                {hasCalendarConnection && (
                                    <div>
                                        <p className="text-sm font-bold text-base-content/50 uppercase">
                                            Calendar
                                        </p>
                                        <p className="text-sm font-semibold">
                                            {selectedCalendar?.summary}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm font-bold text-base-content/50 uppercase">
                                        Attendees
                                    </p>
                                    <p className="text-sm text-base-content/70">
                                        {candidateEmail && (
                                            <span className="font-semibold">
                                                {candidateEmail} (candidate)
                                            </span>
                                        )}
                                        {attendeeEmails && (
                                            <span>
                                                {candidateEmail ? ", " : ""}
                                                {attendeeEmails}
                                            </span>
                                        )}
                                        {!candidateEmail && !attendeeEmails && (
                                            <span className="text-base-content/40">
                                                No attendees
                                            </span>
                                        )}
                                    </p>
                                </div>

                                {!hasCalendarConnection && (
                                    <div className="flex items-center gap-2 pt-1 text-sm text-base-content/50">
                                        <i className="fa-duotone fa-regular fa-info-circle" />
                                        <span>
                                            No calendar connected — interview
                                            will be created in Splits Network
                                            only
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </BaselWizardModal>
        </ModalPortal>
    );
}

/* ─── Slot Computation ─────────────────────────────────────────────────── */

/**
 * Compute available 30-min slots from free/busy data.
 * Filters to business hours (9am-5pm) on weekdays.
 */
function computeAvailableSlots(
    availabilityData: any,
    rangeStart: Date,
    rangeEnd: Date,
    slotMinutes: number,
): TimeSlot[] {
    const busyPeriods: Array<{ start: Date; end: Date }> = [];

    // Parse busy periods from availability response
    if (availabilityData?.calendars) {
        for (const calData of Object.values(availabilityData.calendars) as any[]) {
            if (calData?.busy) {
                for (const b of calData.busy) {
                    busyPeriods.push({
                        start: new Date(b.start),
                        end: new Date(b.end),
                    });
                }
            }
        }
    } else if (Array.isArray(availabilityData?.busy)) {
        for (const b of availabilityData.busy) {
            busyPeriods.push({
                start: new Date(b.start),
                end: new Date(b.end),
            });
        }
    }

    const slots: TimeSlot[] = [];
    const slotMs = slotMinutes * 60 * 1000;

    // Start from next full slot boundary
    const cursor = new Date(rangeStart);
    cursor.setMinutes(
        Math.ceil(cursor.getMinutes() / slotMinutes) * slotMinutes,
        0,
        0,
    );

    while (cursor.getTime() + slotMs <= rangeEnd.getTime()) {
        const day = cursor.getDay();
        const hour = cursor.getHours();

        // Weekdays only (Mon-Fri), business hours (9-17)
        if (day >= 1 && day <= 5 && hour >= 9 && hour < 17) {
            const slotEnd = new Date(cursor.getTime() + slotMs);

            // Check if slot overlaps any busy period
            const isBusy = busyPeriods.some(
                (bp) => cursor < bp.end && slotEnd > bp.start,
            );

            if (!isBusy) {
                slots.push({
                    start: cursor.toISOString(),
                    end: slotEnd.toISOString(),
                });
            }
        }

        cursor.setTime(cursor.getTime() + slotMs);
    }

    // Limit to reasonable number to avoid massive lists
    return slots.slice(0, 100);
}
