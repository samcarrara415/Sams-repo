import { randomInt } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import { isAdmin } from '@/lib/admin';

// No 0/O or 1/I, so codes are easy to read out loud.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;

function generateCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) code += ALPHABET[randomInt(ALPHABET.length)];
  return `FREE-${code}`;
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!isAdmin(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const requested = Math.floor(Number(body.count));
  const count = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), 100) : 1;

  const codes = Array.from({ length: count }, () => ({ code: generateCode() }));
  const { data, error } = await createAdminClient().from('promo_codes').insert(codes).select('code');

  if (error) {
    console.error('Generating promo codes failed:', error);
    return NextResponse.json({ error: 'Could not create codes. Try again.' }, { status: 500 });
  }
  return NextResponse.json({ codes: data.map(row => row.code) });
}
