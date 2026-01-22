# PRD – Stripe Integration (Billing, Subscriptions, Payouts)

Date: 2026-01-22
Product: Splits Network

## Objective
Integrate Stripe to support recruiter subscriptions, company billing on successful placements, recruiter payouts after guarantees, and role promotion monetization.

## Recruiter Subscription Plans
- Free – $0
- Pro – $99/month or $999/year
- Partner – $249/month or $2,499/year

## Company Billing
- Trigger: guarantee completion
- Methods: immediate, Net 30 / 60 / 90
- Stripe invoices + webhooks

## Recruiter Payouts
- Triggered after guarantee completion
- Stripe Connect transfers per placement split

## Role Promotion
- One-time Stripe charge
- Duration-based visibility

## Out of Scope
- Business subscriptions (planned)
