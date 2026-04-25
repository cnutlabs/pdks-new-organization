import { NextResponse } from 'next/server';
import { bootstrapOrganizationSchema } from '@/lib/schema';

export const runtime = 'nodejs';

/**
 * Server-side proxy: forwards the bootstrap payload to the pdks-backend
 * with the SEED_API_KEY header. The browser never sees the key.
 */
export async function POST(req: Request) {
  const backendUrl = process.env.BACKEND_URL;
  const apiKey = process.env.SEED_API_KEY;

  if (!backendUrl) {
    return NextResponse.json(
      { success: false, message: 'BACKEND_URL env var is not configured on the server' },
      { status: 500 }
    );
  }
  if (!apiKey) {
    return NextResponse.json(
      { success: false, message: 'SEED_API_KEY env var is not configured on the server' },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Geçersiz JSON' },
      { status: 400 }
    );
  }

  // Pre-validate on the server to fail fast without burning a backend call
  const parsed = bootstrapOrganizationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: 'Doğrulama hatası',
        errors: parsed.error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      },
      { status: 400 }
    );
  }

  const url = `${backendUrl.replace(/\/+$/, '')}/api/admin/organizations/bootstrap`;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Seed-Api-Key': apiKey,
      },
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: `Backend'e ulaşılamadı: ${
          err instanceof Error ? err.message : String(err)
        }`,
      },
      { status: 502 }
    );
  }

  const text = await upstream.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: `Backend geçersiz yanıt döndü (HTTP ${upstream.status})`,
        raw: text.slice(0, 500),
      },
      { status: 502 }
    );
  }

  return NextResponse.json(json, { status: upstream.status });
}
