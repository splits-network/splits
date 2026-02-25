/**
 * OpenAPI Schema Route
 *
 * Serves the OpenAPI 3.1.1 schema in both YAML and JSON formats.
 * The server URL is injected at runtime from GPT_API_BASE_URL env var
 * so staging and production serve environment-appropriate schemas.
 *
 * No authentication required - schema is public for GPT Builder import.
 */

import { FastifyInstance } from "fastify";
import { readFileSync } from "fs";
import { join } from "path";
import { load, dump } from "js-yaml";

const DEFAULT_API_URL = "https://api.applicant.network";

// Load and patch schema at startup
const schemaPath = join(__dirname, "openapi.yaml");
const schemaYaml = readFileSync(schemaPath, "utf-8");
const schema = load(schemaYaml) as Record<string, unknown>;

// Replace server URL with environment-specific value
const apiBaseUrl = process.env.GPT_API_BASE_URL || DEFAULT_API_URL;
(schema as any).servers = [{ url: apiBaseUrl, description: "API Gateway" }];

const patchedYaml = dump(schema, { lineWidth: 120 });
const patchedJson = schema;

export function registerOpenapiRoute(app: FastifyInstance): void {
    app.get("/api/v2/openapi.yaml", async (request, reply) => {
        reply.header("Content-Type", "text/yaml; charset=utf-8");
        return patchedYaml;
    });

    app.get("/api/v2/openapi.json", async (request, reply) => {
        reply.header("Content-Type", "application/json; charset=utf-8");
        return patchedJson;
    });

    app.log.info(`OpenAPI schema routes registered (server: ${apiBaseUrl})`);
}
