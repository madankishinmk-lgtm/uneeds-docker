import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { HttpError, jsonError } from '@/lib/errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isOrderingClosed } from '@/lib/settings';
import { createOrderRequestSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';

const duplicateRequests = new Map<string, number>();
const DUPLICATE_TTL_MS = 1000 * 60 * 60 * 24;

function pruneDuplicateStore() {
  const now = Date.now();
  for (const [key, expiresAt] of duplicateRequests.entries()) {
    if (expiresAt <= now) duplicateRequests.delete(key);
  }
}

async function getServerFee(supabase: ReturnType<typeof createSupabaseServerClient>) {
  const { data } = await supabase.from('settings').select('service_fee').limit(1).maybeSingle();
  return Number(data?.service_fee || 0);
}

export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient();

  const orderId = request.nextUrl.searchParams.get('order_id');

  // Customer Track Order
  if (orderId) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('order_id', orderId)
      .maybeSingle();

    if (error) {
      return jsonError(new HttpError(500, error.message));
    }

    return NextResponse.json({
      order: data,
    });
  }

  // Admin Dashboard
  const authorized = await requireAdminAuth();

  if (!authorized) {
    return jsonError(new HttpError(401, 'Unauthorized'));
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return jsonError(new HttpError(500, error.message));
  }

  return NextResponse.json({
    orders: data || [],
  });
}

export async function POST(request: NextRequest) {
  try {
    if (!rateLimit(request)) {
      throw new HttpError(429, 'Too many requests');
    }

    const body = await request.json().catch(() => null);
    const parsed = createOrderRequestSchema.safeParse(body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid order payload', parsed.error.flatten());
    }

    const idempotencyKey = request.headers.get('x-idempotency-key');
    if (idempotencyKey) {
      pruneDuplicateStore();
      if (duplicateRequests.has(idempotencyKey)) {
        throw new HttpError(409, 'Duplicate submission');
      }
      duplicateRequests.set(idempotencyKey, Date.now() + DUPLICATE_TTL_MS);
    }

    const supabase = createSupabaseServerClient();
    const { data: settingsData } = await supabase.from('settings').select('*').limit(1).maybeSingle();
    if (isOrderingClosed(settingsData)) {
      throw new HttpError(403, 'Orders are currently closed');
    }

    const { order, items, paymentProofUrl, paymentProofName } = parsed.data;
    const productIds = items.map((item) => item.product_id).filter(Boolean);
    const { data: productsData, error: productsError } = await supabase.from('products').select('id, price, name').in('id', productIds);

    if (productsError) throw new HttpError(500, 'Unable to verify products');

    const productLookup = new Map((productsData || []).map((product) => [product.id, product]));
    const serverItems = items.map((item) => {
      const product = item.product_id ? productLookup.get(item.product_id) : null;
      if (!product) {
        throw new HttpError(422, 'One or more products are no longer available');
      }

      const unitPrice = Number(product.price);
      const totalPrice = unitPrice * item.quantity;
      const expectedTotal = Number(item.total_price);
      if (Math.abs(expectedTotal - totalPrice) > 0.01) {
        throw new HttpError(422, 'Price mismatch');
      }

      return {
        product_id: item.product_id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
      };
    });

    const serverFee = await getServerFee(supabase);
    const subtotal = serverItems.reduce((sum, item) => sum + item.total_price, 0);
    const total = subtotal + serverFee;

    if (Math.abs(Number(order.subtotal) - subtotal) > 0.01 || Math.abs(Number(order.service_fee) - serverFee) > 0.01 || Math.abs(Number(order.total) - total) > 0.01) {
      throw new HttpError(422, 'Totals do not match');
    }

    const orderId = `UNEEDS-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`;

    const { data, error } = await supabase.from('orders').insert({
      order_id: orderId,
      customer_name: order.customer_name,
      whatsapp: order.whatsapp,
      student_id: order.student_id || null,
      major: order.major,
      gender: order.gender,
      notes: order.notes || null,
      subtotal,
      service_fee: serverFee,
      total,
      status: 'Waiting Verification',
      payment_proof_url: paymentProofUrl || null,
      payment_proof_name: paymentProofName || null,
    }).select('id, order_id').single();

    if (error) throw new HttpError(500, error.message);

    const { error: itemsError } = await supabase.from('order_items').insert(serverItems.map((item) => ({
      order_id: data.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    })));

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', data.id);
      throw new HttpError(500, 'Failed to create order items');
    }

    const proofPayload = {
      order_id: data.id,
      file_name: paymentProofName || 'payment-proof',
      file_url: paymentProofUrl || null,
      created_at: new Date().toISOString(),
    };

    const { error: proofError } = await supabase.from('payment_proofs').insert(proofPayload);
    if (proofError) {
      await supabase.from('orders').delete().eq('id', data.id);
      throw new HttpError(500, 'Failed to save payment proof');
    }

    return NextResponse.json({ ok: true, orderId, orderIdDb: data.order_id }, { status: 201 });
  } catch (error) {
    return jsonError(error, 'Failed to create order');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authorized = await requireAdminAuth();
    if (!authorized) {
      throw new HttpError(401, 'Unauthorized');
    }

    const body = await request.json().catch(() => null);
    const status = body?.status;
    const id = body?.id;

    if (!id || !status) {
      throw new HttpError(400, 'Missing id or status');
    }

    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) throw new HttpError(500, error.message);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error, 'Failed to update order');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authorized = await requireAdminAuth();
    if (!authorized) {
      throw new HttpError(401, 'Unauthorized');
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      throw new HttpError(400, 'Missing order id');
    }

    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw new HttpError(500, error.message);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error, 'Failed to delete order');
  }
}
