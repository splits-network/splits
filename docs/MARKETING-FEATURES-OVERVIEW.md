# Splits Network - Comprehensive Features & Functionality Document

**Document Purpose:** Marketing expert analysis of all features and functionality built into Splits Network platform  
**Audience:** Marketing team, stakeholders, landing page developers  
**Last Updated:** January 29, 2026  
**Status:** Production-Ready Features Analysis

---

## Executive Summary

Splits Network is a **split-fee recruiting marketplace** built on a modern microservice architecture designed for scale, reliability, and marketplace sophistication. The platform uniquely combines advanced AI-powered candidate evaluation, multi-stakeholder collaboration workflows, and automated commission management to create a transparent, efficient hiring ecosystem.

### Key Value Propositions

1. **AI-Powered Candidate Assessment** - Intelligent fit analysis before human review
2. **Transparent Commission Structure** - 5-role attribution system with clear payout tracking
3. **Multi-Stakeholder Collaboration** - Gate-based approval workflows for companies
4. **Recruiter Marketplace** - Network effects with incentive alignment
5. **Automated Payout Management** - Self-service scheduling and escrow management
6. **Enterprise-Grade Reliability** - Kubernetes-orchestrated, event-driven architecture

---

## Part I: Core Platform Features

### 1. AI-Powered Candidate-Job Fit Analysis

**What It Is:**
Intelligent system that automatically analyzes how well a candidate matches a job opening, providing scoring and recommendations before human review.

**Key Capabilities:**

- **Automatic Analysis:** Triggered when candidate submits application
- **Resume Intelligence:** Extracts skills, experience, and qualifications from resume text
- **Fit Scoring:** Quantified match percentage based on job requirements
- **Explainable Recommendations:** Shows why candidate is/isn't a good fit
- **Three Outcome States:**
    - ✅ Good Fit - Proceed with confidence
    - ❓ Uncertain - Further review recommended
    - ❌ Poor Fit - Consider alternatives
- **Candidate Revision Cycle:** Candidate can review AI feedback and revise application before final submission

**Marketing Value:**

- Dramatically reduces recruiter time on initial screening
- Prevents bad fits from wasting company time
- Improves placement quality with data-backed recommendations
- Enhances candidate experience with transparent feedback

**User Experience:**

```
Candidate applies → AI instantly analyzes → Candidate sees feedback
→ Candidate can revise → Resubmit with improved materials OR accept original
→ Flows to human review with confidence score
```

---

### 2. Multi-Gate Application Approval Workflow

**What It Is:**
Enterprise-grade application review system where multiple stakeholders (recruiters and companies) can approve candidates through configurable review gates before moving forward.

**Key Capabilities:**

- **Three Standard Gates:**
    1. **Candidate Recruiter Gate** - Initial screening by the recruiter representing the candidate
    2. **Company Recruiter Gate** - Company's recruiter validates appropriateness
    3. **Company Decision Gate** - Final approval by hiring company
- **Gate-Specific Actions:**
    - Approve candidate to move forward
    - Deny candidate (end of process)
    - Request additional information
    - Provide feedback/notes to other stakeholders

- **Full Gate History:** Complete audit trail showing:
    - Who made each decision
    - When decisions were made
    - What feedback was provided
    - Complete decision history

- **Flexible Routing:** Gate sequence can be customized based on:
    - Candidate type (direct vs. represented)
    - Job type (internal vs. external)
    - Company requirements

**Marketing Value:**

- Ensures hiring companies have control and visibility
- Reduces unqualified candidate submissions
- Creates accountability through transparent decision trail
- Manages risk with multi-level approval gates
- Enables compliant hiring processes

**User Experience:**

```
AI Review Passed → Gate 1 (Candidate Recruiter Reviews)
→ Approves → Gate 2 (Company Recruiter Reviews)
→ Approves → Gate 3 (Company Makes Final Decision)
→ Approved/Denied with full history visible to all parties
```

---

### 3. Transparent 5-Role Commission Structure

