# Architecture Document
## Custom GPT with Actions Integration
Date: 2026-02-13

## 1. High-Level Flow
User → ChatGPT → Custom GPT → OpenAPI Action → Platform API → Database

## 2. Components

### 2.1 Custom GPT (Hosted by OpenAI)
- Interprets user prompts
- Selects OpenAPI actions
- Sends structured requests
- Returns structured responses

### 2.2 OpenAPI Layer
- Defines action schema
- Includes operationIds
- Includes OAuth security scheme

### 2.3 Platform API (AKS Hosted)
- REST endpoints
- Role-based access control
- Tenant isolation
- Confirmation enforcement

### 2.4 Authentication
- OAuth2 account linking
- Short-lived access tokens
- Refresh token handling
- Per-user scoping

## 3. Write-Action Safety Pattern
Endpoints must:
- Require confirmed flag
- Return CONFIRMATION_REQUIRED error if missing

## 4. Security Requirements
- Enforce role-based authorization
- Validate tenantId on every request
- Log all AI-triggered operations
- Rate limit per user

## 5. Observability
- Structured logging
- Action-level tracing
- AI-specific metrics
