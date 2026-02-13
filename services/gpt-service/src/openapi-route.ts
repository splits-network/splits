/**
 * OpenAPI Schema Route
 *
 * Serves the OpenAPI 3.0.1 schema in both YAML and JSON formats.
 * No authentication required - schema is public for GPT Builder import.
 *
 * Phase 14: OpenAPI Schema + GPT Configuration
 */

import { FastifyInstance } from 'fastify';
import { readFileSync } from 'fs';
import { join } from 'path';
import { load } from 'js-yaml';

// Load schema at module initialization
const schemaPath = join(__dirname, 'openapi.yaml');
const schemaYaml = readFileSync(schemaPath, 'utf-8');
const schemaJson = load(schemaYaml);

/**
 * Register OpenAPI schema serving routes
 *
 * Routes:
 * - GET /api/v2/openapi.yaml - Returns raw YAML
 * - GET /api/v2/openapi.json - Returns parsed JSON
 *
 * Both routes are public (no auth) for GPT Builder access.
 */
export function registerOpenapiRoute(app: FastifyInstance): void {
    // Serve YAML format
    app.get('/api/v2/openapi.yaml', async (request, reply) => {
        reply.header('Content-Type', 'text/yaml; charset=utf-8');
        return schemaYaml;
    });

    // Serve JSON format
    app.get('/api/v2/openapi.json', async (request, reply) => {
        reply.header('Content-Type', 'application/json; charset=utf-8');
        return schemaJson;
    });

    app.log.info('OpenAPI schema routes registered at /api/v2/openapi.{yaml,json}');
}