**What It Is:**
Industry-first transparent commission attribution system that clearly identifies which roles contributed to a placement and how fees are distributed.

**Five Commission-Earning Roles:**

1. **Candidate Recruiter (Closer)** - The recruiter representing/managing the candidate
    - Builds relationship with candidate
    - Coaches candidate through interview process
    - Closes the deal when offer is made

2. **Company Recruiter (Client/Facilitator)** - The recruiter representing the company
    - Understands company needs deeply
    - Manages interview process
    - Facilitates feedback from hiring team

3. **Job Owner (Specs Owner)** - The recruiter who defined the job requirements
    - Creates detailed job descriptions
    - Sets expectations with company
    - Ensures candidate quality matches specs

4. **Candidate Sourcer (Discovery)** - The recruiter who identified the candidate
    - Finds talent in the market
    - Builds candidate relationships
    - Initiates opportunity matching

5. **Company Sourcer (Business Development)** - The recruiter who sourced the company account
    - Builds company relationships
    - Brings new job opportunities to platform
    - Manages account growth

**How Attribution Works:**

- Each placement records exactly which roles contributed
- Remaining commission (unclaimed) goes to platform
- Attributes are visible to all parties
- Immutable records prevent disputes
- Supports partial role assignments (roles can be optional)

**Commission Rate Flexibility:**

- **Subscription-based pricing tiers** determine commission percentages
- Different rates for different role types
- Transparent rate cards available to all users
- Fee transparency builds trust in marketplace

**Marketing Value:**

- First platform to offer transparent, role-based commission tracking
- Eliminates ambiguity about who gets paid what
- Attracts quality recruiters with clear incentives
- Enables recruiting teams to split fees fairly
- Supports different recruiting models (direct placement vs. collaboration)

---

### 4. Recruiter-to-Recruiter Collaboration System

**What It Is:**
Platform mechanism enabling two independent recruiters to work together on a single placement and split the fee fairly.

**Two Recruiter Types in Marketplace:**

**Candidate-Side Recruiters:**

- Represent candidates exclusively (12-month "Right to Represent" agreements)
- Manage candidate pool and relationships
- Submit candidates to job opportunities
- Primary goal: Find best opportunities for candidates

**Company-Side Recruiters:**

- Represent companies and open positions
- Search for qualified candidates to fill roles
- May not have candidates in own network
- Primary goal: Fill company positions quickly

**Collaboration Flow:**

1. **Company Recruiter Finds Perfect Candidate** on Splits Network
2. **Candidate Already Represented** - Has exclusive agreement with Candidate Recruiter
3. **Company Recruiter Initiates Proposal** - Proposes collaboration to Candidate Recruiter
4. **Candidate Recruiter Reviews Proposal** - Decides whether to collaborate on this opportunity
5. **If Accepted:**
    - Both recruiters work together on submission
    - Both can contribute to candidate preparation
    - Both are visible in the process
    - Both receive fee split when placement closes
6. **If Declined:**
    - Company Recruiter cannot unilaterally submit that candidate
    - Respects Candidate Recruiter's exclusive relationship
    - Encourages negotiation and collaboration

**Marketing Value:**

- Creates network effects - more recruiters = more candidates = more opportunities
- Enables access to represented candidate pools without poaching
- Builds trust through proposal-based collaboration
- Fair fee splitting reduces conflict
- Transforms recruiting from competitive to collaborative
- **Unique differentiation** - No other platform enables this model

---

### 5. Automatic Application Sourcing & Matching

**What It Is:**
System that matches candidates to open job opportunities based on skills, experience, and fit.

**Key Capabilities:**

- **Opportunity Proposals** - Automatically suggest relevant job opportunities to candidates
- **Active Job Board** - Candidates can browse available opportunities
- **Application Matching** - Intelligent matching between candidate profiles and job requirements
- **Skill-Based Search** - Find candidates with specific technical and soft skills
- **Experience-Based Filtering** - Match candidates to jobs based on years of experience, seniority level

