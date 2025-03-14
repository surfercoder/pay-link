import { PaymentSchema } from './schema';

describe('PaymentSchema', () => {
  it('validates correct payment data', () => {
    const validData = {
      amount: 100,
      currency: 'USD',
      email: 'test@example.com'
    };

    const result = PaymentSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('validates amount must be greater than 0', () => {
    const invalidData = {
      amount: -100,
      currency: 'USD',
      email: 'test@example.com'
    };

    const result = PaymentSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('greater than 0');
    }
  });

  it('validates currency must be valid', () => {
    const invalidData = {
      amount: 100,
      currency: 'INVALID',
      email: 'test@example.com'
    };

    const result = PaymentSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Invalid enum value');
    }
  });

  it('validates email format', () => {
    const invalidData = {
      amount: 100,
      currency: 'USD',
      email: 'invalid-email'
    };

    const result = PaymentSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Invalid email');
    }
  });

  it('requires all fields', () => {
    const invalidData = {};

    const result = PaymentSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toHaveLength(3);
      expect(result.error.issues.map(issue => issue.message)).toEqual(
        expect.arrayContaining(['Required'])
      );
    }
  });
});