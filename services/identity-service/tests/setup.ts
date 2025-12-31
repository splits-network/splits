import { vi } from 'vitest';

// Setup global mocks
vi.mock('@supabase/supabase-js');
vi.mock('@clerk/backend');
vi.mock('amqplib');

// Environment variables for testing
process.env.CLERK_SECRET_KEY = 'test_clerk_secret';
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_supabase_key';
process.env.RABBITMQ_URL = 'amqp://localhost:5672';