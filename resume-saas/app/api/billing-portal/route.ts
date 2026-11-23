import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import { getStripe } from '@/lib/stripe';

// Sends subscribers to Stripe's hosted page to cancel or update payment details.
export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });

  const { data: profile } = await createAdminClient()
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();
  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: 'No billing account found.' }, { status: 404 });
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Billing portal failed:', err);
    return NextResponse.json({ error: 'Could not open billing. Try again.' }, { status: 500 });
  }
}
