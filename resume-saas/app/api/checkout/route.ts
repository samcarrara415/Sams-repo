import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import { getStripe } from '@/lib/stripe';

const SINGLE_PRICE_CENTS = 200;

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const plan = body.plan;
  const resumeId = typeof body.resumeId === 'string' ? body.resumeId : '';
  if (plan !== 'single' && plan !== 'monthly') {
    return NextResponse.json({ error: 'Unknown plan.' }, { status: 400 });
  }
  if (!resumeId) return NextResponse.json({ error: 'Missing resume.' }, { status: 400 });

  const admin = createAdminClient();

  const { data: resume } = await admin
    .from('resumes')
    .select('id, is_unlocked')
    .eq('id', resumeId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!resume) return NextResponse.json({ error: 'Resume not found.' }, { status: 404 });
  if (resume.is_unlocked) return NextResponse.json({ error: 'This resume is already unlocked.' }, { status: 409 });

  try {
    const stripe = getStripe();

    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id as string | null | undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, metadata: { userId: user.id } });
      customerId = customer.id;
      await admin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
    }

    // Use the configured URL, not the request's Origin header, for redirects.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const common = {
      customer: customerId,
      client_reference_id: user.id,
      metadata: { userId: user.id, resumeId },
      success_url: `${appUrl}/success?resume=${resumeId}`,
      cancel_url: `${appUrl}/dashboard`,
    } satisfies Stripe.Checkout.SessionCreateParams;

    const session = plan === 'single'
      ? await stripe.checkout.sessions.create({
          ...common,
          mode: 'payment',
          line_items: [{
            price_data: {
              currency: 'usd',
              unit_amount: SINGLE_PRICE_CENTS,
              product_data: { name: 'Resume Remaster: one resume' },
            },
            quantity: 1,
          }],
        })
      : await stripe.checkout.sessions.create({
          ...common,
          mode: 'subscription',
          line_items: [{ price: process.env.STRIPE_MONTHLY_PRICE_ID!, quantity: 1 }],
          subscription_data: { metadata: { userId: user.id } },
        });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Checkout failed:', err);
    return NextResponse.json({ error: 'Could not start checkout. Try again.' }, { status: 500 });
  }
}
