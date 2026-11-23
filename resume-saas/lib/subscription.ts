type Profile = { subscription_status: string | null; subscription_period_end: string | null } | null;

// subscription_status holds Stripe's subscription status as sent by the webhook.
export function hasActiveSubscription(profile: Profile): boolean {
  return (profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing')
    && !!profile.subscription_period_end
    && new Date(profile.subscription_period_end) > new Date();
}