**Marketing Value:**

- Accelerates matching process
- Reduces time for candidates to find opportunities
- Improves match quality
- Enables passive candidate engagement

---

### 6. Right to Represent Agreement System

**What It Is:**
Formal, transparent consent mechanism that establishes exclusive recruiter-candidate relationships and enables recruiter-initiated opportunities.

**Key Features:**

- **12-Month Exclusive Agreements** - Standard contract term for recruiter-candidate relationships
- **Explicit Consent Tracking** - Records when candidate gives recruiter permission to submit opportunities
- **Transparent Terms** - Both parties understand the relationship clearly
- **Enables Recruiter-Initiated Submissions** - Recruiters can propose opportunities to candidates
- **Protects Candidate Agency** - Even with agreement, candidate must approve each specific job

**Unique Distinction:**

- Right to Represent ≠ Automatic Submission
- Recruiter can propose opportunities
- **Candidate must approve each job individually**
- Maintains candidate control while enabling recruiter initiative

**Marketing Value:**

- Enables recruiter-driven talent development
- Builds recruiter-candidate partnerships
- Creates sustainable talent relationships
- Compliant with candidate agency principles
- Encourages quality candidate screening before opportunity submission

---

### 7. Pre-Screening Questions & Candidate Responses

**What It Is:**
Structured questionnaire system where companies define job-specific screening questions that candidates answer as part of the application process.

**Key Capabilities:**

- **Job-Specific Questions** - Companies create custom screening questions for each role
- **Structured Responses** - Candidates provide standardized answers
- **Early Qualification** - Screens candidates before recruiter/company time investment
- **Complete History** - Responses stored with application for future reference
- **Integration with AI Review** - AI analysis can incorporate pre-screen answers

**Marketing Value:**

- Reduces unqualified submissions
- Ensures candidate understanding of role requirements
- Provides early signals of candidate fit
- Saves recruiter and company time on initial screening

---

### 8. Automated Payout Scheduling & Management

**What It Is:**
Self-service system where recruiters can schedule their payouts automatically based on predefined conditions, with admin oversight and audit trails.

**Key Capabilities:**

**Payout Schedule Management:**

- **Automatic Schedule Creation** - Payouts automatically created when placement activates
- **Trigger-Based Scheduling:**
    - When guarantee period ends
    - When milestone is reached
    - When contract is signed
    - Manual trigger by recruiter/admin
- **Flexible Configuration:**
    - Set payout dates and amounts
    - Multiple payouts per placement (milestone-based)
    - Recurring payout patterns
- **Status Tracking:**
    - Pending → Processing → Completed/Failed/Cancelled
    - Real-time status visibility
    - Retry logic with exponential backoff
- **Manual Overrides:**
    - Admin can trigger/cancel payouts
    - Emergency manual processing available
    - Complete audit logging of all changes

**Escrow Hold Management:**

- **Automatic Guarantee Periods** - Funds held for specified guarantee period (typically 30-90 days)
- **Hold Reasons:**
    - Guarantee period (standard holds)
    - Disputes (holds funds during resolution)
    - Verification (holds pending verification)
    - Other (custom holds)
- **Scheduled Release:**
    - Automatic release when guarantee period expires
    - Early release capability (with approval)
    - Hold cancellation if placement cancels

**Comprehensive Audit Logging:**

- Complete history of all payout decisions
- Track who made decisions and when
- Justification for each action
- Dispute resolution evidence

**Marketing Value:**

- Eliminates manual payout administration
- Provides recruiter confidence in payment timelines
- Reduces payout disputes through transparency
- Enables instant payout visibility
- Supports compliance with financial regulations
- **Unique feature** - Few platforms offer this level of automation

---

### 9. Comprehensive Notification & Communication System

**What It Is:**
Multi-channel notification system that keeps all stakeholders informed of important events through email, in-app notifications, and real-time updates.

**Event-Driven Notifications For:**

**Application Events:**

