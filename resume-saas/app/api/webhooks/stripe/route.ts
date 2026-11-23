import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase-admin';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';

type Admin = ReturnType<typeof createAdminClient>;

async function unlockResume(db: Admin, session: Stripe.Checkout.Session, method: 'single' | 'monthly') {
  const { userId, resumeId } = session.metadata ?? {};
  if (!userId || !resumeId) return;
  const { error } = await db
    .from('resumes')
    .update({ is_unlocked: true, unlock_method: method, unlocked_at: new Date().toISOString(), stripe_session_id: session.id })
    .eq('id', resumeId)
    .eq('user_id', userId)
    .eq('is_unlocked', false);
  if (error) throw error;
}

async function saveSubscription(db: Admin, sub: Stripe.Subscription) {
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
  const { error } = await db
    .from('profiles')
    .update({
      subscription_status: sub.status,
      subscription_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    })
    .eq('stripe_customer_id', customerId);
  if (error) throw error;
}

async function fulfillCheckout(db: Admin, session: Stripe.Checkout.Session) {
  // Delayed payment methods complete checkout before the money arrives;
  // those are fulfilled on checkout.session.async_payment_succeeded instead.
  if (session.payment_status === 'unpaid') return;

  if (session.mode === 'payment') {
    await unlockResume(db, session, 'single');
  } else if (session.mode === 'subscription' && session.subscription) {
    const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
    const sub = await getStripe().subscriptions.retrieve(subId);
    await saveSubscription(db, sub);
    await unlockResume(db, session, 'monthly');
  }
}

async function handleEvent(db: Admin, event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      await fulfillCheckout(db, event.data.object);
      break;
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await saveSubscription(db, event.data.object);
      break;
  }
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  // The signature is computed over the raw body, so read it as text, not JSON.
  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const db = createAdminClient();

  // Stripe delivers at least once. Record the event id first; a duplicate
  // delivery hits the primary key and is acknowledged without reprocessing.
  const { error: claimError } = await db.from('stripe_events').insert({ id: event.id, type: event.type });
  if (claimError) {
    if (claimError.code === '23505') return NextResponse.json({ received: true, duplicate: true });
    console.error('Could not record Stripe event:', claimError);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  try {
    await handleEvent(db, event);
  } catch (err) {
    // Release the claim so Stripe's retry gets processed.
    await db.from('stripe_events').delete().eq('id', event.id);
    console.error(`Handling Stripe event ${event.id} failed:`, err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
