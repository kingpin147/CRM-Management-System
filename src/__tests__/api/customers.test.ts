import { describe, it, expect, vi } from 'vitest';
import { GET } from '@/app/api/customers/search/route';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

describe('GET /api/customers/search', () => {
  it('returns 400 if no search criteria are provided', async () => {
    const req = new NextRequest('http://localhost:3000/api/customers/search');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Please provide at least one search criterion.');
  });

  it('searches for a customer and returns 200', async () => {
    // Mock prisma response
    (prisma.customer.findMany as any).mockResolvedValueOnce([{ id: '1', fullName: 'John Doe' }]);

    const req = new NextRequest('http://localhost:3000/api/customers/search?fullName=John');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0].fullName).toBe('John Doe');
  });
});
