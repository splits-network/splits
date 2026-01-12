import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { ApplicationsEmailService } from '../../services/applications/service';
import { ServiceRegistry } from '../../clients';
import { DataLookupHelper } from '../../helpers/data-lookup';
import { ContactLookupHelper } from '../../helpers/contact-lookup';

export class ApplicationsEventConsumer {
    constructor(
        private emailService: ApplicationsEmailService,
        private services: ServiceRegistry,
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
                    companyName: job.company?.name || 'the company',
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
            const { application_id, old_stage, new_stage, job_id, candidate_id, recruiter_id } = event.payload;

            this.logger.info({ application_id, old_stage, new_stage }, 'Processing stage changed notification');

            const context = await this.dataLookup.getApplicationContext(application_id);
            if (!context) {
                this.logger.error({ application_id }, 'Could not load application context');
                throw new Error(`Application context not found for ${application_id}`);
            }

            const { application, job, candidate } = context;

            const candidateEmail = candidate.email;
            const candidateUserId = candidate.user_id;
            const effectiveRecruiterId = recruiter_id || application.recruiter_id;

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
                            companyName: job.company?.name || 'Unknown Company',
                            applicationId: application_id,
                            recruiterNotes: application.recruiter_notes || undefined,
                            userId: candidateUserId || undefined,
                        });
                    }
                    break;

                case 'screen':

                    if (candidateEmail) {
                        await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: job.company?.name || 'Unknown Company',
                            hasRecruiter: !!effectiveRecruiterId,
                            nextSteps: 'Your recruiter will contact you to schedule an initial screening call.',
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
                                companyName: job.company?.name || 'Unknown Company',
                                oldStage: old_stage || 'Unknown',
                                newStage: 'screen',
                                applicationId: application_id,
                                userId: recruiterContact.user_id || undefined,
                            });
                        }
                    }
                    break;

                case 'submitted':

                    if (candidateEmail) {
                        await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: job.company?.name || 'Unknown Company',
                            hasRecruiter: !!effectiveRecruiterId,
                            nextSteps: 'Your application has been submitted to the company for review.',
                            applicationId: application_id,
                            userId: candidateUserId || undefined,
                        });
                    }

                    const companyAdmins = await this.contactLookup.getCompanyAdminContacts(job.company_id);
                    for (const admin of companyAdmins) {
                        await this.emailService.sendApplicationCreated(admin.email, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: job.company?.name || 'Unknown Company',
                            applicationId: application_id,
                        });
                    }

                    if (effectiveRecruiterId) {
                        const recruiterContact = await getRecruiterContact(effectiveRecruiterId);
                        if (recruiterContact) {
                            await this.emailService.sendApplicationStageChanged(recruiterContact.email, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: job.company?.name || 'Unknown Company',
                                oldStage: old_stage || 'Unknown',
                                newStage: 'submitted',
                                applicationId: application_id,
                                userId: recruiterContact.user_id || undefined,
                            });
                        }
                    }
                    break;

                case 'interview':

                    if (candidateEmail) {
                        await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: job.company?.name || 'Unknown Company',
                            hasRecruiter: !!effectiveRecruiterId,
                            nextSteps: 'The company would like to interview you! They will contact you to schedule.',
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
                                companyName: job.company?.name || 'Unknown Company',
                                oldStage: old_stage || 'Unknown',
                                newStage: 'interview',
                                applicationId: application_id,
                                userId: recruiterContact.user_id || undefined,
                            });
                        }
                    }
                    break;

                case 'offer':

                    if (candidateEmail) {
                        await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: job.company?.name || 'Unknown Company',
                            hasRecruiter: !!effectiveRecruiterId,
                            nextSteps: 'Congratulations! The company has extended an offer. Review the details and next steps.',
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
                                companyName: job.company?.name || 'Unknown Company',
                                oldStage: old_stage || 'Unknown',
                                newStage: 'offer',
                                applicationId: application_id,
                                userId: recruiterContact.user_id || undefined,
                            });
                        }
                    }
                    break;

                case 'hired':

                    if (candidateEmail) {
                        await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: job.company?.name || 'Unknown Company',
                            hasRecruiter: !!effectiveRecruiterId,
                            nextSteps: 'Congratulations on your new role! Welcome to the team.',
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
                                companyName: job.company?.name || 'Unknown Company',
                                oldStage: old_stage || 'Unknown',
                                newStage: 'hired',
                                applicationId: application_id,
                                userId: recruiterContact.user_id || undefined,
                            });
                        }
                    }

                    const companyAdminsHired = await this.contactLookup.getCompanyAdminContacts(job.company_id);
                    for (const admin of companyAdminsHired) {
                        await this.emailService.sendApplicationStageChanged(admin.email, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: job.company?.name || 'Unknown Company',
                            oldStage: old_stage || 'Unknown',
                            newStage: 'hired',
                            applicationId: application_id,
                        });
                    }
                    break;

                case 'rejected':

                    if (candidateEmail) {
                        await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: job.company?.name || 'Unknown Company',
                            hasRecruiter: !!effectiveRecruiterId,
                            nextSteps: 'Thank you for your interest. The company has decided to move forward with other candidates at this time.',
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
                                companyName: job.company?.name || 'Unknown Company',
                                oldStage: old_stage || 'Unknown',
                                newStage: 'rejected',
                                applicationId: application_id,
                                userId: recruiterContact.user_id || undefined,
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
                                companyName: job.company?.name || 'Unknown Company',
                                oldStage: old_stage || 'Unknown',
                                newStage: 'withdrawn',
                                applicationId: application_id,
                                userId: recruiterContact.user_id || undefined,
                            });
                        }
                    }

                    if (old_stage === 'submitted' || old_stage === 'interview' || old_stage === 'offer') {
                        const companyAdminsWithdrawn = await this.contactLookup.getCompanyAdminContacts(job.company_id);
                        for (const admin of companyAdminsWithdrawn) {
                            await this.emailService.sendApplicationStageChanged(admin.email, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: job.company?.name || 'Unknown Company',
                                oldStage: old_stage || 'Unknown',
                                newStage: 'withdrawn',
                                applicationId: application_id,
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
                                companyName: job.company?.name || 'Unknown Company',
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
                            userId: undefined,
                        });
                    }
                }

                await this.emailService.sendApplicationCreated(recruiterContact.email, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: job.company?.name || 'Unknown Company',
                    applicationId: application_id,
                    userId: recruiterContact.user_id || undefined,
                });

                return;
            }

            // Scenario 2: Candidate submits with recruiter (stage === 'screen')
            if (has_recruiter && stage === 'screen') {

                const nextSteps = 'Your application has been sent to your recruiter for review. They will enhance and submit it to the company.';

                if (candidateEmail) {
                    await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName: job.company?.name || 'Unknown Company',
                        hasRecruiter: true,
                        nextSteps,
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
                    companyName: job.company?.name || 'Unknown Company',
                    applicationId: application_id,
                    userId: recruiterContact.user_id || undefined,
                });

                return;
            }

            // Scenario 3: Candidate submits directly to company (no recruiter)
            if (!has_recruiter && stage === 'submitted') {

                const nextSteps = 'Your application has been submitted directly to the company. They will review and contact you if interested.';

                if (candidateEmail) {
                    await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName: job.company?.name || 'Unknown Company',
                        hasRecruiter: false,
                        nextSteps,
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
                            userId: undefined,
                        });
                    }
                }

                return;
            }

            // Scenario 4: Recruiter proposes job to candidate
            if (has_recruiter && stage === 'recruiter_proposed') {

                if (candidateEmail) {
                    const recruiterContact = await this.contactLookup.getRecruiterContact(recruiter_id);
                    const recruiterName = recruiterContact?.name || 'Your recruiter';

                    await this.emailService.sendJobProposalToCandidate(candidateEmail, {
                        candidateName: candidate.full_name,
                        recruiterName,
                        jobTitle: job.title,
                        companyName: job.company?.name || 'Unknown Company',
                        applicationId: application_id,
                        userId: candidateUserId || undefined,
                    });
                }

                return;
            }

            // Scenario 5: Application submitted for AI review
            if (stage === 'ai_review') {

                const nextSteps = has_recruiter
                    ? 'Your application is being reviewed by our AI system. Once complete, your recruiter will review and submit it to the company.'
                    : 'Your application is being reviewed by our AI system. Once complete, it will be submitted to the company for their review.';

                if (candidateEmail) {
                    await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName: job.company?.name || 'Unknown Company',
                        hasRecruiter: !!recruiter_id,
                        nextSteps,
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
                            companyName: job.company?.name || 'Unknown Company',
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
                        userId: undefined,
                    });
                }
            }

            const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);
            if (candidateContact) {
                await this.emailService.sendCandidateApplicationSubmitted(candidateContact.email, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: job.company?.name || 'Unknown Company',
                    hasRecruiter: true,
                    nextSteps: 'Your recruiter has reviewed and submitted your application to the company. They will be in touch if there is interest.',
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

            const company = job.company || await this.dataLookup.getCompany(job.company_id);
            const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);

            if (candidateContact) {
                await this.emailService.sendApplicationWithdrawn(candidateContact.email, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: job.company?.name || company?.name || 'Unknown Company',
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
                        companyName: job.company?.name || company?.name || 'Unknown Company',
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

            if (application.recruiter_id) {
                const recruiterContact = await this.contactLookup.getRecruiterContact(application.recruiter_id);

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
}
