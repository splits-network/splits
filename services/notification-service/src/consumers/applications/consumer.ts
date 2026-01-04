import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { ApplicationsEmailService } from '../../services/applications/service';
import { ServiceRegistry } from '../../clients';
import { EmailLookupHelper } from '../../helpers/email-lookup';

export class ApplicationsEventConsumer {
    constructor(
        private emailService: ApplicationsEmailService,
        private services: ServiceRegistry,
        private emailLookup: EmailLookupHelper,
        private logger: Logger
    ) {}

    async handleApplicationAccepted(event: DomainEvent): Promise<void> {
        try {
            const { application_id, job_id, candidate_id, recruiter_id, company_id, accepted_by_user_id } = event.payload;

            this.logger.info(
                { application_id, job_id, recruiter_id },
                'Processing application accepted notification'
            );

            // Fetch job details
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;

            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;

            if (recruiter_id) {
                // Get recruiter email using helper
                const recruiterEmail = await this.emailLookup.getRecruiterEmail(recruiter_id);

                if (!recruiterEmail) {
                    this.logger.warn(
                        { application_id, recruiter_id },
                        'Cannot send application accepted email - recruiter has no email address'
                    );
                    return;
                }

                // Fetch recruiter to get user_id for tracking
                const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${recruiter_id}`);
                const recruiter = recruiterResponse.data || recruiterResponse;

                // Send email notification to recruiter
                await this.emailService.sendApplicationAccepted(recruiterEmail, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: job.company?.name || 'the company',
                    applicationId: application_id,
                    userId: recruiter.user_id,
                });

                this.logger.info(
                    { application_id, recipient: recruiterEmail },
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
            const { application_id, old_stage, new_stage, job_id, candidate_id, recruiter_id, fit_score, recommendation } = event.payload;

            console.log('[APPLICATIONS-CONSUMER] 🔄 Stage changed:', { application_id, old_stage, new_stage });
            this.logger.info({ application_id, old_stage, new_stage }, 'Processing stage changed notification');

            // Special handling for AI review completion
            if (old_stage === 'ai_review' && (new_stage === 'screen' || new_stage === 'submitted')) {
                this.logger.info({ 
                    application_id, 
                    fit_score, 
                    recommendation,
                    next_stage: new_stage
                }, 'AI review completed, handling notifications');
                
                // Let the AI review completed handler deal with it
                // This includes the fit score and recommendation
                await this.handleAIReviewCompleted({
                    ...event,
                    payload: {
                        ...event.payload,
                        ai_review_completed: true,
                    }
                });
                
                // Continue with normal stage change notification
            }

            // Fetch application details
            const applicationResponse = await this.services.getAtsService().get<any>(`/applications/${application_id}`);
            const application = applicationResponse.data || applicationResponse;

            // Fetch job details
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id || application.job_id}`);
            const job = jobResponse.data || jobResponse;

            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id || application.candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;

            const candidateEmail = candidate.email;
            const candidateUserId = candidate.user_id;
            const effectiveRecruiterId = recruiter_id || application.recruiter_id;

            // Handle stage-specific notifications
            switch (new_stage) {
                case 'screen':
                    // Recruiter screen scheduled
                    console.log('[APPLICATIONS-CONSUMER] 📞 Screen stage - notifying candidate and recruiter');
                    
                    // Notify candidate
                    if (candidateEmail) {
                        await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: job.company?.name || 'Unknown Company',
                            hasRecruiter: !!effectiveRecruiterId,
                            nextSteps: 'Your recruiter will contact you to schedule an initial screening call.',
                            applicationId: application_id,
                            userId: candidateUserId,
                        });
                    }
                    
                    // Notify recruiter
                    if (effectiveRecruiterId) {
                        const recruiterEmail = await this.emailLookup.getRecruiterEmail(effectiveRecruiterId);
                        if (recruiterEmail) {
                            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${effectiveRecruiterId}`);
                            const recruiter = recruiterResponse.data || recruiterResponse;
                            
                            await this.emailService.sendApplicationStageChanged(recruiterEmail, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: job.company?.name || 'Unknown Company',
                                oldStage: old_stage || 'Unknown',
                                newStage: 'screen',
                                applicationId: application_id,
                                userId: recruiter.user_id,
                            });
                        }
                    }
                    break;

                case 'submitted':
                    // Submitted to company
                    console.log('[APPLICATIONS-CONSUMER] 📤 Submitted stage - notifying candidate, recruiter, and company');
                    
                    // Notify candidate
                    if (candidateEmail) {
                        await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: job.company?.name || 'Unknown Company',
                            hasRecruiter: !!effectiveRecruiterId,
                            nextSteps: 'Your application has been submitted to the company for review.',
                            applicationId: application_id,
                            userId: candidateUserId,
                        });
                    }
                    
                    // Notify company admins
                    const companyEmails = await this.emailLookup.getCompanyAdminEmails(job.company_id);
                    for (const email of companyEmails) {
                        await this.emailService.sendApplicationCreated(email, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: job.company?.name || 'Unknown Company',
                            applicationId: application_id,
                        });
                    }
                    
                    // Notify recruiter if present
                    if (effectiveRecruiterId) {
                        const recruiterEmail = await this.emailLookup.getRecruiterEmail(effectiveRecruiterId);
                        if (recruiterEmail) {
                            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${effectiveRecruiterId}`);
                            const recruiter = recruiterResponse.data || recruiterResponse;
                            
                            await this.emailService.sendApplicationStageChanged(recruiterEmail, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: job.company?.name || 'Unknown Company',
                                oldStage: old_stage || 'Unknown',
                                newStage: 'submitted',
                                applicationId: application_id,
                                userId: recruiter.user_id,
                            });
                        }
                    }
                    break;

                case 'interview':
                    // Interview scheduled
                    console.log('[APPLICATIONS-CONSUMER] 🎤 Interview stage - notifying all parties');
                    
                    // Notify candidate
                    if (candidateEmail) {
                        await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: job.company?.name || 'Unknown Company',
                            hasRecruiter: !!effectiveRecruiterId,
                            nextSteps: 'The company would like to interview you! They will contact you to schedule.',
                            applicationId: application_id,
                            userId: candidateUserId,
                        });
                    }
                    
                    // Notify recruiter
                    if (effectiveRecruiterId) {
                        const recruiterEmail = await this.emailLookup.getRecruiterEmail(effectiveRecruiterId);
                        if (recruiterEmail) {
                            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${effectiveRecruiterId}`);
                            const recruiter = recruiterResponse.data || recruiterResponse;
                            
                            await this.emailService.sendApplicationStageChanged(recruiterEmail, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: job.company?.name || 'Unknown Company',
                                oldStage: old_stage || 'Unknown',
                                newStage: 'interview',
                                applicationId: application_id,
                                userId: recruiter.user_id,
                            });
                        }
                    }
                    break;

                case 'offer':
                    // Offer extended
                    console.log('[APPLICATIONS-CONSUMER] 🎉 Offer stage - notifying candidate and recruiter');
                    
                    // Notify candidate
                    if (candidateEmail) {
                        await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: job.company?.name || 'Unknown Company',
                            hasRecruiter: !!effectiveRecruiterId,
                            nextSteps: 'Congratulations! The company has extended an offer. Review the details and next steps.',
                            applicationId: application_id,
                            userId: candidateUserId,
                        });
                    }
                    
                    // Notify recruiter
                    if (effectiveRecruiterId) {
                        const recruiterEmail = await this.emailLookup.getRecruiterEmail(effectiveRecruiterId);
                        if (recruiterEmail) {
                            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${effectiveRecruiterId}`);
                            const recruiter = recruiterResponse.data || recruiterResponse;
                            
                            await this.emailService.sendApplicationStageChanged(recruiterEmail, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: job.company?.name || 'Unknown Company',
                                oldStage: old_stage || 'Unknown',
                                newStage: 'offer',
                                applicationId: application_id,
                                userId: recruiter.user_id,
                            });
                        }
                    }
                    break;

                case 'hired':
                    // Candidate accepted offer
                    console.log('[APPLICATIONS-CONSUMER] ✅ Hired stage - notifying everyone');
                    
                    // Notify candidate
                    if (candidateEmail) {
                        await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: job.company?.name || 'Unknown Company',
                            hasRecruiter: !!effectiveRecruiterId,
                            nextSteps: 'Congratulations on your new role! Welcome to the team.',
                            applicationId: application_id,
                            userId: candidateUserId,
                        });
                    }
                    
                    // Notify recruiter
                    if (effectiveRecruiterId) {
                        const recruiterEmail = await this.emailLookup.getRecruiterEmail(effectiveRecruiterId);
                        if (recruiterEmail) {
                            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${effectiveRecruiterId}`);
                            const recruiter = recruiterResponse.data || recruiterResponse;
                            
                            await this.emailService.sendApplicationStageChanged(recruiterEmail, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: job.company?.name || 'Unknown Company',
                                oldStage: old_stage || 'Unknown',
                                newStage: 'hired',
                                applicationId: application_id,
                                userId: recruiter.user_id,
                            });
                        }
                    }
                    
                    // Notify company
                    const companyEmailsHired = await this.emailLookup.getCompanyAdminEmails(job.company_id);
                    for (const email of companyEmailsHired) {
                        await this.emailService.sendApplicationStageChanged(email, {
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
                    // Application rejected
                    console.log('[APPLICATIONS-CONSUMER] ❌ Rejected stage - notifying candidate and recruiter');
                    
                    // Notify candidate (if appropriate - may want to be gentle)
                    if (candidateEmail) {
                        await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: job.company?.name || 'Unknown Company',
                            hasRecruiter: !!effectiveRecruiterId,
                            nextSteps: 'Thank you for your interest. The company has decided to move forward with other candidates at this time.',
                            applicationId: application_id,
                            userId: candidateUserId,
                        });
                    }
                    
                    // Notify recruiter
                    if (effectiveRecruiterId) {
                        const recruiterEmail = await this.emailLookup.getRecruiterEmail(effectiveRecruiterId);
                        if (recruiterEmail) {
                            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${effectiveRecruiterId}`);
                            const recruiter = recruiterResponse.data || recruiterResponse;
                            
                            await this.emailService.sendApplicationStageChanged(recruiterEmail, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: job.company?.name || 'Unknown Company',
                                oldStage: old_stage || 'Unknown',
                                newStage: 'rejected',
                                applicationId: application_id,
                                userId: recruiter.user_id,
                            });
                        }
                    }
                    break;

                case 'withdrawn':
                    // Candidate withdrew
                    console.log('[APPLICATIONS-CONSUMER] 🚫 Withdrawn stage - notifying recruiter and company');
                    
                    // Notify recruiter
                    if (effectiveRecruiterId) {
                        const recruiterEmail = await this.emailLookup.getRecruiterEmail(effectiveRecruiterId);
                        if (recruiterEmail) {
                            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${effectiveRecruiterId}`);
                            const recruiter = recruiterResponse.data || recruiterResponse;
                            
                            await this.emailService.sendApplicationStageChanged(recruiterEmail, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: job.company?.name || 'Unknown Company',
                                oldStage: old_stage || 'Unknown',
                                newStage: 'withdrawn',
                                applicationId: application_id,
                                userId: recruiter.user_id,
                            });
                        }
                    }
                    
                    // Notify company (if was already submitted)
                    if (old_stage === 'submitted' || old_stage === 'interview' || old_stage === 'offer') {
                        const companyEmailsWithdrawn = await this.emailLookup.getCompanyAdminEmails(job.company_id);
                        for (const email of companyEmailsWithdrawn) {
                            await this.emailService.sendApplicationStageChanged(email, {
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
                    // For draft, ai_review, or any other stage, notify recruiter if present
                    console.log('[APPLICATIONS-CONSUMER] ℹ️ Other stage change - notifying recruiter only');
                    if (effectiveRecruiterId) {
                        const recruiterEmail = await this.emailLookup.getRecruiterEmail(effectiveRecruiterId);
                        if (recruiterEmail) {
                            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${effectiveRecruiterId}`);
                            const recruiter = recruiterResponse.data || recruiterResponse;
                            
                            await this.emailService.sendApplicationStageChanged(recruiterEmail, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: job.company?.name || 'Unknown Company',
                                oldStage: old_stage || 'Unknown',
                                newStage: new_stage,
                                applicationId: application_id,
                                userId: recruiter.user_id,
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

    /**
     * Handle application submitted by candidate (either to recruiter or company)
     */
    async handleCandidateApplicationSubmitted(event: DomainEvent): Promise<void> {
        try {
            const { application_id, job_id, candidate_id, candidate_user_id, recruiter_id, has_recruiter, stage } = event.payload;

            console.log('[APPLICATIONS-CONSUMER] 🎯 Starting to handle application.created event:', {
                application_id,
                has_recruiter,
                stage,
                candidate_user_id,
                recruiter_id,
            });
            this.logger.info({ application_id, has_recruiter, stage, candidate_user_id }, 'Handling candidate application submission');

            // Fetch job details
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;

            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;

            // Get candidate email using helper
            const candidateEmail = await this.emailLookup.getCandidateEmail(candidate_id);
            const candidateUserId = candidate_user_id || null; // For tracking purposes

            // Scenario 1: Recruiter directly submits candidate (has_recruiter && stage === 'submitted')
            // This is when a recruiter sources and immediately submits a candidate to a company
            if (has_recruiter && stage === 'submitted') {
                this.logger.info({ application_id }, 'Recruiter direct submission - notifying company');

                // Get recruiter email and details
                const recruiterEmail = await this.emailLookup.getRecruiterEmail(recruiter_id);
                if (!recruiterEmail) {
                    this.logger.warn({ recruiter_id }, 'Cannot send recruiter notification - no email address');
                    return;
                }

                // Fetch recruiter to get user_id and name for email template
                const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${recruiter_id}`);
                const recruiter = recruiterResponse.data || recruiterResponse;
                
                const recruiterName = await this.emailLookup.getUserName(recruiter.user_id);

                // Get company admin emails
                const companyResponse = await this.services.getAtsService().get<any>(`/companies/${job.company_id}`);
                const company = companyResponse.data || companyResponse;

                if (company.identity_organization_id) {
                    const adminEmails = await this.emailLookup.getCompanyAdminEmails(company.identity_organization_id);

                    // Notify each admin
                    for (const adminEmail of adminEmails) {
                        await this.emailService.sendCompanyApplicationReceived(adminEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            applicationId: application_id,
                            hasRecruiter: true,
                            recruiterName: recruiterName || recruiterEmail,
                            userId: undefined, // Admin user ID not needed for tracking
                        });
                    }
                }

                // Also notify the recruiter of successful submission
                await this.emailService.sendApplicationCreated(recruiterEmail, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: job.company?.name || 'Unknown Company',
                    applicationId: application_id,
                    userId: recruiter.user_id,
                });

                return;
            }

            // Scenario 2: Candidate submits with recruiter (has_recruiter && stage === 'screen')
            // Application goes to recruiter first for review
            if (has_recruiter && stage === 'screen') {
                console.log('[APPLICATIONS-CONSUMER] 📋 Scenario 2: Candidate with recruiter');
                this.logger.info({ application_id }, 'Candidate application with recruiter - notifying candidate and recruiter');

                // Determine next steps message
                const nextSteps = 'Your application has been sent to your recruiter for review. They will enhance and submit it to the company.';

                // Send confirmation email to candidate (if they have an email)
                if (candidateEmail) {
                    console.log('[APPLICATIONS-CONSUMER] 📧 Sending email to candidate:', candidateEmail);
                    await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName: job.company?.name || 'Unknown Company',
                        hasRecruiter: true,
                        nextSteps,
                        applicationId: application_id,
                        userId: candidateUserId,
                    });
                    console.log('[APPLICATIONS-CONSUMER] ✅ Candidate email sent successfully');
                } else {
                    console.log('[APPLICATIONS-CONSUMER] ⚠️ Skipping candidate email (no email address found)');
                }

                // Notify recruiter of pending application
                console.log('[APPLICATIONS-CONSUMER] 🔍 Getting recruiter email...');
                const recruiterEmail = await this.emailLookup.getRecruiterEmail(recruiter_id);
                
                if (!recruiterEmail) {
                    this.logger.warn({ recruiter_id }, 'Cannot send recruiter notification - no email address');
                    return;
                }

                // Fetch recruiter to get user_id for tracking
                const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${recruiter_id}`);
                const recruiter = recruiterResponse.data || recruiterResponse;

                console.log('[APPLICATIONS-CONSUMER] 📧 Sending email to recruiter:', recruiterEmail);
                await this.emailService.sendRecruiterApplicationPending(recruiterEmail, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: job.company?.name || 'Unknown Company',
                    applicationId: application_id,
                    userId: recruiter.user_id,
                });
                console.log('[APPLICATIONS-CONSUMER] ✅ Recruiter email sent successfully');
                console.log('[APPLICATIONS-CONSUMER] 🎉 Scenario 2 complete - all notifications sent');

                return;
            }

            // Scenario 3: Candidate submits directly to company (no recruiter, stage === 'submitted')
            if (!has_recruiter && stage === 'submitted') {
                console.log('[APPLICATIONS-CONSUMER] 📋 Scenario 3: Direct to company (no recruiter)');
                this.logger.info({ application_id }, 'Direct candidate application - notifying candidate and company');

                const nextSteps = 'Your application has been submitted directly to the company. They will review and contact you if interested.';

                // Send confirmation email to candidate (if they have an email)
                if (candidateEmail) {
                    console.log('[APPLICATIONS-CONSUMER] 📧 Sending email to candidate:', candidateEmail);
                    await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName: job.company?.name || 'Unknown Company',
                        hasRecruiter: false,
                        nextSteps,
                        applicationId: application_id,
                        userId: candidateUserId,
                    });
                    console.log('[APPLICATIONS-CONSUMER] ✅ Candidate email sent successfully');
                } else {
                    console.log('[APPLICATIONS-CONSUMER] ⚠️ Skipping candidate email (no email address found)');
                }

                // Notify company admins
                console.log('[APPLICATIONS-CONSUMER] 🔍 Fetching company details...');
                const companyResponse = await this.services.getAtsService().get<any>(`/companies/${job.company_id}`);
                const company = companyResponse.data || companyResponse;

                if (company.identity_organization_id) {
                    console.log('[APPLICATIONS-CONSUMER] 🔍 Getting company admin emails...');
                    const adminEmails = await this.emailLookup.getCompanyAdminEmails(company.identity_organization_id);
                    console.log(`[APPLICATIONS-CONSUMER] 👥 Found ${adminEmails.length} company admin emails`);

                    // Notify each admin
                    for (const adminEmail of adminEmails) {
                        console.log('[APPLICATIONS-CONSUMER] 📧 Sending email to company admin:', adminEmail);
                        await this.emailService.sendCompanyApplicationReceived(adminEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            applicationId: application_id,
                            hasRecruiter: false,
                            userId: undefined, // Admin user ID not needed for tracking
                        });
                        console.log('[APPLICATIONS-CONSUMER] ✅ Company admin email sent successfully');
                    }
                } else {
                    console.log('[APPLICATIONS-CONSUMER] ⚠️ Company has no identity_organization_id - skipping company admin emails');
                }
                
                console.log('[APPLICATIONS-CONSUMER] 🎉 Scenario 3 complete - all notifications sent');

                return;
            }

            // Scenario 4: Recruiter proposes job to candidate (has_recruiter && stage === 'recruiter_proposed')
            if (has_recruiter && stage === 'recruiter_proposed') {
                console.log('[APPLICATIONS-CONSUMER] 📋 Scenario 4: Recruiter proposing job to candidate');
                this.logger.info({ application_id, recruiter_id }, 'Recruiter proposing job - notifying candidate');

                // Send notification email to candidate
                if (candidateEmail) {
                    console.log('[APPLICATIONS-CONSUMER] 📧 Sending job proposal email to candidate:', candidateEmail);
                    
                    // Get recruiter details
                    const recruiterEmail = await this.emailLookup.getRecruiterEmail(recruiter_id);
                    const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${recruiter_id}`);
                    const recruiter = recruiterResponse.data || recruiterResponse;
                    const recruiterName = await this.emailLookup.getUserName(recruiter.user_id) || recruiterEmail || 'Your recruiter';

                    await this.emailService.sendJobProposalToCandidate(candidateEmail, {
                        candidateName: candidate.full_name,
                        recruiterName,
                        jobTitle: job.title,
                        companyName: job.company?.name || 'Unknown Company',
                        applicationId: application_id,
                        userId: candidateUserId,
                    });
                    console.log('[APPLICATIONS-CONSUMER] ✅ Job proposal email sent to candidate');
                } else {
                    console.log('[APPLICATIONS-CONSUMER] ⚠️ Skipping candidate email (no email address found)');
                }

                return;
            }

            console.log('[APPLICATIONS-CONSUMER] ⚠️ No scenario matched - event details:', { has_recruiter, stage });
            this.logger.info({ application_id }, 'Candidate application submission notifications sent');
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send candidate application submission notifications'
            );
            throw error;
        }
    }

    /**
     * Handle recruiter submitting application to company
     */
    async handleRecruiterSubmittedToCompany(event: DomainEvent): Promise<void> {
        try {
            const { application_id, job_id, candidate_id, candidate_user_id, recruiter_id, company_id } = event.payload;

            console.log('[NOTIFICATION-SERVICE] 🎯 Handling recruiter submission to company:', {
                application_id,
                candidate_id,
                candidate_user_id,
                has_candidate_user_id: !!candidate_user_id,
            });

            this.logger.info({ application_id }, 'Handling recruiter submission to company');

            // Fetch job details
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;

            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;

            // Get recruiter email and details
            const recruiterEmail = await this.emailLookup.getRecruiterEmail(recruiter_id);
            if (!recruiterEmail) {
                this.logger.warn({ recruiter_id }, 'Cannot notify recruiter - no email address');
                return;
            }

            // Fetch recruiter to get user_id and name
            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;
            const recruiterName = await this.emailLookup.getUserName(recruiter.user_id);

            // Get company admins
            const companyResponse = await this.services.getAtsService().get<any>(`/companies/${company_id || job.company_id}`);
            const company = companyResponse.data || companyResponse;

            if (company.identity_organization_id) {
                const adminEmails = await this.emailLookup.getCompanyAdminEmails(company.identity_organization_id);

                // Notify each admin
                for (const adminEmail of adminEmails) {
                    await this.emailService.sendCompanyApplicationReceived(adminEmail, {
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        applicationId: application_id,
                        hasRecruiter: true,
                        recruiterName: recruiterName || recruiterEmail,
                        userId: undefined, // Admin user ID not needed for tracking
                    });
                }
            }

            // Send confirmation to candidate (only if they have an email)
            const candidateEmail = await this.emailLookup.getCandidateEmail(candidate_id);
            
            if (candidateEmail) {
                console.log('[NOTIFICATION-SERVICE] 📧 Sending email to candidate:', candidateEmail);
                
                await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: job.company?.name || 'Unknown Company',
                    hasRecruiter: true,
                    nextSteps: 'Your recruiter has reviewed and submitted your application to the company. They will be in touch if there is interest.',
                    applicationId: application_id,
                    userId: candidate_user_id || undefined,
                });

                console.log('[NOTIFICATION-SERVICE] ✅ Candidate email sent successfully');
            } else {
                console.log('[NOTIFICATION-SERVICE] ℹ️ No candidate email found - candidate is recruiter-managed (no email sent)');
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

    /**
     * Handle application withdrawal
     * Note: Only candidates can withdraw their own applications (enforced in ATS service)
     * So withdrawn_by is always 'Candidate'
     */
    async handleApplicationWithdrawn(event: DomainEvent): Promise<void> {
        try {
            const { application_id, job_id, candidate_id, recruiter_id, reason, candidate_user_id } = event.payload;

            console.log('[APPLICATIONS-CONSUMER] 🎯 Handling application.withdrawn event:', {
                application_id,
                candidate_id,
                candidate_user_id,
                recruiter_id,
            });
            this.logger.info({ application_id }, 'Handling application withdrawal by candidate');

            // Fetch job details
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;

            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;

            // Fetch company details
            const companyResponse = await this.services.getAtsService().get<any>(`/companies/${job.company_id}`);
            const company = companyResponse.data || companyResponse;

            // Get candidate email
            const candidateEmail = await this.emailLookup.getCandidateEmail(candidate_id);

            // Send confirmation email to candidate (only if they have an email)
            if (candidateEmail) {
                console.log('[APPLICATIONS-CONSUMER] 📧 Sending withdrawal confirmation to candidate:', candidateEmail);
                await this.emailService.sendApplicationWithdrawn(candidateEmail, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: job.company?.name || company.name || 'Unknown Company',
                    reason,
                    withdrawnBy: 'Candidate',
                    applicationId: application_id,
                    userId: candidate_user_id || null,
                });
                console.log('[APPLICATIONS-CONSUMER] ✅ Candidate email sent');
            } else {
                console.log('[APPLICATIONS-CONSUMER] ⚠️ Skipping candidate email (no email address found)');
            }

            // Notify recruiter if exists
            if (recruiter_id) {
                console.log('[APPLICATIONS-CONSUMER] 🔍 Getting recruiter email...');
                const recruiterEmail = await this.emailLookup.getRecruiterEmail(recruiter_id);

                if (recruiterEmail) {
                    // Fetch recruiter to get user_id for tracking
                    const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${recruiter_id}`);
                    const recruiter = recruiterResponse.data || recruiterResponse;

                    console.log('[APPLICATIONS-CONSUMER] 📧 Sending withdrawal notification to recruiter:', recruiterEmail);
                    await this.emailService.sendApplicationWithdrawn(recruiterEmail, {
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName: job.company?.name || company.name || 'Unknown Company',
                        reason,
                        withdrawnBy: 'Candidate',
                        applicationId: application_id,
                        userId: recruiter.user_id,
                    });
                    console.log('[APPLICATIONS-CONSUMER] ✅ Recruiter email sent');
                } else {
                    console.log('[APPLICATIONS-CONSUMER] ⚠️ Cannot notify recruiter - no email address');
                }
            } else {
                console.log('[APPLICATIONS-CONSUMER] ⚠️ No recruiter assigned to application');
            }

            console.log('[APPLICATIONS-CONSUMER] 🎉 Withdrawal notifications complete');
            this.logger.info({ application_id }, 'Application withdrawal notifications sent');
        } catch (error) {
            console.error('[APPLICATIONS-CONSUMER] ❌ Withdrawal handler failed:', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                event_payload: event.payload,
            });
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

            // Fetch job details
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;

            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;

            // Fetch company details
            const companyResponse = await this.services.getAtsService().get<any>(`/companies/${company_id}`);
            const company = companyResponse.data || companyResponse;

            // Get requesting user email and name
            const requestingUserEmail = await this.emailLookup.getEmailByUserId(requested_by_user_id);
            const requestingUserName = await this.emailLookup.getUserName(requested_by_user_id);
            
            if (!requestingUserEmail) {
                this.logger.warn({ requested_by_user_id }, 'Cannot send confirmation - requesting user has no email');
                return;
            }

            // Send notification to recruiter (if specified)
            if (recruiter_id && !auto_assign) {
                const recruiterEmail = await this.emailLookup.getRecruiterEmail(recruiter_id);
                
                if (recruiterEmail) {
                    // Fetch recruiter to get user_id for tracking
                    const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${recruiter_id}`);
                    const recruiter = recruiterResponse.data || recruiterResponse;

                    await this.emailService.sendPreScreenRequested(recruiterEmail, {
                        candidateName: candidate.full_name,
                        candidateEmail: candidate.email,
                        jobTitle: job.title,
                        companyName: company.name,
                        requestedBy: requestingUserName || requestingUserEmail,
                        message: message || '',
                        userId: recruiter.user_id,
                    });

                    this.logger.info({ recruiter_id, recipient: recruiterEmail }, 'Pre-screen request notification sent to recruiter');
                } else {
                    this.logger.warn({ recruiter_id }, 'Cannot notify recruiter - no email address');
                }
            }

            // If auto-assign, we don't send notification yet - wait for actual assignment
            if (auto_assign) {
                this.logger.info({ application_id }, 'Pre-screen request is auto-assign, skipping notification');
            }

            // Send confirmation to requesting user
            await this.emailService.sendPreScreenRequestConfirmation(requestingUserEmail, {
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

    // Phase 1.5 - AI Review event handlers

    async handleAIReviewStarted(event: DomainEvent): Promise<void> {
        try {
            const { application_id } = event.payload;

            this.logger.info({ application_id }, 'AI review started - no notification sent');
            // We don't send notifications when AI review starts, only when it completes
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
                ai_review_id,
                fit_score,
                recommendation,
                processing_time_ms
            } = event.payload;

            this.logger.info(
                { application_id, fit_score, recommendation },
                'Processing AI review completed notification'
            );

            // Fetch application details
            const appResponse = await this.services.getAtsService().get<any>(`/applications/${application_id}`);
            const application = appResponse.data || appResponse;

            // Fetch job details
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${application.job_id}`);
            const job = jobResponse.data || jobResponse;

            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${application.candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;

            // Fetch AI review details
            const reviewResponse = await this.services
                .getAtsService()
                .get<any>(`/ai-reviews?application_id=${encodeURIComponent(application_id)}`);
            const aiReview = reviewResponse.data || reviewResponse;

            // Send email to candidate if they have an email
            const candidateEmail = await this.emailLookup.getCandidateEmail(application.candidate_id);
            
            if (candidateEmail) {
                await this.emailService.sendAIReviewCompletedToCandidate(candidateEmail, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    fitScore: fit_score,
                    recommendation,
                    strengths: aiReview.strengths || [],
                    concerns: aiReview.concerns || [],
                    userId: candidate.user_id || null,
                    applicationId: application_id,
                });

                this.logger.info(
                    { application_id, recipient: candidateEmail },
                    'AI review completed notification sent to candidate'
                );
            }

            // Send email to recruiter if application has one
            if (application.recruiter_id) {
                const recruiterEmail = await this.emailLookup.getRecruiterEmail(application.recruiter_id);
                
                if (recruiterEmail) {
                    // Fetch recruiter to get user_id and name
                    const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${application.recruiter_id}`);
                    const recruiter = recruiterResponse.data || recruiterResponse;
                    const recruiterName = await this.emailLookup.getUserName(recruiter.user_id);

                    await this.emailService.sendAIReviewCompletedToRecruiter(recruiterEmail, {
                        recruiterName: recruiterName || 'Recruiter',
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        fitScore: fit_score,
                        recommendation,
                        overallSummary: aiReview.overall_summary,
                        strengths: aiReview.strengths || [],
                        concerns: aiReview.concerns || [],
                        matchedSkills: aiReview.matched_skills || [],
                        missingSkills: aiReview.missing_skills || [],
                        userId: recruiter.user_id,
                        applicationId: application_id,
                    });

                    this.logger.info(
                        { application_id, recipient: recruiterEmail },
                        'AI review completed notification sent to recruiter'
                    );
                } else {
                    this.logger.warn(
                        { recruiter_id: application.recruiter_id },
                        'Cannot notify recruiter - no email address'
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

            this.logger.warn(
                { application_id, error: errorMsg },
                'AI review failed - notifying admin team'
            );

            // In production, this should notify the admin team
            // For now, just log it
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
            const { application_id, job_id, candidate_id } = event.payload;

            this.logger.info(
                { application_id },
                'Application draft completed - AI review will be triggered automatically'
            );

            // No notification needed - AI review will handle notifications when complete
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to handle draft completed event'
            );
            throw error;
        }
    }
}