- Application submitted confirmation
- Application received notification (to recruiter/company)
- Gate approvals/denials
- Stage transitions (screen → interview → offer → hired)
- Recruiter feedback or requests for information

**Gate Review Events:**

- Gate review requested
- Gate review completed (with decision)
- Gate approval/denial notifications
- Information requests from gate reviewers

**Placement Events:**

- Placement confirmed
- Guarantee period starting/ending
- Payout scheduled
- Payout completed

**Recruiter Collaboration:**

- Collaboration proposal sent
- Proposal accepted/declined
- Collaboration feedback/updates

**Candidate Opportunities:**

- Job opportunity matched to candidate
- Recruiter submitted candidate
- Application status updates
- Interview invitations

**Channel Options:**

- **Email** - Professional HTML templates via Resend
- **In-App Notifications** - Real-time notification center
- **Customizable Preferences** - Users control notification settings

**Marketing Value:**

- Keeps all parties informed and engaged
- Reduces information gaps and miscommunication
- Builds trust through transparency
- Enables real-time marketplace activity
- Professional communication builds brand credibility

---

### 10. Advanced Document Management

**What It Is:**
Unified system for storing, organizing, and sharing documents across the platform (resumes, cover letters, job descriptions, offers, contracts).

**Key Capabilities:**

- **Multi-Purpose Storage:**
    - Candidate resumes and cover letters
    - Job descriptions
    - Contracts and offer letters
    - Company documents and materials
- **Secure Storage:**
    - Encrypted storage in Supabase Storage
    - Access control by document type and ownership
    - Pre-signed URLs for secure downloads
- **AI Integration:**
    - Resume text extraction for AI analysis
    - Document processing pipeline
    - Metadata enrichment
- **Version Control:**
    - Track document updates
    - Maintain history of changes
    - Rollback capability

**Marketing Value:**

- Centralizes all recruiting documents in one place
- Eliminates email document sprawl
- Ensures document security and compliance
- Enables AI-powered resume analysis
- Simplifies document management across complex workflows

---

## Part II: Platform Architecture & Technical Excellence

### Why Architecture Matters for Marketing

The platform's technical foundation enables features that competitors cannot easily replicate, and allows rapid feature additions without system degradation.

### 1. Microservice-First Architecture

**What It Means:**
Platform is built as independent, specialized services rather than one monolithic application.

**Services:**

- **API Gateway** - Central entry point, authentication, rate limiting
- **Identity Service** - User, organization, and membership management
- **ATS Service** - Applications, candidates, jobs, placements
- **Network Service** - Recruiter profiles, assignments, marketplace
- **Billing Service** - Subscriptions, payments, payout tracking
- **Notification Service** - Email, in-app notifications, event processing
- **AI Service** - Candidate-job fit analysis
- **Document Service** - File storage and management
- **Automation Service** - Rule-based automation and anomaly detection

**Marketing Implication:**

- Services can scale independently
- Features can be added without affecting entire platform
- Reliability is exceptional - one service issue doesn't take down platform
- Each service highly optimized for its domain

### 2. Event-Driven Coordination

**What It Means:**
Services communicate asynchronously through published events rather than direct API calls.

**How It Works:**

1. One service completes an action (e.g., placement created)
2. Service publishes event (e.g., "placement.created")
3. Other services listen and react (e.g., notification service sends email, billing service creates payout)
4. No direct service-to-service HTTP calls

**Benefits:**

- **Resilience** - One service outage doesn't cascade to others
- **Scalability** - Services can handle traffic spikes independently
- **Decoupling** - Services don't know about each other
- **Traceability** - All events logged for audit trails
- **Extensibility** - New features plug into event stream easily

**Marketing Implication:**

- Platform can scale from hundreds to millions of transactions
- New features can be added without redeploying core services
- System remains reliable even under extreme load

### 3. Database-First Data Access

**What It Means:**
Services access data through direct database queries rather than calling other service APIs.

**How It Works:**

