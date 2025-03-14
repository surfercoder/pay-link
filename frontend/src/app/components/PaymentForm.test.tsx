import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PaymentForm from './PaymentForm';
import { createPayment } from '../lib/actions';

// Mock the server action
jest.mock('../lib/actions', () => ({
  createPayment: jest.fn()
}));

// Mock useFormStatus and useActionState
let mockPending = false;
let mockState = { error: null, success: false };
let mockFormAction = jest.fn();

jest.mock('react-dom', () => ({
  useFormStatus: () => ({ pending: mockPending })
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useActionState: () => [mockState, mockFormAction]
}));

describe('PaymentForm', () => {
  const mockFormData = new FormData();
  
  beforeEach(() => {
    mockFormData.set('amount', '100');
    mockFormData.set('currency', 'USD');
    mockFormData.set('email', 'test@example.com');
  });
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    mockPending = false;
  });

  it('handles form submission with client-side validation', async () => {
    render(<PaymentForm />);
    
    // Submit form with invalid data
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '-50' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: /pay now/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/amount.*must be greater than 0/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid.*email/i)).toBeInTheDocument();
    });

    // Fix the validation errors
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/currency/i), { target: { value: 'USD' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText(/amount.*must be greater than 0/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/invalid.*email/i)).not.toBeInTheDocument();
    });
  });

  it('handles form submission with server-side validation', async () => {
    const mockCreatePayment = createPayment as jest.Mock;
    mockCreatePayment.mockResolvedValueOnce({ error: 'Server validation error', success: false });

    render(<PaymentForm />);
    
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/currency/i), { target: { value: 'USD' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    
    fireEvent.click(screen.getByRole('button', { name: /pay now/i }));

    await waitFor(() => {
      expect(screen.getByText('Server validation error')).toBeInTheDocument();
    });
  });

  it('handles form reset after successful submission', async () => {
    const mockCreatePayment = createPayment as jest.Mock;
    mockCreatePayment.mockResolvedValueOnce({ error: null, success: true });

    render(<PaymentForm />);
    
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/currency/i), { target: { value: 'USD' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    
    fireEvent.click(screen.getByRole('button', { name: /pay now/i }));

    await waitFor(() => {
      expect(screen.getByText(/payment successful/i)).toBeInTheDocument();
      expect(screen.queryByRole('form')).not.toBeInTheDocument();
    });
  });

  it('renders the payment form with all fields', () => {
    render(<PaymentForm />);
    
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pay now/i })).toBeInTheDocument();
  });

  it('displays validation errors for empty fields', async () => {
    render(<PaymentForm />);
    
    const submitButton = screen.getByRole('button', { name: /pay now/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/amount.*required/i)).toBeInTheDocument();
      expect(screen.getByText(/currency.*required/i)).toBeInTheDocument();
      expect(screen.getByText(/email.*required/i)).toBeInTheDocument();
    });
  });

  it('displays validation error for invalid amount', async () => {
    render(<PaymentForm />);
    
    const amountInput = screen.getByLabelText(/amount/i);
    fireEvent.change(amountInput, { target: { value: '-100' } });
    
    const submitButton = screen.getByRole('button', { name: /pay now/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/amount.*must be greater than 0/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during form submission', async () => {
    mockPending = true;
    render(<PaymentForm />);
    
    const submitButton = screen.getByRole('button', { name: /processing/i });
    expect(submitButton).toBeDisabled();
  });

  it('validates currency selection', async () => {
    render(<PaymentForm />);
    
    const currencySelect = screen.getByLabelText(/currency/i);
    fireEvent.change(currencySelect, { target: { value: '' } });
    
    const submitButton = screen.getByRole('button', { name: /pay now/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/currency.*required/i)).toBeInTheDocument();
    });
  });

  it('displays validation error for invalid email', async () => {
    render(<PaymentForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: /pay now/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid.*email/i)).toBeInTheDocument();
    });
  });

  it('handles successful payment submission', async () => {
    const mockCreatePayment = createPayment as jest.Mock;
    mockCreatePayment.mockResolvedValueOnce({ error: null, success: true });

    render(<PaymentForm />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/currency/i), { target: { value: 'USD' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /pay now/i });
    fireEvent.click(submitButton);

    // Check if success message is displayed
    await waitFor(() => {
      expect(screen.getByText(/payment successful/i)).toBeInTheDocument();
      expect(screen.getByText(/thank you for your payment/i)).toBeInTheDocument();
    });

    // Verify form submission
    expect(mockCreatePayment).toHaveBeenCalledTimes(1);
  });

  it('applies correct CSS classes based on validation state', () => {
    render(<PaymentForm />);
    
    // Initially all inputs should have default styling
    const amountInput = screen.getByLabelText(/amount/i);
    expect(amountInput.className).toContain('border-gray-300');
    
    // Submit empty form to trigger validation errors
    const submitButton = screen.getByRole('button', { name: /pay now/i });
    fireEvent.click(submitButton);
    
    // Check if error styling is applied
    expect(amountInput.className).toContain('border-red-300');
  });

  it('clears validation errors when valid data is submitted', async () => {
    render(<PaymentForm />);
    
    // Trigger validation errors first
    const submitButton = screen.getByRole('button', { name: /pay now/i });
    fireEvent.click(submitButton);
    
    // Fill form with valid data
    const amountInput = screen.getByLabelText(/amount/i);
    const currencySelect = screen.getByLabelText(/currency/i);
    const emailInput = screen.getByLabelText(/email/i);
    
    fireEvent.change(amountInput, { target: { value: '100' } });
    fireEvent.change(currencySelect, { target: { value: 'USD' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Submit valid form
    fireEvent.click(submitButton);
    
    // Check if error styling is removed
    await waitFor(() => {
      expect(amountInput.className).toContain('border-gray-300');
      expect(amountInput.className).not.toContain('border-red-300');
    });
  });

  it('handles payment submission error', async () => {
    const errorMessage = 'Payment failed';
    const mockCreatePayment = createPayment as jest.Mock;
    mockCreatePayment.mockResolvedValueOnce({ error: errorMessage, success: false });

    render(<PaymentForm />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/currency/i), { target: { value: 'USD' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /pay now/i });
    fireEvent.click(submitButton);

    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Verify form submission
    expect(mockCreatePayment).toHaveBeenCalledTimes(1);
  });

  it('handles network error during payment submission', async () => {
    const mockCreatePayment = createPayment as jest.Mock;
    mockCreatePayment.mockRejectedValueOnce(new Error('Network error'));

    render(<PaymentForm />);
    
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/currency/i), { target: { value: 'USD' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    
    fireEvent.click(screen.getByRole('button', { name: /pay now/i }));

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('validates form data before submission', async () => {
    render(<PaymentForm />);
    
    // Submit empty form
    fireEvent.click(screen.getByRole('button', { name: /pay now/i }));

    await waitFor(() => {
      expect(screen.getByText(/amount.*required/i)).toBeInTheDocument();
      expect(screen.getByText(/currency.*required/i)).toBeInTheDocument();
      expect(screen.getByText(/email.*required/i)).toBeInTheDocument();
    });

    // Fill with invalid data
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '-50' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid-email' } });

    fireEvent.click(screen.getByRole('button', { name: /pay now/i }));

    await waitFor(() => {
      expect(screen.getByText(/amount.*must be greater than 0/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid.*email/i)).toBeInTheDocument();
    });
  });

  it('clears validation errors when valid data is entered', async () => {
    render(<PaymentForm />);
    
    // Submit empty form to trigger errors
    fireEvent.click(screen.getByRole('button', { name: /pay now/i }));

    await waitFor(() => {
      expect(screen.getByText(/amount.*required/i)).toBeInTheDocument();
    });

    // Enter valid data
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/currency/i), { target: { value: 'USD' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });

    // Verify errors are cleared
    await waitFor(() => {
      expect(screen.queryByText(/amount.*required/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/currency.*required/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/email.*required/i)).not.toBeInTheDocument();
    });
  });

  it('handles non-Error exceptions during payment submission', async () => {
    const mockCreatePayment = createPayment as jest.Mock;
    mockCreatePayment.mockRejectedValueOnce('Unexpected error');

    render(<PaymentForm />);
    
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/currency/i), { target: { value: 'USD' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    
    fireEvent.click(screen.getByRole('button', { name: /pay now/i }));

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  it('handles malformed API response', async () => {
    const mockCreatePayment = createPayment as jest.Mock;
    mockCreatePayment.mockResolvedValueOnce({ unexpected: 'format' });

    render(<PaymentForm />);
    
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/currency/i), { target: { value: 'USD' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    
    fireEvent.click(screen.getByRole('button', { name: /pay now/i }));

    await waitFor(() => {
      expect(screen.getByText('Payment failed')).toBeInTheDocument();
    });
  });

  it('displays success message after successful payment', async () => {
    const mockCreatePayment = createPayment as jest.Mock;
    mockCreatePayment.mockResolvedValueOnce({ error: null, success: true });

    render(<PaymentForm />);
    
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/currency/i), { target: { value: 'USD' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    
    fireEvent.click(screen.getByRole('button', { name: /pay now/i }));

    await waitFor(() => {
      expect(screen.getByText(/payment successful/i)).toBeInTheDocument();
      expect(screen.getByText(/thank you for your payment/i)).toBeInTheDocument();
    });
  });

  it('handles form submission with valid data', async () => {
    const mockCreatePayment = createPayment as jest.Mock;
    mockCreatePayment.mockResolvedValueOnce({ error: null, success: true });

    render(<PaymentForm />);
    
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/currency/i), { target: { value: 'USD' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: /pay now/i });
    expect(submitButton).not.toBeDisabled();
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreatePayment).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(FormData)
      );
    });
  });

  it('shows loading state during form submission', async () => {
    mockPending = true;
    render(<PaymentForm />);
    
    const submitButton = screen.getByRole('button', { name: /processing/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Processing...');
  });

  it('handles form submission with client-side validation errors', async () => {
    render(<PaymentForm />);
    
    // Submit form with invalid data
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '-50' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid-email' } });
    
    fireEvent.click(screen.getByRole('button', { name: /pay now/i }));

    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/amount.*must be greater than 0/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid.*email/i)).toBeInTheDocument();
    });

    // Verify that createPayment was not called
    expect(createPayment).not.toHaveBeenCalled();
  });

  it('updates input styling based on validation state', async () => {
    render(<PaymentForm />);
    
    const amountInput = screen.getByLabelText(/amount/i);
    const emailInput = screen.getByLabelText(/email/i);

    // Initially inputs should have default styling
    expect(amountInput.className).toContain('border-gray-300');
    expect(emailInput.className).toContain('border-gray-300');

    // Submit form with invalid data
    fireEvent.change(amountInput, { target: { value: '-50' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    fireEvent.click(screen.getByRole('button', { name: /pay now/i }));

    // Check if error styling is applied
    await waitFor(() => {
      expect(amountInput.className).toContain('border-red-300');
      expect(emailInput.className).toContain('border-red-300');
    });

    // Fix the inputs with valid data
    fireEvent.change(amountInput, { target: { value: '100' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // Check if error styling is removed
    await waitFor(() => {
      expect(amountInput.className).toContain('border-gray-300');
      expect(emailInput.className).toContain('border-gray-300');
    });
  });
});