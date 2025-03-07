import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe';
import Stripe from 'stripe';

async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const { metadata } = subscription;
  if (!metadata?.user_id || !metadata?.plan_id) return;

  await supabase
    .from('subscriptions')
    .upsert({
      user_id: metadata.user_id,
      plan_id: metadata.plan_id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at: subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000)
        : null,
    })
    .eq('user_id', metadata.user_id);
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('Stripe-Signature');

  if (!signature || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );

    const supabase = createRouteHandlerClient({ cookies });

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(
          event.data.object as Stripe.Subscription,
          supabase
        );
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}