- Single shared Supabase Postgres database
- Each service owns its schema (ats, network, billing, etc.)
- Services can query any schema for data access
- Cross-schema JOINs enable rich data access patterns
- No circular HTTP dependencies

**Benefits:**

- **Performance** - Direct queries faster than HTTP calls
- **Consistency** - Single source of truth for all data
- **Reliability** - No cascading failures from service outages
- **Rich Queries** - Complex JOINs for sophisticated features

**Marketing Implication:**

- Platform can support complex queries and analytics without performance degradation
- Real-time data access enables live dashboards
- Simpler debugging and audit trails

### 4. Role-Based Access Control (RBAC)

**What It Means:**
Sophisticated permission system that controls what each user can see and do based on their role and context.

**User Roles:**

- **Platform Admin** - Full system access
- **Company Admin** - Can manage company, jobs, hirers, view all company data
- **Hiring Manager** - Can review applications, make hiring decisions
- **Recruiter** - Can view assigned candidates and jobs, manage submissions
- **Candidate** - Can apply to jobs, view own applications, manage profile

**Context-Aware Permissions:**

- Recruiters only see their assigned jobs
- Companies only see their own applications
- Candidates only see their own profile
- Data-level filtering (no separate permission system)

**Marketing Value:**

- Enterprise-grade security
- Compliant access controls
- Transparent data visibility
- Protects proprietary information

### 5. Real-Time Synchronization with Clerk

**What It Means:**
Platform automatically stays in sync with Clerk identity provider for seamless authentication.

**How It Works:**

- Clerk handles authentication (login, signup, SSO)
- Webhook integration automatically creates/updates user records
- Users instantly available on platform after signup
- No manual user onboarding needed
- Logout immediately revokes access

**Marketing Value:**

- Frictionless signup experience
- No password management burden
- Enterprise SSO support
- Secure authentication layer

---

## Part III: User Experience Features

### 1. Recruiter Dashboard & Portal

**What It Includes:**

- Personal recruiter profile management
- Job assignment visibility
- Candidate assignment tracking
- Application review interface
- Gate review workflows
- Payout status and scheduling
- Analytics and performance metrics
- Team collaboration tools

**Marketing Value:**

- Recruiters have complete workspace
- Transparency into all their business activities
- Tools to manage their business efficiently
- Analytics to track personal performance

### 2. Company Hiring Portal

**What It Includes:**

- Job posting and management
- Application tracking and review
- Multi-person gate review workflows
- Team collaboration features
- Hiring pipeline visibility
- Team member management
- Placement tracking
- Hiring analytics

**Marketing Value:**

- Companies maintain control over their hiring
- Multiple stakeholders can participate
- Complete visibility into hiring pipeline
- Data on hiring performance and speed

### 3. Candidate Application Portal

**What It Includes:**

- Public job board with search/filtering
- Application submission
- AI review feedback and revision
- Application status tracking
- Recruiter communication and updates
- Document upload and management
- Profile management
- Opportunity management (proposals from recruiters)

**Marketing Value:**

- Candidates have transparency into process
- Can revise applications based on feedback
- Professional communication channel
- Complete application history

### 4. Professional Email Communication

**What It Includes:**

- Professional HTML email templates
- Multi-template support for different events
- Branded communication
- Rich information in emails
- Automated sending via Resend
- Delivery tracking

**Templates Include:**

- Application submitted confirmations
- Gate review notifications
- Stage transition emails
- Interview scheduling
- Offer notifications
- Rejection letters
- Collaboration requests

**Marketing Value:**

- Professional brand impression throughout hiring process
- Clear, consistent communication
- Reduces information gaps
- Builds trust through transparency

---

## Part IV: Advanced Analytics & Intelligence

### 1. Application Analytics

**Metrics Tracked:**

- Total applications received
- Application status breakdown
- Time in each stage
- Stage-to-stage conversion rates
- Drop-off analysis
- Recruiter performance
- Candidate-to-job fit scores

