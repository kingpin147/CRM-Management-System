import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global mocks
vi.mock('@/lib/prisma', () => {
  return {
    default: {
      customer: {
        findMany: vi.fn(),
        create: vi.fn(),
      },
      // add more models as needed
    }
  };
});

vi.mock('@/utils/supabase/server', () => {
  return {
    createClient: vi.fn(() => ({
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } } }))
      }
    }))
  };
});
