import { FastifyRequest, FastifyReply } from 'fastify';
import { ApiError } from '@splits-network/shared-types';
import { Logger } from '@splits-network/shared-logging';

export class HttpError extends Error {
    constructor(
        public statusCode: number,
        public code: string,
        message: string,
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = 'HttpError';
    }
}

export class BadRequestError extends HttpError {
    constructor(message: string, details?: Record<string, any>) {
        super(400, 'BAD_REQUEST', message, details);
    }
}

export class UnauthorizedError extends HttpError {
    constructor(message = 'Unauthorized') {
        super(401, 'UNAUTHORIZED', message);
    }
}

export class ForbiddenError extends HttpError {
    constructor(message = 'Forbidden') {
        super(403, 'FORBIDDEN', message);
    }
}

export class NotFoundError extends HttpError {
    constructor(resource: string, id?: string) {
        const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
        super(404, 'NOT_FOUND', message);
    }
}

export class ConflictError extends HttpError {
    constructor(message: string, details?: Record<string, any>) {
        super(409, 'CONFLICT', message, details);
    }
}

export class InternalServerError extends HttpError {
    constructor(message = 'Internal server error') {
        super(500, 'INTERNAL_SERVER_ERROR', message);
    }
}

/**
 * Error handler middleware for Fastify
 */
export function errorHandler(
    error: Error,
    request: FastifyRequest,
    reply: FastifyReply
) {
    request.log.error(error);

    if (error instanceof HttpError) {
        const response: ApiError = {
            error: {
                code: error.code,
                message: error.message,
                details: error.details,
            },
        };
        return reply.status(error.statusCode).send(response);
    }

    // Default to 500 for unknown errors
    const response: ApiError = {
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
        },
    };
    return reply.status(500).send(response);
}

export interface ProcessErrorHandlerOptions {
    /** Logger instance to use for error output */
    logger: Logger;
    /**
     * Optional async callback called with the fatal error before the process exits.
     * Use this to flush Sentry or other external error reporters.
     * Will be awaited with a 2.5-second hard timeout to prevent the process hanging.
     */
    onFatalError?: (error: Error) => Promise<void>;
}

/**
 * Register process-level handlers for uncaught exceptions and unhandled promise
 * rejections. Call this once, as early as possible inside `main()`, before any
 * async work starts.
 *
 * Both handlers:
 *  1. Log the full error with stack trace at `error` level.
 *  2. Await `onFatalError` (e.g. Sentry flush) with a 2.5 s hard timeout.
 *  3. Exit with code 1 so Kubernetes restarts the pod and the crash is visible
 *     in `kubectl describe pod` / `kubectl logs --previous`.
 *
 * Without this, uncaught errors crash Node silently, Sentry never receives the
 * event, and you lose all context for what went wrong.
 */
export function setupProcessErrorHandlers(options: ProcessErrorHandlerOptions): void {
    const { logger, onFatalError } = options;

    const handleFatal = async (error: Error, origin: string): Promise<void> => {
        try {
            logger.error({ err: error, origin }, `Fatal process error [${origin}] — service is shutting down`);
            if (onFatalError) {
                // Hard 2.5 s timeout — cannot wait forever before exiting
                await Promise.race([
                    onFatalError(error),
                    new Promise<void>((resolve) => setTimeout(resolve, 2500)),
                ]);
            }
        } finally {
            process.exit(1);
        }
    };

    process.on('uncaughtException', (error: Error, origin: string) => {
        void handleFatal(error, origin);
    });

    process.on('unhandledRejection', (reason: unknown) => {
        const error =
            reason instanceof Error
                ? reason
                : new Error(typeof reason === 'string' ? reason : JSON.stringify(reason));
        void handleFatal(error, 'unhandledRejection');
    });
}
