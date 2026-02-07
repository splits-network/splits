"use client";

import { useMemo } from "react";
import { Candidate } from "@splits-network/shared-types";
import ActionsToolbar from "../shared/actions-toolbar";

interface CandidateDetailPanelProps {
    candidate: Candidate | null;
    onMessage?: (candidate: Candidate) => void;
    onSendJob?: (candidate: Candidate) => void;
    onEdit?: (candidateId: string) => void;
    onClose?: () => void;
}

export default function CandidateDetailPanel({
    candidate,
    onMessage,
    onSendJob,
    onEdit,
    onClose,
}: CandidateDetailPanelProps) {
    const getInitials = (name: string) => {
        const names = name.split(" ");
        const firstInitial = names[0]?.[0]?.toUpperCase() || "";
        const lastInitial = names[names.length - 1]?.[0]?.toUpperCase() || "";
        return names.length > 1 ? firstInitial + lastInitial : firstInitial;
    };

    if (!candidate) {
        return (
            <div className="flex items-center justify-center h-full text-base-content/60">
                <div className="text-center">
                    <i className="fa-duotone fa-regular fa-user-circle text-6xl mb-4"></i>
                    <h3 className="text-xl font-semibold mb-2">
                        Select a candidate
                    </h3>
                    <p>
                        Choose a candidate from the list to view their details
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-base-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            className="btn btn-ghost btn-sm btn-square md:hidden"
                            onClick={onClose}
                        >
                            <i className="fa-duotone fa-regular fa-arrow-left"></i>
                        </button>
                        <h3 className="text-xl font-semibold">
                            Candidate Details
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <ActionsToolbar
                            candidate={candidate}
                            variant="descriptive"
                            size="sm"
                            onMessage={onMessage}
                            onSendJobOpportunity={onSendJob}
                            onEdit={onEdit}
                        />
                        <button
                            className="btn btn-ghost btn-sm btn-square hidden md:flex"
                            onClick={onClose}
                        >
                            <i className="fa-duotone fa-regular fa-xmark"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {/* Header Section */}
                <div className="flex items-start gap-6 mb-8">
                    {/* Avatar */}
                    <div className="avatar avatar-placeholder shrink-0">
                        <div className="bg-primary/10 text-primary rounded-full w-24 flex items-center justify-center text-2xl font-semibold">
                            {getInitials(candidate.name || "?")}
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-base-content mb-2">
                            {candidate.name}
                        </h1>
                        <p className="text-xl text-base-content/80 mb-2">
                            {candidate.current_title || "No title"}
                        </p>
                        <p className="text-lg text-base-content/60 mb-4">
                            {candidate.current_company || "No company"}
                            {candidate.current_company &&
                                candidate.location &&
                                " • "}
                            {candidate.location || ""}
                        </p>

                        {/* Status badges */}
                        <div className="flex flex-wrap gap-2">
                            {candidate.status && (
                                <span
                                    className={`badge ${
                                        candidate.status === "active"
                                            ? "badge-success"
                                            : candidate.status === "inactive"
                                              ? "badge-neutral"
                                              : candidate.status === "pending"
                                                ? "badge-warning"
                                                : "badge-ghost"
                                    }`}
                                >
                                    <i className="fa-duotone fa-regular fa-circle-dot mr-1"></i>
                                    {candidate.status}
                                </span>
                            )}
                            {candidate.experience_years && (
                                <span className="badge badge-outline">
                                    <i className="fa-duotone fa-regular fa-clock mr-1"></i>
                                    {candidate.experience_years} years exp
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="card bg-base-100 shadow-sm border border-base-300 mb-6">
                    <div className="card-body p-6">
                        <h3 className="card-title text-lg mb-4">
                            <i className="fa-duotone fa-regular fa-address-card text-primary"></i>
                            Contact Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {candidate.email && (
                                <div>
                                    <label className="block text-sm font-semibold text-base-content/70 mb-1">
                                        Email
                                    </label>
                                    <a
                                        href={`mailto:${candidate.email}`}
                                        className="link link-hover text-base font-medium"
                                    >
                                        <i className="fa-duotone fa-regular fa-envelope mr-2"></i>
                                        {candidate.email}
                                    </a>
                                </div>
                            )}
                            {candidate.phone && (
                                <div>
                                    <label className="block text-sm font-semibold text-base-content/70 mb-1">
                                        Phone
                                    </label>
                                    <a
                                        href={`tel:${candidate.phone}`}
                                        className="link link-hover text-base font-medium"
                                    >
                                        <i className="fa-duotone fa-regular fa-phone mr-2"></i>
                                        {candidate.phone}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Skills */}
                {candidate.skills && candidate.skills.length > 0 && (
                    <div className="card bg-base-100 shadow-sm border border-base-300 mb-6">
                        <div className="card-body p-6">
                            <h3 className="card-title text-lg mb-4">
                                <i className="fa-duotone fa-regular fa-list-check text-primary"></i>
                                Skills & Technologies
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {candidate.skills.map(
                                    (skill: string, index: number) => (
                                        <span
                                            key={index}
                                            className="badge badge-lg badge-outline"
                                        >
                                            {skill}
                                        </span>
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Professional Summary */}
                {candidate.summary && (
                    <div className="card bg-base-100 shadow-sm border border-base-300 mb-6">
                        <div className="card-body p-6">
                            <h3 className="card-title text-lg mb-4">
                                <i className="fa-duotone fa-regular fa-user-tie text-primary"></i>
                                Professional Summary
                            </h3>
                            <p className="text-base-content/80 leading-relaxed">
                                {candidate.summary}
                            </p>
                        </div>
                    </div>
                )}

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Salary Expectations */}
                    {(candidate.salary_min || candidate.salary_max) && (
                        <div className="card bg-base-100 shadow-sm border border-base-300">
                            <div className="card-body p-6">
                                <h3 className="card-title text-lg mb-4">
                                    <i className="fa-duotone fa-regular fa-dollar-sign text-primary"></i>
                                    Salary Expectations
                                </h3>
                                <p className="text-2xl font-semibold text-primary">
                                    $
                                    {candidate.salary_min?.toLocaleString() ||
                                        "N/A"}
                                    {candidate.salary_max &&
                                        ` - $${candidate.salary_max.toLocaleString()}`}
                                    <span className="text-sm font-normal text-base-content/60 ml-2">
                                        /year
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Availability */}
                    {candidate.availability && (
                        <div className="card bg-base-100 shadow-sm border border-base-300">
                            <div className="card-body p-6">
                                <h3 className="card-title text-lg mb-4">
                                    <i className="fa-duotone fa-regular fa-calendar-check text-primary"></i>
                                    Availability
                                </h3>
                                <p className="text-lg font-semibold capitalize">
                                    {candidate.availability}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
