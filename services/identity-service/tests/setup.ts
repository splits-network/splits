import { vi } from 'vitest';

// Shared setup for identity-service tests.
vi.stubGlobal('fetch', vi.fn());
