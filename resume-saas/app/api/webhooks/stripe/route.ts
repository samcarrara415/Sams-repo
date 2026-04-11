import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Use service-role key here so we can bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature error:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, resumeId } = session.metadata || {};

    if (!userId) return NextResponse.json({ received: true });

    const now = new Date().toISOString();

    if (session.mode === 'payment' && resumeId) {
      // One-time $2 purchase — unlock the specific resume
      await supabase
        .from('resumes')
        .update({ is_unlocked: true, stripe_session_id: session.id, unlock_method: 'single', unlocked_at: now })
        .eq('id', resumeId)
        .eq('user_id', userId);
    }

    if (session.mode === 'subscription') {
      // Subscription started — mark user as active, unlock any pending resume
      const sub = await stripe.subscriptions.retrieve(session.subscription as string);
      const periodEnd = new Date(sub.current_period_end * 1000).toISOString();

      await supabase
        .from('profiles')
        .update({ subscription_status: 'active', subscription_period_end: periodEnd })
        .eq('id', userId);

      if (resumeId) {
        await supabase
          .from('resumes')
          .update({ is_unlocked: true, stripe_session_id: session.id, unlock_method: 'monthly', unlocked_at: now })
          .eq('id', resumeId)
          .eq('user_id', userId);
      }
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', sub.customer as string);

    if (profiles && profiles.length > 0) {
      const isActive = sub.status === 'active';
      const periodEnd = new Date(sub.current_period_end * 1000).toISOString();
      await supabase
        .from('profiles')
        .update({
          subscription_status: isActive ? 'active' : 'cancelled',
          subscription_period_end: isActive ? periodEnd : null,
        })
        .eq('stripe_customer_id', sub.customer as string);
    }
  }

  return NextResponse.json({ received: true });
}
