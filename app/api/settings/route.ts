import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminAuth } from '@/lib/auth';
import { HttpError, jsonError } from '@/lib/errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const settingsPayloadSchema = z.object({
  settings: z.object({
    whatsapp_number: z.string().trim().max(40).optional(),
    bca_account_number: z.string().trim().max(40).optional(),
    bca_account_name: z.string().trim().max(120).optional(),
    qris_image_url: z.string().trim().max(500).nullable().optional(),
    service_fee: z.number().nonnegative().optional(),
    ordering_enabled: z.boolean().optional(),
    order_open_date: z.string().trim().max(40).nullable().optional(),
    order_close_date: z.string().trim().max(40).nullable().optional(),
  }),
});

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('settings').select('*').limit(1).maybeSingle();

  if (error) {
    return jsonError(new HttpError(500, error.message));
  }

  return NextResponse.json({ settings: data });
}

export async function PUT(request: NextRequest) {
  try {
    const authorized = await requireAdminAuth();
    if (!authorized) {
      throw new HttpError(401, 'Unauthorized');
    }

    const body = await request.json().catch(() => null);
    const parsed = settingsPayloadSchema.safeParse(body);
    if (!parsed.success) {
      throw new HttpError(400, 'Invalid settings payload', parsed.error.flatten());
    }

    const supabase = createSupabaseServerClient();
    const { data: existing } = await supabase.from('settings').select('id').limit(1).maybeSingle();

    const payload = {
      whatsapp_number: parsed.data.settings.whatsapp_number || '',
      bca_account_number: parsed.data.settings.bca_account_number || '',
      bca_account_name: parsed.data.settings.bca_account_name || '',
      qris_image_url: parsed.data.settings.qris_image_url || null,
      service_fee: parsed.data.settings.service_fee ?? 0,
    };

    let result;
    if (existing?.id) {
      result = await supabase.from('settings').update(payload).eq('id', existing.id).select('*').single();
    } else {
      result = await supabase.from('settings').insert(payload).select('*').single();
    }

    if (result.error) throw new HttpError(500, result.error.message);
    return NextResponse.json({ settings: result.data });
  } catch (error) {
    return jsonError(error, 'Failed to save settings');
  }
}