**Marketing Value:**

- Data-driven hiring insights
- Identify bottlenecks
- Optimize recruiting process
- Track recruiter performance

### 2. Payout Analytics

**Metrics Tracked:**

- Total payouts processed
- Average payout amount
- Payout timing and velocity
- Role-based attribution
- Commission distribution
- Recruiter earnings

**Marketing Value:**

- Transparent earnings tracking
- Identify high-performing recruiters
- Commission structure validation
- Financial forecasting

### 3. Marketplace Health Metrics

**Metrics Tracked:**

- Total active recruiters
- Total active companies
- Total active candidates
- Placement success rate
- Average time to hire
- Marketplace growth

**Marketing Value:**

- Validate marketplace traction
- Show network effects
- Demonstrate platform value
- Track unit economics

---

## Part V: Compliance & Security

### 1. Audit Logging

**What's Logged:**

- All user actions and decisions
- Gate approvals/denials
- Payout triggers and changes
- Data access and modifications
- Authentication events
- System events

**Marketing Value:**

- Complete accountability trail
- Dispute resolution support
- Regulatory compliance
- Fraud prevention

### 2. Data Privacy

**Features:**

- GDPR-compliant data handling
- User consent tracking
- Data export capabilities
- Secure credential storage
- Encrypted sensitive data
- Access logging

**Marketing Value:**

- Enterprise trust
- Regulatory compliance
- Privacy-first positioning
- Secure data handling

### 3. Financial Security

**Features:**

- Stripe payment integration
- Secure credential storage
- PCI compliance
- Transaction logging
- Escrow holds during guarantee periods
- Idempotent operations (duplicate prevention)

**Marketing Value:**

- Safe payment processing
- Fraud prevention
- Financial integrity
- Dispute resolution support

---

## Part VI: Scalability & Performance

### 1. Horizontal Scaling

**How It Works:**

- Kubernetes orchestration enables unlimited replicas
- Load balancing across service instances
- Database connection pooling
- Automatic scaling based on demand

**Marketing Value:**

- Can support unlimited users
- No performance degradation with growth
- Enterprise-ready infrastructure
- Global deployment capable

### 2. Real-Time Data Access

**Capabilities:**

- Live dashboard updates
- Real-time application status
- Instant notification delivery
- Immediate payout visibility

**Marketing Value:**

- Stakeholders always informed
- No stale data
- Reduces confusion and miscommunication
- Professional experience

### 3. Asynchronous Processing

**How It Works:**

- Long operations process in background
- RabbitMQ job queue
- Retry logic for reliability
- Progress tracking

**Examples:**

- Document processing
- Email sending
- AI analysis
- Payout processing

**Marketing Value:**

- Platform remains responsive
- Users don't wait for long operations
- Better user experience
- Reliable execution of critical tasks

---

## Part VII: Deployment & Operations

### 1. Kubernetes Infrastructure

**Deployed On:**

- Kubernetes for orchestration
- Docker containers for services
- Persistent storage for databases
- Load balancers for traffic distribution
- Health checks and auto-healing

**Marketing Value:**

- Enterprise-grade infrastructure
- High availability and redundancy
- Geographic distribution possible
- Disaster recovery capable

### 2. Automated Deployments

**Process:**

- GitHub Actions CI/CD
- Automated testing
- Docker build and push
- Kubernetes deployment
- Rolling updates (no downtime)

**Marketing Value:**

- Rapid feature deployment
- Reliable release process
- Minimal downtime
- Continuous improvement

### 3. Monitoring & Alerts

**Tools:**

- Sentry error tracking
- Log aggregation
- Health checks
- Performance monitoring
- Alert notifications

**Marketing Value:**

- Proactive issue detection
- Fast issue resolution
- System reliability
- Performance insights

---

## Part VIII: Integration Capabilities

### 1. Stripe Integration

**What It Enables:**

- Subscription management
- Payment processing
- Webhook integration
- Payout to recruiters
- Financial reconciliation

