import { NextRequest, NextResponse } from 'next/server';
import { HttpError, jsonError } from '@/lib/errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;

    if (!file) {
      throw new HttpError(400, 'No file uploaded');
    }

    const allowedTypes = folder === 'payments'
      ? ['image/jpeg', 'image/png', 'application/pdf']
      : ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      throw new HttpError(415, 'Unsupported file type');
    }

    if (file.size > MAX_SIZE_BYTES) {
      throw new HttpError(413, 'File exceeds 10MB limit');
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const safeFolder = folder && folder === 'payments' ? 'payments' : 'products';
    const bucket = folder === 'payments' ? 'payment-proofs' : 'product-images';
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 120);
    const path = `${safeFolder}/${Date.now()}-${safeName}`;

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (error) throw new HttpError(500, error.message);

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return NextResponse.json({ ok: true, path: data.path, publicUrl: publicUrlData.publicUrl });
  } catch (error) {
    return jsonError(error, 'Upload failed');
  }
}
