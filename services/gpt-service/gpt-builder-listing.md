# GPT Builder Listing Copy

This document contains the copy and configuration details needed to set up Career Copilot in OpenAI's GPT Builder interface.

---

## Name

Career Copilot

---

## Description

Your AI-powered job search assistant from Applicant Network. Find jobs, analyze resume fit, and apply.

---

## About

Career Copilot is your personal job search assistant powered by Applicant Network. Whether you're actively looking for your next opportunity or exploring what's out there, Career Copilot helps you navigate the job market with intelligent, conversational support.

**What Career Copilot does:**
Search for jobs tailored to your skills and preferences, check the status of your applications in real-time, analyze how well your resume matches specific positions, and submit applications with a secure two-step confirmation process. All of this happens right here in ChatGPT through natural conversation.

**How it works:**
Career Copilot connects directly to your Applicant Network account, giving you access to real job data from companies actively hiring. When you search for jobs, you get results from live job postings. When you check your applications, you see real-time status updates. When you analyze your resume against a position, you receive actionable coaching on how to improve your fit.

**What makes it useful:**
Instead of switching between job boards, spreadsheets, and email, you can manage your entire job search through conversation. Ask for remote Python jobs, and Career Copilot delivers a curated list with salary ranges and company details. Wonder if you're a good fit? Get an instant resume analysis with specific strengths and gaps. Ready to apply? Career Copilot walks you through pre-screen questions one at a time and shows you a full summary before submitting—no accidental applications.

---

## Conversation Starters

1. Search for jobs
2. Check my applications
3. Analyze my resume
4. Browse remote positions

---

## Configuration Notes

**For internal reference when setting up GPT Builder:**

### Profile Picture
[To be provided by user]

### Authentication
- Type: OAuth 2.0 with PKCE
- Authorization URL: `https://api.splits.network/api/v1/gpt/authorize`
- Token URL: `https://api.splits.network/api/v1/gpt/token`
- Scope: `jobs:read applications:read applications:write resume:read`

### Actions
- Import OpenAPI schema from: `https://api.splits.network/api/v1/gpt/openapi.yaml`
- Schema format: OpenAPI 3.0.1
- Actions included: searchJobs, getJobDetails, getApplications, submitApplication, analyzeResume

### Privacy Policy
Privacy policy URL: [To be configured by user at applicant.network/privacy]

### Additional Settings
- Enable web browsing: No
- Enable DALL-E image generation: No
- Enable code interpreter: No
- Capabilities: Actions only (OAuth-authenticated API calls)

### Deployment
- Visibility: Public (after testing)
- Category: Productivity
- Tags: jobs, career, recruiting, resume, applications

---

**End of GPT Builder Listing Copy**

Use this document as a reference when configuring Career Copilot in GPT Builder at platform.openai.com/gpts.
