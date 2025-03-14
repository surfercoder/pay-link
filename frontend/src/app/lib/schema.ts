import { z } from 'zod';

export const PaymentSchema = z.object({
  amount: z.number({
    required_error: "Amount is required",
    invalid_type_error: "Amount must be a number",
  }).positive("Amount must be greater than 0"),
  currency: z.enum(["USD", "EUR", "GBP"], {
    required_error: "Currency is required",
    invalid_type_error: "Invalid currency",
  }),
  email: z.string({
    required_error: "Email is required",
  }).email("Please enter a valid email address")
});

export type Payment = z.infer<typeof PaymentSchema>;