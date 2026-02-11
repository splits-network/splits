import { vi, beforeEach } from 'vitest';

beforeEach(() => {
    vi.restoreAllMocks();
});

// Silence console output during tests
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});