**Marketing Value:**

- Trusted payment partner
- Financial credibility
- PCI compliance
- Automated billing

### 2. Resend Integration

**What It Enables:**

- Professional email delivery
- Template management
- Delivery tracking
- Bounce handling
- Email compliance

**Marketing Value:**

- Professional communication
- High deliverability
- Brand consistency
- Compliance with email standards

### 3. Clerk Integration

**What It Enables:**

- Authentication
- User management
- SSO support
- Session management
- Secure credential handling

**Marketing Value:**

- Frictionless signup
- Enterprise SSO
- Security best practices
- User management at scale

---

## Part IX: Unique Differentiators

### 1. Transparent 5-Role Commission System

**Unique Feature:** No other platform attributes commissions across 5 specific roles with such clarity. This enables fair splits and incentive alignment.

### 2. Recruiter-to-Recruiter Collaboration Proposals

**Unique Feature:** Enables ethical, consensual recruiter collaboration where represented candidates can't be poached, creating network effects without conflict.

### 3. AI-Powered Fit Analysis with Candidate Revision

**Unique Feature:** Candidates get AI feedback and can revise before final submission, improving application quality and candidate experience simultaneously.

### 4. Multi-Gate Approval Workflows

**Unique Feature:** Enterprise-grade gate reviews provide companies with visibility and control while maintaining recruiter involvement.

### 5. Automated Payout Scheduling with Escrow

**Unique Feature:** Self-service payout scheduling with automatic escrow holds and milestone-based releases reduces manual administration.

### 6. Event-Driven Architecture

**Unique Feature:** Services communicate through events rather than direct calls, enabling scalability and reliability competitors struggle to match.

---

## Part X: Competitive Positioning

### How Splits Network Differentiates

#### vs. Traditional Recruiting Firms

- **Lower Fees** - Transparent commission structure, competitive rates
- **Speed** - AI acceleration, automated workflows
- **Transparency** - Full visibility to all parties
- **Flexibility** - Work as independent recruiter or team
- **Technology** - Modern tools and analytics

#### vs. Job Boards (LinkedIn, Indeed)

- **Recruiter Support** - Tools specifically for recruiters, not just job posting
- **Commission Tracking** - Built-in payment and commission management
- **Collaboration** - Enable teamwork and fee splitting
- **Intelligence** - AI analysis of candidate-job fit
- **Compliance** - Gate-based approval workflows

#### vs. Other Recruiting Platforms

- **Fair Commission Model** - 5-role attribution is fair and transparent
- **Collaboration First** - Designed for recruiter partnership, not competition
- **Enterprise Integration** - Multi-gate workflows for company hiring teams
- **AI Integration** - Candidate revision feedback for better applications
- **Financial Automation** - Payout scheduling and escrow management

---

## Part XI: Go-to-Market Positioning

### Target Audiences

#### 1. Independent Recruiters

**Value Prop:** Build your recruiting business with tools, network, and fair commissions

**Key Features:**

- Transparent commission tracking
- Collaboration opportunities
- Candidate pool access
- Professional tools
- Payment automation

#### 2. Recruiting Teams

**Value Prop:** Scale your team with network effects and collaborative workflows

**Key Features:**

- Team collaboration
- Role-based fee splitting
- Shared candidates and jobs
- Integrated communication
- Performance analytics

#### 3. Hiring Companies

**Value Prop:** Access to large recruiter network with control and transparency

**Key Features:**

- Multi-gate approval workflows
- Recruiter network access
- AI-assisted screening
- Application tracking
- Hiring analytics

#### 4. Staffing Agencies

**Value Prop:** Extend your reach with marketplace model and automated payout management

**Key Features:**

- Candidate pool expansion
- Collaboration with external recruiters
- Automated billing
- Commission tracking
- Financial reporting

---

## Part XII: Technical Infrastructure Summary

### Core Technologies

