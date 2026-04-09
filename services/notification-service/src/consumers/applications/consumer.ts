import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { ApplicationsEmailService } from '../../services/applications/service.js';
import { DataLookupHelper } from '../../helpers/data-lookup.js';
import { ContactLookupHelper } from '../../helpers/contact-lookup.js';

/** Stages where the application has been submitted to the company and company should receive notifications */
const COMPANY_VISIBLE_STAGES = ['submitted', 'company_review', 'company_feedback', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'];

export class ApplicationsEventConsumer {
    constructor(
        private emailService: ApplicationsEmailService,
        private logger: Logger,
        private dataLookup: DataLookupHelper,
        private contactLookup: ContactLookupHelper
    ) { }

    async handleApplicationAccepted(event: DomainEvent): Promise<void> {
        try {
            const { application_id, job_id, candidate_id, recruiter_id } = event.payload;

            this.logger.info(
                { application_id, job_id, recruiter_id },
                'Processing application accepted notification'
            );

            const job = await this.dataLookup.getJob(job_id);
            const candidate = await this.dataLookup.getCandidate(candidate_id);

            if (!job || !candidate) {
                this.logger.error({ application_id, hasJob: !!job, hasCandidate: !!candidate }, 'Missing job or candidate');
                throw new Error('Job or candidate not found');
            }

            if (recruiter_id) {
                const recruiterContact = await this.contactLookup.getRecruiterContact(recruiter_id);

                if (!recruiterContact) {
                    this.logger.warn(
                        { application_id, recruiter_id },
                        'Cannot send application accepted email - recruiter contact not found'
                    );
                    return;
                }

                await this.emailService.sendApplicationAccepted(recruiterContact.email, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: DataLookupHelper.getJobCompanyName(job, 'the company'),
                    applicationId: application_id,
                    userId: recruiterContact.user_id || undefined,
                });

                this.logger.info(
                    { application_id, recipient: recruiterContact.email },
                    'Application accepted notification sent to recruiter'
                );
            }
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send application accepted notification'
            );
            throw error;
        }
    }

    async handleApplicationStageChanged(event: DomainEvent): Promise<void> {
        try {
            const { application_id, old_stage, new_stage, job_id, candidate_id, candidate_recruiter_id } = event.payload;

            this.logger.info({ application_id, old_stage, new_stage }, 'Processing stage changed notification');

            // Skip stages that are already handled by dedicated event handlers to avoid
            // duplicate notifications. The ai_review.completed event sends its own
            // candidate + recruiter emails via handleAIReviewCompleted(), and the ats-service
            // also publishes application.stage_changed for ai_reviewed — skip it here.
            if (new_stage === 'ai_reviewed') {
                this.logger.info(
                    { application_id, new_stage },
                    'Skipping stage change notification — handled by ai_review.completed handler'
                );
                return;
            }

            const context = await this.dataLookup.getApplicationContext(application_id);
            if (!context) {
                this.logger.error({ application_id }, 'Could not load application context');
                throw new Error(`Application context not found for ${application_id}`);
            }

            const { application, job, candidate } = context;

            const candidateEmail = candidate.email;
            const candidateUserId = candidate.user_id;
            const effectiveRecruiterId = candidate_recruiter_id || application.candidate_recruiter_id;

            // Helper to get recruiter contact
            const getRecruiterContact = async (recId: string) => {
                return await this.contactLookup.getRecruiterContact(recId);
            };

            switch (new_stage) {
                case 'recruiter_request':

                    // Candidate should be notified that their recruiter has requested changes
                    if (candidateEmail) {
                        let recruiterName = 'Your recruiter';
                        if (effectiveRecruiterId) {
                            const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                            if (recruiterContact) {
                                recruiterName = recruiterContact.name;
                            }
                        }

                        await this.emailService.sendRecruiterRequestChanges(candidateEmail, {
                            candidateName: candidate.full_name,
                            recruiterName,
                            jobTitle: job.title,
                            companyName: DataLookupHelper.getJobCompanyName(job),
                            applicationId: application_id,
                            recruiterNotes: application.recruiter_notes || undefined,
                            userId: candidateUserId || undefined,
                        });
                    }
                    break;

                case 'screen':

                    if (candidateEmail) {
                        let recruiterName = 'Your recruiter';
                        if (effectiveRecruiterId) {
                            const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                            if (recruiterContact) {
                                recruiterName = recruiterContact.name;
                            }
                        }

                        await this.emailService.sendCandidateApplicationWithRecruiter(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: DataLookupHelper.getJobCompanyName(job),
                            recruiterName: recruiterName,
                            applicationId: application_id,
                            userId: candidateUserId || undefined,
                        });
                    }

                    if (effectiveRecruiterId) {
                        const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                        if (recruiterContact) {
                            await this.emailService.sendApplicationStageChanged(recruiterContact.email, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: DataLookupHelper.getJobCompanyName(job),
                                oldStage: old_stage || 'Unknown',
                                newStage: 'screen',
                                applicationId: application_id,
                                userId: recruiterContact.user_id || undefined,
                            });
                        }
                    }
                    break;

                case 'recruiter_review':

                    if (candidateEmail) {
                        const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                        const recruiterName = recruiterContact?.name || 'Your recruiter';

                        await this.emailService.sendCandidateRecruiterReview(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: DataLookupHelper.getJobCompanyName(job),
                            recruiterName: recruiterName,
                            applicationId: application_id,
                            userId: candidateUserId || undefined,
                        });
                    }

                    if (effectiveRecruiterId) {
                        const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                        if (recruiterContact) {
                            await this.emailService.sendApplicationStageChanged(recruiterContact.email, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: DataLookupHelper.getJobCompanyName(job),
                                oldStage: old_stage || 'Unknown',
                                newStage: 'recruiter_review',
                                applicationId: application_id,
                                userId: recruiterContact.user_id || undefined,
                            });
                        }
                    }
                    break;

                case 'recruiter_proposed':

                    if (candidateEmail) {
                        const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                        const recruiterName = recruiterContact?.name || 'Your recruiter';

                        await this.emailService.sendCandidateRecruiterProposed(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: DataLookupHelper.getJobCompanyName(job),
                            recruiterName: recruiterName,
                            applicationId: application_id,
                            userId: candidateUserId || undefined,
                        });
                    }

                    if (effectiveRecruiterId) {
                        const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                        if (recruiterContact) {
                            await this.emailService.sendApplicationStageChanged(recruiterContact.email, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: DataLookupHelper.getJobCompanyName(job),
                                oldStage: old_stage || 'Unknown',
                                newStage: 'recruiter_proposed',
                                applicationId: application_id,
                                userId: recruiterContact.user_id || undefined,
                            });
                        }
                    }
                    break;

                case 'submitted':

                    if (candidateEmail) {
                        if (effectiveRecruiterId) {
                            let recruiterName = 'Your recruiter';
                            const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                            if (recruiterContact) {
                                recruiterName = recruiterContact.name;
                            }

                            await this.emailService.sendCandidateApplicationWithRecruiter(candidateEmail, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: DataLookupHelper.getJobCompanyName(job),
                                recruiterName: recruiterName,
                                applicationId: application_id,
                                userId: candidateUserId || undefined,
                            });
                        } else {
                            await this.emailService.sendCandidateDirectApplication(candidateEmail, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: DataLookupHelper.getJobCompanyName(job),
                                applicationId: application_id,
                                userId: candidateUserId || undefined,
                            });
                        }
                    }

                    const companyAdmins = await this.contactLookup.getCompanyAdminContacts(job.company?.identity_organization_id || job.company_id);
                    for (const admin of companyAdmins) {
                        await this.emailService.sendApplicationCreated(admin.email, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: DataLookupHelper.getJobCompanyName(job),
                            applicationId: application_id,
                            userId: admin.user_id || undefined,
                        });
                    }

                    if (effectiveRecruiterId) {
                        const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                        if (recruiterContact) {
                            await this.emailService.sendApplicationStageChanged(recruiterContact.email, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: DataLookupHelper.getJobCompanyName(job),
                                oldStage: old_stage || 'Unknown',
                                newStage: 'submitted',
                                applicationId: application_id,
                                userId: recruiterContact.user_id || undefined,
                            });
                        }
                    }
                    break;

                case 'company_review':

                    if (candidateEmail) {
                        let recruiterName = undefined;
                        if (effectiveRecruiterId) {
                            const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                            if (recruiterContact) {
                                recruiterName = recruiterContact.name;
                            }
                        }

                        await this.emailService.sendCandidateCompanyReview(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: DataLookupHelper.getJobCompanyName(job),
                            hasRecruiter: !!effectiveRecruiterId,
                            recruiterName: recruiterName,
                            applicationId: application_id,
                            userId: candidateUserId || undefined,
                        });
                    }

                    if (effectiveRecruiterId) {
                        const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                        if (recruiterContact) {
                            await this.emailService.sendRecruiterCompanyReview(recruiterContact.email, {
                                recruiterName: recruiterContact.name,
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: DataLookupHelper.getJobCompanyName(job),
                                applicationId: application_id,
                                userId: recruiterContact.user_id || undefined,
                            });
                        }
                    }

                    {
                        const companyAdmins = await this.contactLookup.getCompanyAdminContacts(job.company?.identity_organization_id || job.company_id);
                        for (const admin of companyAdmins) {
                            await this.emailService.sendApplicationStageChanged(admin.email, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: DataLookupHelper.getJobCompanyName(job),
                                oldStage: old_stage || 'Unknown',
                                newStage: 'company_review',
                                applicationId: application_id,
                                userId: admin.user_id || undefined,
                            });
                        }
                    }
                    break;

                case 'company_feedback':

                    if (candidateEmail) {
                        let recruiterName = undefined;
                        if (effectiveRecruiterId) {
                            const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                            if (recruiterContact) {
                                recruiterName = recruiterContact.name;
                            }
                        }

                        await this.emailService.sendCandidateCompanyFeedback(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: DataLookupHelper.getJobCompanyName(job),
                            hasRecruiter: !!effectiveRecruiterId,
                            recruiterName: recruiterName,
                            applicationId: application_id,
                            userId: candidateUserId || undefined,
                        });
                    }

                    if (effectiveRecruiterId) {
                        const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                        if (recruiterContact) {
                            await this.emailService.sendRecruiterCompanyFeedback(recruiterContact.email, {
                                recruiterName: recruiterContact.name,
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: DataLookupHelper.getJobCompanyName(job),
                                applicationId: application_id,
                                userId: recruiterContact.user_id || undefined,
                            });
                        }
                    }

                    {
                        const companyAdmins = await this.contactLookup.getCompanyAdminContacts(job.company?.identity_organization_id || job.company_id);
                        for (const admin of companyAdmins) {
                            await this.emailService.sendApplicationStageChanged(admin.email, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: DataLookupHelper.getJobCompanyName(job),
                                oldStage: old_stage || 'Unknown',
                                newStage: 'company_feedback',
                                applicationId: application_id,
                                userId: admin.user_id || undefined,
                            });
                        }
                    }
                    break;

                case 'interview':

                    if (candidateEmail) {
                        let recruiterName = undefined;
                        if (effectiveRecruiterId) {
                            const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                            if (recruiterContact) {
                                recruiterName = recruiterContact.name;
                            }
                        }

                        await this.emailService.sendCandidateInterviewInvite(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: DataLookupHelper.getJobCompanyName(job),
                            applicationId: application_id,
                            hasRecruiter: !!effectiveRecruiterId,
                            recruiterName: recruiterName,
                            userId: candidateUserId || undefined,
                        });
                    }

                    if (effectiveRecruiterId) {
                        const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                        if (recruiterContact) {
                            await this.emailService.sendRecruiterInterviewScheduled(recruiterContact.email, {
                                recruiterName: recruiterContact.name,
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: DataLookupHelper.getJobCompanyName(job),
                                applicationId: application_id,
                                userId: recruiterContact.user_id || undefined,
                            });
                        }
                    }

                    {
                        const companyAdmins = await this.contactLookup.getCompanyAdminContacts(job.company?.identity_organization_id || job.company_id);
                        for (const admin of companyAdmins) {
                            await this.emailService.sendApplicationStageChanged(admin.email, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: DataLookupHelper.getJobCompanyName(job),
                                oldStage: old_stage || 'Unknown',
                                newStage: 'interview',
                                applicationId: application_id,
                                userId: admin.user_id || undefined,
                            });
                        }
                    }
                    break;

                case 'offer':

                    if (candidateEmail) {
                        let recruiterName = undefined;
                        if (effectiveRecruiterId) {
                            const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                            if (recruiterContact) {
                                recruiterName = recruiterContact.name;
                            }
                        }

                        await this.emailService.sendCandidateOfferReceived(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: DataLookupHelper.getJobCompanyName(job),
                            applicationId: application_id,
                            hasRecruiter: !!effectiveRecruiterId,
                            recruiterName: recruiterName,
                            userId: candidateUserId || undefined,
                            salary: event.payload.salary,
                        });
                    }

                    if (effectiveRecruiterId) {
                        const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                        if (recruiterContact) {
                            const salary = event.payload.salary;
                            const feePercentage = event.payload.fee_percentage;
                            const estimatedFee = salary && feePercentage ? Math.round((salary * feePercentage) / 100) : undefined;

                            await this.emailService.sendRecruiterOfferExtended(recruiterContact.email, {
                                recruiterName: recruiterContact.name,
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: DataLookupHelper.getJobCompanyName(job),
                                applicationId: application_id,
                                userId: recruiterContact.user_id || undefined,
                                salary,
                                feePercentage,
                                estimatedFee,
                            });
                        }
                    }

                    {
                        const companyAdmins = await this.contactLookup.getCompanyAdminContacts(job.company?.identity_organization_id || job.company_id);
                        for (const admin of companyAdmins) {
                            await this.emailService.sendApplicationStageChanged(admin.email, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: DataLookupHelper.getJobCompanyName(job),
                                oldStage: old_stage || 'Unknown',
                                newStage: 'offer',
                                applicationId: application_id,
                                userId: admin.user_id || undefined,
                            });
                        }
                    }
                    break;

                case 'hired':

                    const salary = event.payload.salary;
                    const startDate = event.payload.start_date;
                    const feePercentage = event.payload.fee_percentage;
                    const placementFee = event.payload.placement_fee;
                    const guaranteeDays = event.payload.guarantee_days;
                    const guaranteeExpiresAt = event.payload.guarantee_expires_at;

                    if (candidateEmail) {
                        let recruiterName = undefined;
                        if (effectiveRecruiterId) {
                            const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                            if (recruiterContact) {
                                recruiterName = recruiterContact.name;
                            }
                        }

                        await this.emailService.sendCandidateHired(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: DataLookupHelper.getJobCompanyName(job),
                            hasRecruiter: !!effectiveRecruiterId,
                            recruiterName: recruiterName,
                            userId: candidateUserId || undefined,
                            startDate,
                        });
                    }

                    if (effectiveRecruiterId) {
                        const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                        if (recruiterContact) {
                            await this.emailService.sendRecruiterCandidateHired(recruiterContact.email, {
                                recruiterName: recruiterContact.name,
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: DataLookupHelper.getJobCompanyName(job),
                                applicationId: application_id,
                                userId: recruiterContact.user_id || undefined,
                                salary,
                                placementFee,
                                feePercentage,
                                guaranteeDays,
                                guaranteeExpiresAt,
                                startDate,
                            });
                        }
                    }

                    const companyAdminsHired = await this.contactLookup.getCompanyAdminContacts(job.company?.identity_organization_id || job.company_id);
                    for (const admin of companyAdminsHired) {
                        await this.emailService.sendApplicationStageChanged(admin.email, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: DataLookupHelper.getJobCompanyName(job),
                            oldStage: old_stage || 'Unknown',
                            newStage: 'hired',
                            applicationId: application_id,
                            userId: admin.user_id || undefined,
                        });
                    }
                    break;

                case 'rejected':

                    if (candidateEmail) {
                        let recruiterName = undefined;
                        if (effectiveRecruiterId) {
                            const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                            if (recruiterContact) {
                                recruiterName = recruiterContact.name;
                            }
                        }

                        await this.emailService.sendCandidateApplicationRejected(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: DataLookupHelper.getJobCompanyName(job),
                            hasRecruiter: !!effectiveRecruiterId,
                            recruiterName: recruiterName,
                            userId: candidateUserId || undefined,
                        });
                    }

                    if (effectiveRecruiterId) {
                        const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                        if (recruiterContact) {
                            await this.emailService.sendRecruiterCandidateRejected(recruiterContact.email, {
                                recruiterName: recruiterContact.name,
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: DataLookupHelper.getJobCompanyName(job),
                                applicationId: application_id,
                                userId: recruiterContact.user_id || undefined,
                            });
                        }
                    }

                    // Only notify company if the application was previously in a company-visible stage
                    if (old_stage && COMPANY_VISIBLE_STAGES.includes(old_stage)) {
                        const companyAdmins = await this.contactLookup.getCompanyAdminContacts(job.company?.identity_organization_id || job.company_id);
                        for (const admin of companyAdmins) {
                            await this.emailService.sendApplicationStageChanged(admin.email, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: DataLookupHelper.getJobCompanyName(job),
                                oldStage: old_stage || 'Unknown',
                                newStage: 'rejected',
                                applicationId: application_id,
                                userId: admin.user_id || undefined,
                            });
                        }
                    }
                    break;

                case 'withdrawn':

                    if (effectiveRecruiterId) {
                        const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                        if (recruiterContact) {
                            await this.emailService.sendApplicationStageChanged(recruiterContact.email, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: DataLookupHelper.getJobCompanyName(job),
                                oldStage: old_stage || 'Unknown',
                                newStage: 'withdrawn',
                                applicationId: application_id,
                                userId: recruiterContact.user_id || undefined,
                            });
                        }
                    }

                    if (old_stage && COMPANY_VISIBLE_STAGES.includes(old_stage)) {
                        const companyAdminsWithdrawn = await this.contactLookup.getCompanyAdminContacts(job.company?.identity_organization_id || job.company_id);
                        for (const admin of companyAdminsWithdrawn) {
                            await this.emailService.sendApplicationStageChanged(admin.email, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: DataLookupHelper.getJobCompanyName(job),
                                oldStage: old_stage || 'Unknown',
                                newStage: 'withdrawn',
                                applicationId: application_id,
                                userId: admin.user_id || undefined,
                            });
                        }
                    }
                    break;

                case 'ai_reviewed':

                    if (candidateEmail) {
                        let recruiterName = undefined;
                        if (effectiveRecruiterId) {
                            const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                            if (recruiterContact) {
                                recruiterName = recruiterContact.name;
                            }
                        }

                        await this.emailService.sendCandidateAIReviewed(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: DataLookupHelper.getJobCompanyName(job),
                            hasRecruiter: !!effectiveRecruiterId,
                            recruiterName: recruiterName,
                            applicationId: application_id,
                            userId: candidateUserId || undefined,
                        });
                    }

                    if (effectiveRecruiterId) {
                        const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                        if (recruiterContact) {
                            await this.emailService.sendApplicationStageChanged(recruiterContact.email, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: DataLookupHelper.getJobCompanyName(job),
                                oldStage: old_stage || 'Unknown',
                                newStage: 'ai_reviewed',
                                applicationId: application_id,
                                userId: recruiterContact.user_id || undefined,
                            });
                        }
                    }
                    break;

                case 'expired':

                    if (candidateEmail) {
                        let recruiterName = undefined;
                        if (effectiveRecruiterId) {
                            const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                            if (recruiterContact) {
                                recruiterName = recruiterContact.name;
                            }
                        }

                        await this.emailService.sendCandidateApplicationExpired(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: DataLookupHelper.getJobCompanyName(job),
                            hasRecruiter: !!effectiveRecruiterId,
                            recruiterName: recruiterName,
                            applicationId: application_id,
                            userId: candidateUserId || undefined,
                        });
                    }

                    if (effectiveRecruiterId) {
                        const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                        if (recruiterContact) {
                            await this.emailService.sendApplicationStageChanged(recruiterContact.email, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: DataLookupHelper.getJobCompanyName(job),
                                oldStage: old_stage || 'Unknown',
                                newStage: 'expired',
                                applicationId: application_id,
                                userId: recruiterContact.user_id || undefined,
                            });
                        }
                    }
                    break;

                default:
                    if (effectiveRecruiterId) {
                        const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                        if (recruiterContact) {
                            await this.emailService.sendApplicationStageChanged(recruiterContact.email, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: DataLookupHelper.getJobCompanyName(job),
                                oldStage: old_stage || 'Unknown',
                                newStage: new_stage,
                                applicationId: application_id,
                                userId: recruiterContact.user_id || undefined,
                            });
                        }
                    }
            }

            this.logger.info({ application_id, new_stage }, 'Stage change notifications sent');
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send application stage changed notification'
            );
            throw error;
        }
    }

    async handleCandidateApplicationSubmitted(event: DomainEvent): Promise<void> {
        try {
            const { application_id, job_id, candidate_id, candidate_user_id, recruiter_id, has_recruiter, stage } = event.payload;

            this.logger.info({ application_id, has_recruiter, stage, candidate_user_id }, 'Handling candidate application submission');

            const job = await this.dataLookup.getJob(job_id);
            const candidate = await this.dataLookup.getCandidate(candidate_id);

            if (!job || !candidate) {
                this.logger.error({ application_id, hasJob: !!job, hasCandidate: !!candidate }, 'Missing job or candidate');
                throw new Error('Job or candidate not found');
            }

            const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);
            const candidateEmail = candidateContact?.email;
            const candidateUserId = candidate_user_id || null;

            // Scenario 1: Recruiter directly submits candidate
            if (has_recruiter && stage === 'submitted') {
                this.logger.info({ application_id }, 'Recruiter direct submission - notifying company');

                const recruiterContact = await this.contactLookup.getRecruiterContact(recruiter_id);
                if (!recruiterContact) {
                    this.logger.warn({ recruiter_id }, 'Cannot send recruiter notification - contact not found');
                    return;
                }

                const company = await this.dataLookup.getCompany(job.company_id);

                if (company?.identity_organization_id) {
                    const adminContacts = await this.contactLookup.getCompanyAdminContacts(company.identity_organization_id);
                    for (const admin of adminContacts) {
                        await this.emailService.sendCompanyApplicationReceived(admin.email, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            applicationId: application_id,
                            hasRecruiter: true,
                            recruiterName: recruiterContact.name,
                            userId: admin.user_id || undefined,
                        });
                    }
                }

                // Notify firm admins if job belongs to a firm
                if (job.source_firm_id) {
                    const firmAdmins = await this.contactLookup.getFirmAdminContacts(job.source_firm_id);
                    for (const admin of firmAdmins) {
                        await this.emailService.sendCompanyApplicationReceived(admin.email, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            applicationId: application_id,
                            hasRecruiter: true,
                            recruiterName: recruiterContact.name,
                            userId: admin.user_id || undefined,
                        });
                    }
                }

                await this.emailService.sendApplicationCreated(recruiterContact.email, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: DataLookupHelper.getJobCompanyName(job),
                    applicationId: application_id,
                    userId: recruiterContact.user_id || undefined,
                });

                return;
            }

            // Scenario 2: Candidate submits with recruiter (stage === 'screen')
            if (has_recruiter && stage === 'screen') {

                const nextSteps = 'Your application has been sent to your recruiter for review. They will enhance and submit it to the company.';

                if (candidateEmail) {
                    const recruiterContact = await this.contactLookup.getRecruiterContact(recruiter_id);
                    const recruiterName = recruiterContact?.name || 'Your recruiter';

                    await this.emailService.sendCandidateApplicationWithRecruiter(candidateEmail, {
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName: DataLookupHelper.getJobCompanyName(job),
                        recruiterName,
                        applicationId: application_id,
                        userId: candidateUserId || undefined,
                    });
                }

                const recruiterContact = await this.contactLookup.getRecruiterContact(recruiter_id);
                if (!recruiterContact) {
                    this.logger.warn({ recruiter_id }, 'Cannot send recruiter notification - contact not found');
                    return;
                }

                await this.emailService.sendRecruiterApplicationPending(recruiterContact.email, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: DataLookupHelper.getJobCompanyName(job),
                    applicationId: application_id,
                    userId: recruiterContact.user_id || undefined,
                });

                return;
            }

            // Scenario 3: Candidate submits directly to company (no recruiter)
            if (!has_recruiter && stage === 'submitted') {

                const nextSteps = 'Your application has been submitted directly to the company. They will review and contact you if interested.';

                if (candidateEmail) {
                    await this.emailService.sendCandidateDirectApplication(candidateEmail, {
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName: DataLookupHelper.getJobCompanyName(job),
                        applicationId: application_id,
                        userId: candidateUserId || undefined,
                    });
                }

                const company = await this.dataLookup.getCompany(job.company_id);
                if (company?.identity_organization_id) {
                    const adminContacts = await this.contactLookup.getCompanyAdminContacts(company.identity_organization_id);
                    for (const admin of adminContacts) {
                        await this.emailService.sendCompanyApplicationReceived(admin.email, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            applicationId: application_id,
                            hasRecruiter: false,
                            userId: admin.user_id || undefined,
                        });
                    }
                }

                // Notify firm admins if job belongs to a firm
                if (job.source_firm_id) {
                    const firmAdmins = await this.contactLookup.getFirmAdminContacts(job.source_firm_id);
                    for (const admin of firmAdmins) {
                        await this.emailService.sendCompanyApplicationReceived(admin.email, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            applicationId: application_id,
                            hasRecruiter: false,
                            userId: admin.user_id || undefined,
                        });
                    }
                }

                return;
            }

            // Scenario 4: Recruiter proposes job to candidate
            // This handles the generic createApplication() path where stage='recruiter_proposed'.
            // The dedicated proposeJobToCandidate() path publishes application.recruiter_proposed
            // instead and is handled by RecruiterSubmissionEventConsumer.
            if (has_recruiter && stage === 'recruiter_proposed') {

                if (candidateEmail) {
                    const recruiterContact = await this.contactLookup.getRecruiterContact(recruiter_id);
                    const recruiterName = recruiterContact?.name || 'Your recruiter';

                    await this.emailService.sendJobProposalToCandidate(candidateEmail, {
                        candidateName: candidate.full_name,
                        recruiterName,
                        jobTitle: job.title,
                        companyName: DataLookupHelper.getJobCompanyName(job),
                        applicationId: application_id,
                        userId: candidateUserId || undefined,
                    });
                }

                return;
            }

            // Scenario 5: Application submitted for AI review (user or GPT)
            if (stage === 'ai_review' || stage === 'gpt_review') {

                const nextSteps = has_recruiter
                    ? 'Your application is being reviewed by our AI system. Once complete, your recruiter will review and submit it to the company.'
                    : 'Your application is being reviewed by our AI system. Once complete, it will be submitted to the company for their review.';

                if (candidateEmail) {
                    await this.emailService.sendCandidateAIReview(candidateEmail, {
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName: DataLookupHelper.getJobCompanyName(job),
                        hasRecruiter: !!recruiter_id,
                        applicationId: application_id,
                        userId: candidateUserId || undefined,
                    });
                }

                if (recruiter_id) {
                    const recruiterContact = await this.contactLookup.getRecruiterContact(recruiter_id);
                    if (recruiterContact) {
                        await this.emailService.sendRecruiterApplicationPending(recruiterContact.email, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: DataLookupHelper.getJobCompanyName(job),
                            applicationId: application_id,
                            userId: recruiterContact.user_id || undefined,
                        });
                    }
                }

                return;
            }

        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send candidate application submission notifications'
            );
            throw error;
        }
    }

    async handleRecruiterSubmittedToCompany(event: DomainEvent): Promise<void> {
        try {
            const { application_id, job_id, candidate_id, candidate_user_id, recruiter_id, company_id } = event.payload;

            this.logger.info({ application_id }, 'Handling recruiter submission to company');

            const job = await this.dataLookup.getJob(job_id);
            const candidate = await this.dataLookup.getCandidate(candidate_id);

            if (!job || !candidate) {
                this.logger.error({ application_id }, 'Missing job or candidate');
                throw new Error('Job or candidate not found');
            }

            const recruiterContact = await this.contactLookup.getRecruiterContact(recruiter_id);
            if (!recruiterContact) {
                this.logger.warn({ recruiter_id }, 'Cannot notify recruiter - contact not found');
                return;
            }

            const company = await this.dataLookup.getCompany(company_id || job.company_id);

            if (company?.identity_organization_id) {
                const adminContacts = await this.contactLookup.getCompanyAdminContacts(company.identity_organization_id);
                for (const admin of adminContacts) {
                    await this.emailService.sendCompanyApplicationReceived(admin.email, {
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        applicationId: application_id,
                        hasRecruiter: true,
                        recruiterName: recruiterContact.name,
                        userId: admin.user_id || undefined,
                    });
                }
            }

            // Notify firm admins if job belongs to a firm
            if (job.source_firm_id) {
                const firmAdmins = await this.contactLookup.getFirmAdminContacts(job.source_firm_id);
                for (const admin of firmAdmins) {
                    await this.emailService.sendCompanyApplicationReceived(admin.email, {
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        applicationId: application_id,
                        hasRecruiter: true,
                        recruiterName: recruiterContact.name,
                        userId: admin.user_id || undefined,
                    });
                }
            }

            const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);
            if (candidateContact) {
                await this.emailService.sendCandidateApplicationSubmittedByRecruiter(candidateContact.email, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: DataLookupHelper.getJobCompanyName(job),
                    recruiterName: recruiterContact.name,
                    applicationId: application_id,
                    userId: candidate_user_id || undefined,
                });
            }

            this.logger.info({ application_id }, 'Recruiter submission to company notifications sent');
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send recruiter submission notifications'
            );
            throw error;
        }
    }

    async handleApplicationWithdrawn(event: DomainEvent): Promise<void> {
        try {
            const { application_id, job_id, candidate_id, recruiter_id, reason, candidate_user_id } = event.payload;

            this.logger.info({ application_id }, 'Handling application withdrawal by candidate');

            const job = await this.dataLookup.getJob(job_id);
            const candidate = await this.dataLookup.getCandidate(candidate_id);

            if (!job || !candidate) {
                this.logger.error({ application_id }, 'Missing job or candidate');
                throw new Error('Job or candidate not found');
            }

            const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);

            if (candidateContact) {
                await this.emailService.sendApplicationWithdrawn(candidateContact.email, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: DataLookupHelper.getJobCompanyName(job),
                    reason,
                    withdrawnBy: 'Candidate',
                    applicationId: application_id,
                    userId: candidate_user_id || undefined,
                });
            }

            if (recruiter_id) {
                const recruiterContact = await this.contactLookup.getRecruiterContact(recruiter_id);
                if (recruiterContact) {
                    await this.emailService.sendApplicationWithdrawn(recruiterContact.email, {
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName: DataLookupHelper.getJobCompanyName(job),
                        reason,
                        withdrawnBy: 'Candidate',
                        applicationId: application_id,
                        userId: recruiterContact.user_id || undefined,
                    });
                }
            }

            this.logger.info({ application_id }, 'Application withdrawal notifications sent');
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send application withdrawal notifications'
            );
            throw error;
        }
    }

    async handlePreScreenRequested(event: DomainEvent): Promise<void> {
        try {
            const {
                application_id,
                job_id,
                candidate_id,
                company_id,
                recruiter_id,
                requested_by_user_id,
                message,
                auto_assign,
            } = event.payload;

            this.logger.info({ application_id, recruiter_id, auto_assign }, 'Processing pre-screen request notification');

            const job = await this.dataLookup.getJob(job_id);
            const candidate = await this.dataLookup.getCandidate(candidate_id);
            const company = await this.dataLookup.getCompany(company_id);

            if (!job || !candidate || !company) {
                this.logger.error({ application_id }, 'Missing job, candidate, or company');
                throw new Error('Job, candidate, or company not found');
            }

            const requestingUserContact = await this.contactLookup.getContactByUserId(requested_by_user_id);

            if (!requestingUserContact) {
                this.logger.warn({ requested_by_user_id }, 'Cannot send confirmation - requesting user contact not found');
                return;
            }

            if (recruiter_id && !auto_assign) {
                const recruiterContact = await this.contactLookup.getRecruiterContact(recruiter_id);
                if (recruiterContact) {
                    await this.emailService.sendPreScreenRequested(recruiterContact.email, {
                        candidateName: candidate.full_name,
                        candidateEmail: candidate.email || 'Not provided',
                        jobTitle: job.title,
                        companyName: company.name,
                        requestedBy: requestingUserContact.name,
                        message: message || '',
                        userId: recruiterContact.user_id || undefined,
                    });
                    this.logger.info({ recruiter_id, recipient: recruiterContact.email }, 'Pre-screen request notification sent to recruiter');
                }
            }

            if (auto_assign) {
                this.logger.info({ application_id }, 'Pre-screen request is auto-assign, skipping notification');
            }

            await this.emailService.sendPreScreenRequestConfirmation(requestingUserContact.email, {
                candidateName: candidate.full_name,
                jobTitle: job.title,
                autoAssign: auto_assign,
                userId: requested_by_user_id,
            });

            this.logger.info({ application_id }, 'Pre-screen request notifications completed');
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send pre-screen request notifications'
            );
            throw error;
        }
    }

    async handleAIReviewStarted(event: DomainEvent): Promise<void> {
        try {
            const { application_id } = event.payload;
            this.logger.info({ application_id }, 'AI review started - no notification sent');
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to handle AI review started event'
            );
            throw error;
        }
    }

    async handleAIReviewCompleted(event: DomainEvent): Promise<void> {
        try {
            const {
                application_id,
                fit_score,
                recommendation,
            } = event.payload;

            this.logger.info(
                { application_id, fit_score, recommendation },
                'Processing AI review completed notification'
            );

            const context = await this.dataLookup.getApplicationContext(application_id);
            if (!context) {
                this.logger.error({ application_id }, 'Could not load application context');
                throw new Error(`Application context not found for ${application_id}`);
            }

            const { application, job, candidate } = context;
            const aiReview = await this.dataLookup.getAIReview(application_id);

            const candidateContact = await this.contactLookup.getCandidateContact(application.candidate_id);

            if (candidateContact) {
                await this.emailService.sendAIReviewCompletedToCandidate(candidateContact.email, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    fitScore: fit_score,
                    recommendation,
                    strengths: aiReview?.strengths || [],
                    concerns: aiReview?.concerns || [],
                    userId: candidate.user_id || undefined,
                    applicationId: application_id,
                });

                this.logger.info(
                    { application_id, recipient: candidateContact.email },
                    'AI review completed notification sent to candidate'
                );
            }

            if (application.candidate_recruiter_id) {
                const recruiterContact = await this.contactLookup.getRecruiterContact(application.candidate_recruiter_id);

                if (recruiterContact) {
                    await this.emailService.sendAIReviewCompletedToRecruiter(recruiterContact.email, {
                        recruiterName: recruiterContact.name,
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        fitScore: fit_score,
                        recommendation,
                        overallSummary: aiReview?.overall_summary || '',
                        strengths: aiReview?.strengths || [],
                        concerns: aiReview?.concerns || [],
                        matchedSkills: aiReview?.matched_skills || [],
                        missingSkills: aiReview?.missing_skills || [],
                        userId: recruiterContact.user_id || undefined,
                        applicationId: application_id,
                    });

                    this.logger.info(
                        { application_id, recipient: recruiterContact.email },
                        'AI review completed notification sent to recruiter'
                    );
                }
            }

            this.logger.info({ application_id }, 'AI review completed notifications sent');
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send AI review completed notifications'
            );
            throw error;
        }
    }

    async handleAIReviewFailed(event: DomainEvent): Promise<void> {
        try {
            const { application_id, error: errorMsg } = event.payload;
            this.logger.warn({ application_id, error: errorMsg }, 'AI review failed - notifying admin team');
            this.logger.error({ application_id, error: errorMsg }, 'AI REVIEW FAILED - ADMIN ALERT');
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to handle AI review failed event'
            );
            throw error;
        }
    }

    async handleDraftCompleted(event: DomainEvent): Promise<void> {
        try {
            const { application_id } = event.payload;
            this.logger.info({ application_id }, 'Application draft completed - AI review will be triggered automatically');
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to handle draft completed event'
            );
            throw error;
        }
    }

    async handleApplicationProposalAccepted(event: DomainEvent): Promise<void> {
        try {
            const { application_id, candidate_id, job_id, recruiter_id, accepted_by } = event.payload;

            this.logger.info({ application_id, recruiter_id, candidate_id }, 'Processing proposal accepted notification');

            // Fetch recruiter contact (REQUIRED)
            const recruiterContact = await this.contactLookup.getRecruiterContact(recruiter_id);
            if (!recruiterContact) {
                this.logger.error({ application_id, recruiter_id }, 'Recruiter contact not found');
                throw new Error(`Recruiter contact not found: ${recruiter_id}`);
            }

            // Fetch candidate contact (REQUIRED)
            const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);
            if (!candidateContact) {
                this.logger.error({ application_id, candidate_id }, 'Candidate contact not found');
                throw new Error(`Candidate contact not found: ${candidate_id}`);
            }

            // Fetch job details (REQUIRED)
            const job = await this.dataLookup.getJob(job_id);
            if (!job) {
                this.logger.error({ application_id, job_id }, 'Job not found');
                throw new Error(`Job not found: ${job_id}`);
            }

            // Send notification
            await this.emailService.sendApplicationProposalAccepted(recruiterContact.email, {
                recruiterName: recruiterContact.name,
                candidateName: candidateContact.name,
                jobTitle: job.title,
                companyName: DataLookupHelper.getJobCompanyName(job),
                applicationId: application_id,
                userId: recruiterContact.user_id || undefined,
            });

            this.logger.info(
                { application_id, recipient: recruiterContact.email },
                'Proposal accepted notification sent to recruiter'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send proposal accepted notification'
            );
            throw error;
        }
    }

    async handleApplicationProposalDeclined(event: DomainEvent): Promise<void> {
        try {
            const { application_id, candidate_id, job_id, recruiter_id, declined_by, reason } = event.payload;

            this.logger.info({ application_id, recruiter_id, candidate_id }, 'Processing proposal declined notification');

            // Fetch recruiter contact (REQUIRED)
            const recruiterContact = await this.contactLookup.getRecruiterContact(recruiter_id);
            if (!recruiterContact) {
                this.logger.error({ application_id, recruiter_id }, 'Recruiter contact not found');
                throw new Error(`Recruiter contact not found: ${recruiter_id}`);
            }

            // Fetch candidate contact (REQUIRED)
            const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);
            if (!candidateContact) {
                this.logger.error({ application_id, candidate_id }, 'Candidate contact not found');
                throw new Error(`Candidate contact not found: ${candidate_id}`);
            }

            // Fetch job details (REQUIRED)
            const job = await this.dataLookup.getJob(job_id);
            if (!job) {
                this.logger.error({ application_id, job_id }, 'Job not found');
                throw new Error(`Job not found: ${job_id}`);
            }

            // Send notification
            await this.emailService.sendApplicationProposalDeclined(recruiterContact.email, {
                recruiterName: recruiterContact.name,
                candidateName: candidateContact.name,
                jobTitle: job.title,
                companyName: DataLookupHelper.getJobCompanyName(job),
                reason: reason || undefined,
                candidateId: candidate_id,
                userId: recruiterContact.user_id || undefined,
            });

            this.logger.info(
                { application_id, recipient: recruiterContact.email },
                'Proposal declined notification sent to recruiter'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send proposal declined notification'
            );
            throw error;
        }
    }

    /**
     * Handle application note created event
     * Notifies relevant parties based on note visibility:
     * - shared: all parties (candidate, recruiter, company)
     * - company_only: only company users
     * - candidate_only: only candidate-side users (candidate + recruiter)
     */
    async handleNoteCreated(event: DomainEvent): Promise<void> {
        try {
            const {
                noteId,
                application_id,
                note_type,
                visibility,
                created_by_type,
                created_by_user_id,
                message_text,
            } = event.payload;

            this.logger.info(
                { noteId, application_id, visibility, created_by_type },
                'Processing note created notification'
            );

            // Get application context
            const context = await this.dataLookup.getApplicationContext(application_id);
            if (!context) {
                this.logger.error({ application_id }, 'Could not load application context');
                throw new Error(`Application context not found for ${application_id}`);
            }

            const { application, job, candidate } = context;

            // Get creator contact info
            const creatorContact = await this.contactLookup.getContactByUserId(created_by_user_id);
            const creatorName = creatorContact?.name || 'A team member';

            // Map creator type to human-readable role
            const roleLabels: Record<string, string> = {
                candidate: 'Candidate',
                candidate_recruiter: 'Recruiter',
                company_recruiter: 'Recruiter',
                hiring_manager: 'Hiring Manager',
                company_admin: 'Company Admin',
                platform_admin: 'Platform Admin',
            };
            const creatorRole = roleLabels[created_by_type] || 'Team Member';

            // Create note preview (first 200 chars)
            const notePreview = message_text && message_text.length > 200
                ? message_text.substring(0, 200) + '...'
                : message_text || 'No content';

            const notificationData = {
                candidateName: candidate.full_name,
                jobTitle: job.title,
                companyName: DataLookupHelper.getJobCompanyName(job),
                notePreview,
                addedByName: creatorName,
                addedByRole: creatorRole,
                applicationId: application_id,
            };

            // Collect recipients based on visibility
            const recipients: Array<{ email: string; name: string; userId?: string; source: 'portal' | 'candidate' }> = [];

            // Candidate-side recipients (candidate + their recruiter)
            const shouldNotifyCandidateSide = visibility === 'shared' || visibility === 'candidate_only';

            // Company-side recipients
            const shouldNotifyCompanySide = visibility === 'shared' || visibility === 'company_only';

            // Add candidate (if visibility allows and they're not the creator)
            if (shouldNotifyCandidateSide && candidate.email && candidate.user_id !== created_by_user_id) {
                recipients.push({
                    email: candidate.email,
                    name: candidate.full_name,
                    userId: candidate.user_id || undefined,
                    source: 'candidate',
                });
            }

            // Add recruiter (if visibility allows and they're not the creator)
            if (shouldNotifyCandidateSide && application.candidate_recruiter_id) {
                const recruiterContact = await this.contactLookup.getRecruiterContact(application.candidate_recruiter_id);
                if (recruiterContact && recruiterContact.user_id !== created_by_user_id) {
                    recipients.push({
                        email: recruiterContact.email,
                        name: recruiterContact.name,
                        userId: recruiterContact.user_id || undefined,
                        source: 'portal',
                    });
                }
            }

            // Add company admins (if visibility allows AND application has been submitted to company)
            const isSubmittedToCompany = COMPANY_VISIBLE_STAGES.includes(application.stage);
            if (shouldNotifyCompanySide && job.company_id && isSubmittedToCompany) {
                const company = await this.dataLookup.getCompany(job.company_id);
                if (company?.identity_organization_id) {
                    const companyAdmins = await this.contactLookup.getCompanyAdminContacts(company.identity_organization_id);
                    for (const admin of companyAdmins) {
                        // Don't notify the creator
                        if (admin.user_id !== created_by_user_id) {
                            recipients.push({
                                email: admin.email,
                                name: admin.name,
                                userId: admin.user_id || undefined,
                                source: 'portal',
                            });
                        }
                    }
                }
            } else if (shouldNotifyCompanySide && !isSubmittedToCompany) {
                this.logger.info(
                    { application_id, stage: application.stage },
                    'Skipping company notification — application not yet submitted to company'
                );
            }

            // Send notifications to all recipients
            for (const recipient of recipients) {
                await this.emailService.sendNoteCreated(recipient.email, {
                    recipientName: recipient.name,
                    ...notificationData,
                    userId: recipient.userId,
                    source: recipient.source,
                });
            }

            this.logger.info(
                { noteId, application_id, recipientCount: recipients.length },
                'Note created notifications sent'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send note created notification'
            );
            throw error;
        }
    }

    async handleApplicationExpired(event: DomainEvent): Promise<void> {
        try {
            const {
                application_id,
                job_id,
                candidate_id,
                candidate_recruiter_id,
                expired_from_stage,
                expired_at,
            } = event.payload;

            this.logger.info(
                { application_id, expired_from_stage },
                'Processing application expired notification'
            );

            const context = await this.dataLookup.getApplicationContext(application_id);
            if (!context) {
                this.logger.error({ application_id }, 'Could not load application context');
                throw new Error(`Application context not found for ${application_id}`);
            }

            const { application, job, candidate } = context;
            const companyName = DataLookupHelper.getJobCompanyName(job);
            const effectiveRecruiterId = candidate_recruiter_id || application.candidate_recruiter_id;

            // Send candidate notification
            const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);
            if (candidateContact) {
                let recruiterName: string | undefined;
                if (effectiveRecruiterId) {
                    const rc = await this.contactLookup.getRecruiterContact(effectiveRecruiterId);
                    if (rc) recruiterName = rc.name;
                }

                await this.emailService.sendCandidateApplicationExpiredStageAware(candidateContact.email, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName,
                    hasRecruiter: !!effectiveRecruiterId,
                    recruiterName,
                    expiredFromStage: expired_from_stage,
                    applicationId: application_id,
                    userId: candidateContact.user_id || undefined,
                });
            }

            // Send recruiter notification
            if (effectiveRecruiterId) {
                const recruiterContact = await this.contactLookup.getRecruiterContact(effectiveRecruiterId);
                if (recruiterContact) {
                    await this.emailService.sendRecruiterApplicationExpired(recruiterContact.email, {
                        recruiterName: recruiterContact.name,
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName,
                        expiredFromStage: expired_from_stage,
                        applicationId: application_id,
                        userId: recruiterContact.user_id || undefined,
                    });
                }
            }

            // Send company admin notification for company-responsible stages
            const companyStages = ['submitted', 'company_review', 'company_feedback'];
            if (companyStages.includes(expired_from_stage) && job.company?.identity_organization_id) {
                const companyAdmins = await this.contactLookup.getCompanyAdminContacts(job.company.identity_organization_id);
                const daysWaited = expired_at
                    ? Math.round((new Date(expired_at).getTime() - new Date(application.updated_at).getTime()) / (1000 * 60 * 60 * 24))
                    : 0;

                for (const admin of companyAdmins) {
                    await this.emailService.sendCompanyApplicationExpired(admin.email, {
                        jobTitle: job.title,
                        candidateName: candidate.full_name,
                        expiredFromStage: expired_from_stage,
                        daysWaited,
                        applicationId: application_id,
                        userId: admin.user_id || undefined,
                    });
                }
            }

            this.logger.info({ application_id, expired_from_stage }, 'Application expired notifications sent');
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send application expired notification'
            );
            throw error;
        }
    }

    async handleExpirationWarning(event: DomainEvent): Promise<void> {
        try {
            const {
                application_id,
                job_id,
                candidate_id,
                candidate_recruiter_id,
                stage,
                days_remaining,
                responsible_party,
            } = event.payload;

            this.logger.info(
                { application_id, stage, days_remaining, responsible_party },
                'Processing expiration warning notification'
            );

            const context = await this.dataLookup.getApplicationContext(application_id);
            if (!context) {
                this.logger.error({ application_id }, 'Could not load application context');
                throw new Error(`Application context not found for ${application_id}`);
            }

            const { application, job, candidate } = context;
            const companyName = DataLookupHelper.getJobCompanyName(job);
            const effectiveRecruiterId = candidate_recruiter_id || application.candidate_recruiter_id;

            if (responsible_party === 'candidate') {
                // Send candidate warning
                const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);
                if (candidateContact) {
                    let recruiterName: string | undefined;
                    if (effectiveRecruiterId) {
                        const rc = await this.contactLookup.getRecruiterContact(effectiveRecruiterId);
                        if (rc) recruiterName = rc.name;
                    }

                    await this.emailService.sendCandidateExpirationWarning(candidateContact.email, {
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName,
                        recruiterName,
                        stage,
                        daysRemaining: days_remaining,
                        applicationId: application_id,
                        userId: candidateContact.user_id || undefined,
                    });
                }

                // Send recruiter FYI
                if (effectiveRecruiterId) {
                    const recruiterContact = await this.contactLookup.getRecruiterContact(effectiveRecruiterId);
                    if (recruiterContact) {
                        await this.emailService.sendRecruiterExpirationWarning(recruiterContact.email, {
                            recruiterName: recruiterContact.name,
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName,
                            stage,
                            daysRemaining: days_remaining,
                            applicationId: application_id,
                            userId: recruiterContact.user_id || undefined,
                        });
                    }
                }
            } else if (responsible_party === 'recruiter') {
                // Send recruiter warning
                if (effectiveRecruiterId) {
                    const recruiterContact = await this.contactLookup.getRecruiterContact(effectiveRecruiterId);
                    if (recruiterContact) {
                        await this.emailService.sendRecruiterExpirationWarning(recruiterContact.email, {
                            recruiterName: recruiterContact.name,
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName,
                            stage,
                            daysRemaining: days_remaining,
                            applicationId: application_id,
                            userId: recruiterContact.user_id || undefined,
                        });
                    }
                }
            } else if (responsible_party === 'company') {
                // Send recruiter FYI
                if (effectiveRecruiterId) {
                    const recruiterContact = await this.contactLookup.getRecruiterContact(effectiveRecruiterId);
                    if (recruiterContact) {
                        await this.emailService.sendRecruiterExpirationWarning(recruiterContact.email, {
                            recruiterName: recruiterContact.name,
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName,
                            stage,
                            daysRemaining: days_remaining,
                            applicationId: application_id,
                            userId: recruiterContact.user_id || undefined,
                        });
                    }
                }

                // Send company admin warning
                if (job.company?.identity_organization_id) {
                    const companyAdmins = await this.contactLookup.getCompanyAdminContacts(job.company.identity_organization_id);
                    for (const admin of companyAdmins) {
                        await this.emailService.sendCompanyExpirationWarning(admin.email, {
                            companyName,
                            daysRemaining: days_remaining,
                            applications: [{ jobTitle: job.title, candidateName: candidate.full_name }],
                            userId: admin.user_id || undefined,
                        });
                    }
                }
            }

            this.logger.info({ application_id, stage, responsible_party }, 'Expiration warning notifications sent');
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send expiration warning notification'
            );
            throw error;
        }
    }

    async handleApplicationReactivated(event: DomainEvent): Promise<void> {
        try {
            const {
                application_id,
                job_id,
                candidate_id,
                candidate_recruiter_id,
                reactivated_from_stage,
            } = event.payload;

            this.logger.info(
                { application_id, reactivated_from_stage },
                'Processing application reactivated notification'
            );

            // For now, log the event. Full reactivation notifications can be added
            // as a follow-up if specific templates are needed.
            this.logger.info({ application_id, reactivated_from_stage }, 'Application reactivated - logged');
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to handle application reactivated notification'
            );
            throw error;
        }
    }

    async handleOfferAccepted(event: DomainEvent): Promise<void> {
        try {
            const { application_id, candidate_id, job_id } = event.payload;

            this.logger.info(
                { application_id, candidate_id, job_id },
                'Processing offer accepted notification'
            );

            const job = await this.dataLookup.getJob(job_id);
            const candidate = await this.dataLookup.getCandidate(candidate_id);
            const application = await this.dataLookup.getApplication(application_id);

            if (!job || !candidate) {
                this.logger.error({ application_id, hasJob: !!job, hasCandidate: !!candidate }, 'Missing job or candidate for offer accepted');
                throw new Error('Job or candidate not found');
            }

            const companyName = DataLookupHelper.getJobCompanyName(job, 'the company');
            const salary = application?.salary ?? undefined;
            const feePercentage = job.fee_percentage ?? undefined;
            const estimatedFee = salary && feePercentage
                ? Math.round((salary * feePercentage) / 100)
                : undefined;
            const location = job.location ?? undefined;

            // Notify the recruiter (if one is assigned)
            const recruiterId = application?.candidate_recruiter_id;
            if (recruiterId) {
                const recruiterContact = await this.contactLookup.getRecruiterContact(recruiterId);
                if (recruiterContact) {
                    await this.emailService.sendOfferAcceptedToRecruiter(recruiterContact.email, {
                        recruiterName: recruiterContact.name,
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName,
                        applicationId: application_id,
                        userId: recruiterContact.user_id || undefined,
                        salary,
                        feePercentage,
                        estimatedFee,
                        location,
                    });

                    this.logger.info(
                        { application_id, recipient: recruiterContact.email },
                        'Offer accepted notification sent to recruiter'
                    );
                } else {
                    this.logger.warn(
                        { application_id, recruiterId },
                        'Cannot send offer accepted email - recruiter contact not found'
                    );
                }
            }

            // Notify company admins
            const organizationId = job.company?.identity_organization_id;
            if (organizationId) {
                const companyAdmins = await this.contactLookup.getCompanyAdminContacts(organizationId);

                for (const admin of companyAdmins) {
                    await this.emailService.sendOfferAcceptedToCompany(admin.email, {
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName,
                        applicationId: application_id,
                        userId: admin.user_id || undefined,
                        salary,
                        location,
                    });

                    this.logger.info(
                        { application_id, recipient: admin.email },
                        'Offer accepted notification sent to company admin'
                    );
                }
            } else {
                this.logger.warn(
                    { application_id, job_id },
                    'Cannot send offer accepted email to company - no organization linked'
                );
            }

            // Notify firm admins (if job belongs to a firm)
            const firmId = job.source_firm_id;
            if (firmId) {
                const firmAdmins = await this.contactLookup.getFirmAdminContacts(firmId);

                for (const admin of firmAdmins) {
                    await this.emailService.sendOfferAcceptedToFirm(admin.email, {
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName,
                        applicationId: application_id,
                        userId: admin.user_id || undefined,
                        salary,
                        location,
                    });

                    this.logger.info(
                        { application_id, recipient: admin.email },
                        'Offer accepted notification sent to firm admin'
                    );
                }
            }
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send offer accepted notification'
            );
            throw error;
        }
    }
}
