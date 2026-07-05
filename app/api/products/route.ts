import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminAuth } from '@/lib/auth';
import { HttpError, jsonError } from '@/lib/errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const productPayloadSchema = z.object({
  product: z.object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(2).max(120),
    price: z.number().nonnegative(),
    image_url: z.string().trim().max(500).nullable().optional(),
    image_url: z.string().trim().max(500).nullable().optional(),
    stock: z.number().int().nonnegative().optional(),
    description: z.string().trim().max(1000).nullable().optional(),
  }),
});

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });

  if (error) {
    return jsonError(new HttpError(500, error.message));
  }

  return NextResponse.json({ products: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const authorized = await requireAdminAuth();
    if (!authorized) {
      throw new HttpError(401, 'Unauthorized');
    }

    const body = await request.json().catch(() => null);
    const parsed = productPayloadSchema.safeParse(body);
    if (!parsed.success) {
      throw new HttpError(400, 'Invalid product payload', parsed.error.flatten());
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from('products').insert({
      name: parsed.data.product.name,
      price: parsed.data.product.price,
      image_url: parsed.data.product.image_url || parsed.data.product.image_url || null,
      stock: parsed.data.product.stock ?? 99,
      description: parsed.data.product.description || null,
    }).select('*').single();

    if (error) throw new HttpError(500, error.message);
    return NextResponse.json({ product: data });
  } catch (error) {
    return jsonError(error, 'Failed to create product');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authorized = await requireAdminAuth();
    if (!authorized) {
      throw new HttpError(401, 'Unauthorized');
    }

    const body = await request.json().catch(() => null);
    const parsed = productPayloadSchema.safeParse(body);
    if (!parsed.success) {
      throw new HttpError(400, 'Invalid product payload', parsed.error.flatten());
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from('products').update({
      name: parsed.data.product.name,
      price: parsed.data.product.price,
      image_url: parsed.data.product.image_url || parsed.data.product.image_url || null,
      stock: parsed.data.product.stock ?? 99,
      description: parsed.data.product.description || null,
    }).eq('id', parsed.data.product.id).select('*').single();

    if (error) throw new HttpError(500, error.message);
    return NextResponse.json({ product: data });
  } catch (error) {
    return jsonError(error, 'Failed to update product');
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
      throw new HttpError(400, 'Missing product id');
    }

    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw new HttpError(500, error.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error, 'Failed to delete product');
  }
}
