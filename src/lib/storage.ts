export function getStoragePublicUrl(path: string | null | undefined, bucket = 'product-images') {
  if (!path) return null;
  if (String(path).startsWith('http')) return path;
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (!baseUrl) return null;
  const normalizedPath = String(path).replace(/^\//, '');
  return `${baseUrl}/storage/v1/object/public/${bucket}/${normalizedPath}`;
}
