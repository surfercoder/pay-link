import { Hono } from 'hono';
import { cors } from 'hono/cors';
import * as zod from 'zod';
import { PrismaClient } from '@prisma/client';
import { serve } from '@hono/node-server';

const app = new Hono();
const prisma = new PrismaClient();

app.use('/*', cors());

const PaymentSchema = zod.object({
  amount: zod.number().positive(),
  currency: zod.string().length(3),
  email: zod.string().email()
});

app.post('/api/checkout', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = PaymentSchema.parse(body);

    const payment = await prisma.payment.create({
      data: {
        amount: validatedData.amount,
        currency: validatedData.currency,
        email: validatedData.email,
        status: 'pending'
      }
    });

    return c.json({ success: true, payment }, 201);
  } catch (error) {
    if (error instanceof zod.ZodError) {
      return c.json({ success: false, error: error.errors }, 400);
    }
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

const PORT = 4000;

// eslint-disable-next-line
console.log(`Server is running on http://localhost:${PORT}`);

serve({
  fetch: app.fetch,
  port: PORT,
});

export default app;