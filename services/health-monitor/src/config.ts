import { ServiceDefinition } from "./types";

export function loadServiceDefinitions(): ServiceDefinition[] {
    return [
        {
            name: "api-gateway",
            displayName: "API Gateway",
            url: process.env.API_GATEWAY_URL || "http://localhost:3000",
            healthPath: "/health",
        },
        {
            name: "identity-service",
            displayName: "Identity Service",
            url: process.env.IDENTITY_SERVICE_URL || "http://localhost:3001",
            healthPath: "/health",
        },
        {
            name: "ats-service",
            displayName: "ATS Service",
            url: process.env.ATS_SERVICE_URL || "http://localhost:3002",
            healthPath: "/health",
        },
        {
            name: "network-service",
            displayName: "Network Service",
            url: process.env.NETWORK_SERVICE_URL || "http://localhost:3003",
            healthPath: "/health",
        },
        {
            name: "billing-service",
            displayName: "Billing Service",
            url: process.env.BILLING_SERVICE_URL || "http://localhost:3004",
            healthPath: "/health",
        },
        {
            name: "notification-service",
            displayName: "Notification Service",
            url: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3005",
            healthPath: "/health",
        },
        {
            name: "document-service",
            displayName: "Document Service",
            url: process.env.DOCUMENT_SERVICE_URL || "http://localhost:3006",
            healthPath: "/health",
        },
        {
            name: "automation-service",
            displayName: "Automation Service",
            url: process.env.AUTOMATION_SERVICE_URL || "http://localhost:3007",
            healthPath: "/health",
        },
        {
            name: "document-processing-service",
            displayName: "Document Processing Service",
            url:
                process.env.DOCUMENT_PROCESSING_SERVICE_URL ||
                "http://localhost:3008",
            healthPath: "/health",
        },
        {
            name: "ai-service",
            displayName: "AI Review Service",
            url: process.env.AI_SERVICE_URL || "http://localhost:3009",
            healthPath: "/health",
        },
    ];
}
