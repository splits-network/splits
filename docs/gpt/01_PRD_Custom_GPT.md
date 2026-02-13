# Product Requirements Document (PRD)
## Splits & Applicant AI Assistant (Custom GPT with Actions)
Date: 2026-02-13

## 1. Executive Summary
This document defines the requirements for building a Custom GPT with Actions that connects ChatGPT to Applicant.Network and Splits.Network via secure APIs.

This GPT will act as a conversational interface layer, allowing candidates and recruiters to interact with platform data using natural language.

## 2. Objectives
- Enable conversational job search and resume optimization
- Enable recruiter productivity workflows
- Increase AI-native engagement
- Drive new user acquisition from ChatGPT ecosystem

## 3. Success Metrics
- GPT installs
- Weekly active GPT users
- % of users linking accounts (OAuth success rate)
- Action invocation rate
- Applications initiated via GPT
- Recruiter actions completed via GPT

## 4. Core Features (V1)

### Applicant.Network
- Job search via natural language
- Resume analysis
- Application status lookup
- Application submission (confirmation required)

### Splits.Network
- Recruiter search
- Candidate search
- Split opportunity lookup
- Outreach drafting (confirmation required)
- Split summary generation

## 5. Confirmation Rules
All write actions must:
1. Present summary to user
2. Require explicit confirmation
3. Include confirmed=true flag in request

## 6. Non-Goals (V1)
- Contract execution
- Payment processing
- Fully autonomous submissions

## 7. Risks
- AI misuse of write endpoints
- Insufficient platform density
- OAuth complexity

## 8. Rollout Plan
Phase 1: Internal test GPT  
Phase 2: Limited recruiter beta  
Phase 3: Public GPT Store launch