- **Frontend:** Next.js 16, React, TypeScript, TailwindCSS, DaisyUI
- **Backend:** Node.js, Fastify, TypeScript
- **Database:** Supabase Postgres (schema-per-service)
- **Events:** RabbitMQ
- **Authentication:** Clerk
- **Payments:** Stripe
- **Email:** Resend
- **Infrastructure:** Kubernetes, Docker
- **Monitoring:** Sentry
- **Storage:** Supabase Storage

### Data Security

- End-to-end encryption for sensitive data
- Role-based access control at data level
- Audit logging for all actions
- GDPR compliance
- PCI DSS compliance (payments)
- Regular security audits

---

## Part XIII: Product Roadmap Implications

### Current Production-Ready Features

✅ AI candidate-job fit analysis  
✅ Multi-gate approval workflows  
✅ 5-role commission attribution  
✅ Recruiter-to-recruiter proposals  
✅ Automated payout scheduling  
✅ Email notifications and communication  
✅ Document management  
✅ Application tracking  
✅ Candidate screening questions  
✅ Recruiter dashboards  
✅ Company hiring portals  
✅ Candidate application portal

### Future Enhancement Opportunities

- Advanced analytics and business intelligence dashboards
- Video interview integration
- Assessments and skills testing
- Background check integration
- Reference checking automation
- Contract template library
- Freelance/contract hiring (non-permanent)
- International payment support
- Multi-currency support
- Advanced CRM features
- Mobile applications
- API for third-party integrations

---

## Marketing Messaging Framework

### Core Messages

**1. Transparent Marketplace**
"For the first time, commissions are transparent, fair, and attributed across 5 roles. Recruiters know exactly who gets paid what."

**2. Collaboration, Not Competition**
"Work with other recruiters on complex searches without worrying about who gets credit. Our proposal system enables ethical fee splitting."

**3. AI-Powered Efficiency**
"Candidates get instant AI feedback on their applications and can revise before submission. Recruiters spend less time on initial screening. Companies see better candidates."

**4. Enterprise-Grade Control**
"Companies get multi-gate approval workflows, recruiter oversight, and complete visibility into their hiring pipeline."

**5. Financial Automation**
"No manual payout administration. Schedule payouts based on milestones, manage escrow holds, and get real-time visibility into your earnings."

### Feature Spotlight Messages

**For Recruiters:**

- "Build your business with tools designed for modern recruiting"
- "Get paid automatically when placements close"
- "Collaborate with other recruiters and share fees fairly"
- "Access our network of represented candidates and job opportunities"

**For Companies:**

- "Hire faster with AI-assisted candidate screening"
- "Maintain control with multi-level approval workflows"
- "Access a network of qualified recruiters for your open roles"
- "Track all hiring activity with complete visibility"

**For Candidates:**

- "Get AI feedback on your applications and revise before submission"
- "Work with recruiters to find opportunities that match your goals"
- "Track your applications and stay informed throughout the process"
- "Build your professional profile once, use it everywhere"

---

## Conclusion

Splits Network is a **sophisticated, production-ready recruiting marketplace** that uniquely combines:

1. **Transparency** - Clear commission structure and decision making
2. **Intelligence** - AI-powered candidate analysis and matching
3. **Collaboration** - Recruiter partnerships with fair fee splitting
4. **Enterprise Features** - Multi-stakeholder workflows with full auditing
5. **Automation** - Payout scheduling, notifications, and document management
6. **Reliability** - Microservice architecture built for scale and resilience

The platform is built on a modern, event-driven microservice architecture that enables rapid feature development, excellent reliability, and unlimited scalability. It serves the complete recruiting lifecycle from job posting through placement completion and payout.

This document should be used to:

- Update landing page copy
- Create feature comparison charts
- Develop marketing collateral
- Brief sales teams
- Position against competitors
- Guide content strategy
- Inform messaging and positioning

---

**Document Version:** 1.0  
**Last Updated:** January 29, 2026  
**Prepared By:** Marketing Feature Analysis  
**For:** Marketing Team, Sales Team, Product Team
