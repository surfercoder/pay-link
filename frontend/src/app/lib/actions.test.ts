import { createPayment } from './actions';

global.fetch = jest.fn();

describe('createPayment', () => {
  const mockFormData = new FormData();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFormData.set('amount', '100');
    mockFormData.set('currency', 'USD');
    mockFormData.set('email', 'test@example.com');
  });

  it('should handle successful payment creation', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    const result = await createPayment(
      { error: null, success: false },
      mockFormData
    );

    expect(result).toEqual({ error: null, success: true });
    expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 100,
        currency: 'USD',
        email: 'test@example.com'
      })
    });
  });

  it('should handle API error response', async () => {
    const errorMessage = 'Payment failed';
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: errorMessage })
    });

    const result = await createPayment(
      { error: null, success: false },
      mockFormData
    );

    expect(result).toEqual({ error: errorMessage, success: false });
  });

  it('should handle validation errors', async () => {
    const invalidFormData = new FormData();
    invalidFormData.set('amount', '-100');
    invalidFormData.set('currency', 'INVALID');
    invalidFormData.set('email', 'invalid-email');

    const result = await createPayment(
      { error: null, success: false },
      invalidFormData
    );

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('should handle API response parsing error', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.reject(new Error('Invalid JSON'))
    });

    const result = await createPayment(
      { error: null, success: false },
      mockFormData
    );

    expect(result).toEqual({ error: 'Payment failed', success: false });
  });

  it('should handle non-Error exceptions', async () => {
    (fetch as jest.Mock).mockImplementationOnce(() => {
      throw 'Unexpected error';
    });

    const result = await createPayment(
      { error: null, success: false },
      mockFormData
    );

    expect(result).toEqual({ error: 'Something went wrong', success: false });
  });

  it('should handle network errors', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const result = await createPayment(
      { error: null, success: false },
      mockFormData
    );

    expect(result).toEqual({ error: 'Network error', success: false });
  });

  it('should handle invalid form data', async () => {
    const invalidFormData = new FormData();
    invalidFormData.set('amount', '-100');
    invalidFormData.set('currency', 'INVALID');
    invalidFormData.set('email', 'invalid-email');

    const result = await createPayment(
      { error: null, success: false },
      invalidFormData
    );

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('should handle missing form data fields', async () => {
    const emptyFormData = new FormData();
    
    const result = await createPayment(
      { error: null, success: false },
      emptyFormData
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('required');
  });

  it('should handle malformed API response', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ unexpected: 'format' })
    });

    const result = await createPayment(
      { error: null, success: false },
      mockFormData
    );

    expect(result).toEqual({ error: 'Payment failed', success: false });
  });

  it('should handle network error', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const result = await createPayment(
      { error: null, success: false },
      mockFormData
    );

    expect(result).toEqual({ error: 'Network error', success: false });
  });

  it('should handle invalid form data', async () => {
    const invalidFormData = new FormData();
    invalidFormData.set('amount', '-100');
    invalidFormData.set('currency', 'INVALID');
    invalidFormData.set('email', 'invalid-email');

    const result = await createPayment(
      { error: null, success: false },
      invalidFormData
    );

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should handle missing form data fields', async () => {
    const emptyFormData = new FormData();
    
    const result = await createPayment(
      { error: null, success: false },
      emptyFormData
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('required');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should handle malformed API response', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ unexpected: 'format' })
    });

    const result = await createPayment(
      { error: null, success: false },
      mockFormData
    );

    expect(result).toEqual({ error: 'Payment failed', success: false });
  });

  it('should handle non-Error exceptions', async () => {
    (fetch as jest.Mock).mockImplementationOnce(() => {
      throw 'Unexpected error';
    });

    const result = await createPayment(
      { error: null, success: false },
      mockFormData
    );

    expect(result).toEqual({ error: 'Something went wrong', success: false });
  });

  it('should handle network errors', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const result = await createPayment(
      { error: null, success: false },
      mockFormData
    );

    expect(result).toEqual({ error: 'Network error', success: false });
  });

  it('should handle invalid form data', async () => {
    const invalidFormData = new FormData();
    invalidFormData.set('amount', '-100');
    invalidFormData.set('currency', 'INVALID');
    invalidFormData.set('email', 'invalid-email');

    const result = await createPayment(
      { error: null, success: false },
      invalidFormData
    );

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('should handle missing form data fields', async () => {
    const emptyFormData = new FormData();
    
    const result = await createPayment(
      { error: null, success: false },
      emptyFormData
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('required');
  });

  it('should handle malformed API response', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ unexpected: 'format' })
    });

    const result = await createPayment(
      { error: null, success: false },
      mockFormData
    );

    expect(result).toEqual({ error: 'Payment failed', success: false });
  });

  it('should handle API response parsing error', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.reject(new Error('Invalid JSON'))
    });

    const result = await createPayment(
      { error: null, success: false },
      mockFormData
    );

    expect(result).toEqual({ error: 'Payment failed', success: false });
  });
});