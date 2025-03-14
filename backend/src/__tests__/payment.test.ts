import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import app from '../index';
import { Payment, Prisma } from '@prisma/client';

const appInstance = app;

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    payment: {
      create: jest.fn().mockImplementation((params: { data: Payment }) => {
        if (params.data.email === 'test@example.com' && params.data.amount === 100 && params.data.currency === 'USD') {
          throw new Prisma.PrismaClientKnownRequestError('Database error', {
            code: 'P2002',
            clientVersion: '5.0.0',
            meta: {}
          });
        }
        return Promise.resolve({
          id: 'mock-id',
          ...params.data,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      })
    }
  })),
  Prisma: {
    PrismaClientKnownRequestError: class extends Error {
      code: string;
      clientVersion: string;
      constructor(message: string, params: { code: string; clientVersion: string; meta: Record<string, unknown> }) {
        super(message);
        this.name = 'PrismaClientKnownRequestError';
        this.code = params.code;
        this.clientVersion = params.clientVersion;
      }
    }
  }
}));

describe('Payment API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new payment successfully', async () => {
    const res = await appInstance.request('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 50,
        currency: 'USD',
        email: 'success@example.com',
      }),
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.payment).toHaveProperty('id');
    expect(data.payment.amount).toBe(50);
    expect(data.payment.currency).toBe('USD');
    expect(data.payment.email).toBe('success@example.com');
    expect(data.payment.status).toBe('pending');
  });

  it('should validate payment amount', async () => {
    const res = await appInstance.request('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: -100,
        currency: 'USD',
        email: 'test@example.com',
      }),
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error[0]).toHaveProperty('message');
  });

  it('should validate currency format', async () => {
    const res = await appInstance.request('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 100,
        currency: 'USDD',
        email: 'test@example.com',
      }),
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error[0]).toHaveProperty('message');
  });

  it('should validate email format', async () => {
    const res = await appInstance.request('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 100,
        currency: 'USD',
        email: 'invalid-email',
      }),
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error[0]).toHaveProperty('message');
  });

  it('should handle missing required fields', async () => {
    const res = await appInstance.request('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 100
      }),
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toHaveLength(2); // Missing currency and email
  });

  it('should handle database errors gracefully', async () => {
    const res = await appInstance.request('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 100,
        currency: 'USD',
        email: 'test@example.com',
      }),
    });

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Internal server error');
  });
});