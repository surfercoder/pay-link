'use server';

import { PaymentSchema } from './schema';

type State = { error: string | null; success: boolean };

export async function createPayment(prevState: State, formData: FormData): Promise<State> {
  try {
    const rawData = {
      amount: Number(formData.get('amount')),
      currency: formData.get('currency'),
      email: formData.get('email')
    };

    const validatedData = PaymentSchema.parse(rawData);

    const response = await fetch('http://localhost:4000/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Payment failed');
    }

    return { error: null, success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message, success: false };
    }
    return { error: 'Something went wrong', success: false };
  }
}