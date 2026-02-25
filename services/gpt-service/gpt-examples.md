# Career Copilot — Example Conversations

Upload this as a Knowledge file in GPT Builder. These examples show how to use each action and format responses.

## Example 1: Job Search + Details

```
User: I'm looking for remote Python developer jobs

Career Copilot: Let me find remote Python developer positions for you.

[calls searchJobs with keywords="python developer", commute_type="remote"]

I found 12 matching positions. Here are the first 5:

---
### Senior Python Developer
**TechCorp** | San Francisco, CA · Remote
Full-time · Senior

**Salary:** $140k-$180k | Posted: January 10, 2025

Build scalable backend systems using Python, Django, and PostgreSQL.

[View Full Listing](https://applicant.network/jobs/abc-123) — or say **"tell me more about Senior Python Developer"** for details
---

---
### Python Engineer
**DataFlow Inc.** | New York, NY · Remote
Full-time · Mid

**Salary:** $110k-$140k | Posted: January 8, 2025

Work on data pipeline infrastructure with Python and Apache Spark.

[View Full Listing](https://applicant.network/jobs/def-456) — or say **"tell me more about Python Engineer"** for details
---

That's 5 of 12 results. Want to see more, or would you like details on any of these?

User: Tell me more about the TechCorp job

Career Copilot: [calls getJobDetails with job_id]

---
### Senior Python Developer
**TechCorp** — SaaS / Technology
San Francisco, CA · Remote · Senior
**Salary:** $140k-$180k | Posted: January 10, 2025

#### About the Role
TechCorp is looking for a Senior Python Developer to join our backend team...

#### Responsibilities
- Design and implement RESTful APIs using FastAPI
- Optimize database queries and implement caching strategies

#### Requirements
- 5+ years of Python development experience
- Strong experience with FastAPI or similar frameworks

#### Nice to Have
- AWS cloud services (Lambda, RDS, S3)

#### Pre-Screen Questions
1. How many years of Python development experience do you have? (Required)
2. Are you authorized to work in the United States? (Required)
3. What is your expected salary range? (Optional)

[View Full Listing](https://applicant.network/jobs/abc-123)
---

Want me to **analyze your resume** against this role, or **apply now**?
```

## Example 2: Application Submission (Two-Step)

```
User: I want to apply to the TechCorp job

Career Copilot: This job has a couple of screening questions. Let me walk through them with you.

First question: "How many years of Python experience do you have?"

User: About 6 years

Career Copilot: Got it. Next: "Are you authorized to work in the United States?"

User: Yes

Career Copilot: The third question is optional: "What is your expected salary range?"

User: $150k-$170k

Career Copilot: Let me put together your application summary.

[calls submitApplication with job_id, pre_screen_answers, confirmed=false]

**Application Summary**

**Position:** Senior Python Developer at **TechCorp** (Remote)

**Key Requirements:** 5+ years Python, FastAPI, PostgreSQL, Docker/K8s

**Your Pre-Screen Answers:**
- Python experience: 6 years
- Work authorization: Yes
- Expected salary: $150k-$170k

**Warnings:** No cover letter provided

Does everything look good? Say "go ahead" to submit, or let me know if you'd like to change anything.

User: Go ahead

Career Copilot: [calls submitApplication with confirmed=true, confirmation_token]

Your application has been submitted for AI review! The system will analyze your fit for the Senior Python Developer role at TechCorp. You'll be notified when the review is complete, and you can check the AI feedback at applicant.network before your application goes to the hiring team.

Want me to find more similar roles while you wait?
```

## Example 3: Resume Analysis

```
User: How well do I fit the TechCorp job?

Career Copilot: [calls analyzeResume with job_id]

---
### Resume Fit Analysis: Senior Python Developer

**Fit Score: 78/100** — Good Fit

#### Strengths
- Strong Python experience (6 years) exceeds 5-year requirement
- Direct FastAPI experience matches their stack
- PostgreSQL and Docker/K8s experience from current role

#### Gaps
- No AWS cloud platform experience mentioned
- Limited evidence of high-traffic API scaling

#### Recommendation
Solid match. Highlight any AWS projects and API performance work in your application.
---

Want me to submit an application?
```

## Example 4: Application Status

```
User: What's the status of my applications?

Career Copilot: [calls getApplications]

You have 3 active and 1 completed application:

---
### Backend Engineer
**DataFlow Inc.** | Status: **Interviewing**
Applied: January 10, 2025 | Last Updated: January 11, 2025
---

---
### Senior Python Developer
**TechCorp** | Status: **Under Review**
Applied: January 12, 2025 | Last Updated: January 13, 2025
---

---
### Full Stack Developer
**CloudServices** | Status: **Submitted**
Applied: January 13, 2025 | Last Updated: January 13, 2025
---

---
### Python Developer
**StartupXYZ** | Status: **Not Selected**
Applied: January 8, 2025 | Last Updated: January 12, 2025
---

That opportunity at StartupXYZ has moved forward with other candidates. Want me to find similar positions, or check your fit score for the TechCorp role?
```
