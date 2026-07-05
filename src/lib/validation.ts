import { z } from 'zod';

export const orderSchema = z.object({
  customer_name: z.string().trim().min(2).max(120),
  whatsapp: z.string().trim().min(6).max(30),
  student_id: z.string().trim().max(40).optional().nullable(),
  major: z.string().trim().min(2).max(120),
  gender: z.string().trim().min(2).max(30),
  notes: z.string().trim().max(1000).optional().nullable(),
  subtotal: z.number().nonnegative(),
  service_fee: z.number().nonnegative(),
  total: z.number().nonnegative(),
});

export const orderItemSchema = z.object({
  product_id: z.string().uuid().optional().nullable(),
  product_name: z.string().trim().min(2).max(120),
  quantity: z.number().int().positive().max(20),
  unit_price: z.number().nonnegative(),
  total_price: z.number().nonnegative(),
});

export const createOrderRequestSchema = z.object({
  order: orderSchema,
  items: z.array(orderItemSchema).min(1).max(50),
  paymentProofUrl: z.string().url().optional().nullable(),
  paymentProofName: z.string().trim().max(200).optional().nullable(),
});

export const adminLoginSchema = z.object({
  password: z.string().trim().min(1).max(200),
});

export const adminOrderStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['Waiting Verification', 'Approved', 'Rejected', 'Completed', 'Cancelled']),
});
