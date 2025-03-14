'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createPayment } from '../lib/actions';
import { PaymentSchema } from '../lib/schema';
import { useState } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
    >
      {pending ? 'Processing...' : 'Pay Now'}
    </button>
  );
}

export default function PaymentForm() {
  const [clientErrors, setClientErrors] = useState<{ [key: string]: string }>({});
  const [state, formAction] = useActionState(createPayment, { error: null, success: false });

  const handleSubmit = async (formData: FormData) => {

    const rawData = {
      amount: Number(formData.get('amount')),
      currency: formData.get('currency'),
      email: formData.get('email')
    };

    const result = PaymentSchema.safeParse(rawData);
    if (!result.success) {
      const errors: { [key: string]: string } = {};
      result.error.issues.forEach((issue) => {
        errors[issue.path[0].toString()] = issue.message;
      });
      setClientErrors(errors);
      return;
    }


    formAction(formData);
  };

  if (state.success) {
    return (
      <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h2 className="text-xl font-bold text-green-600">Payment Successful!</h2>
          <p className="mt-2 text-gray-600">Thank you for your payment</p>
        </div>
      </div>
    );
  }

  const getInputClassName = (fieldName: string) => {
    if (state.error) return `${baseClasses} border-red-300`;
    const baseClasses = "mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2.5 px-4";
    return `${baseClasses} ${clientErrors[fieldName] ? 'border-red-300' : 'border-gray-300'}`;
  };

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md">
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            step="0.01"
            className={getInputClassName('amount')}
          />
          {clientErrors.amount && (
            <p className="mt-1 text-sm text-red-600" role="alert">{clientErrors.amount}</p>
          )}
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            className={getInputClassName('currency')}
          >
            <option value="">Select currency</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
          {clientErrors.currency && (
            <p className="mt-1 text-sm text-red-600" role="alert">{clientErrors.currency}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={getInputClassName('email')}
          />
          {clientErrors.email && (
            <p className="mt-1 text-sm text-red-600" role="alert">{clientErrors.email}</p>
          )}
        </div>

        {state.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm" role="alert">{state.error}</p>
          </div>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}