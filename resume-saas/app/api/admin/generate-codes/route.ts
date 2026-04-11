import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase-server';

const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I)
  const random = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `FREE-${random}`;
}

export async function POST(request: NextRequest) {
  // Only the admin email can generate codes
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { count = 1 } = await request.json() as { count?: number };
  const safeCount = Math.min(Math.max(1, count), 100); // cap at 100 at once

  const codes = Array.from({ length: safeCount }, () => ({ code: generateCode() }));

  const { data, error } = await adminSupabase
    .from('promo_codes')
    .insert(codes)
    .select('code');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ codes: data?.map(r => r.code) });
}
