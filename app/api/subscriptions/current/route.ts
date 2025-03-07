import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookies()
    }
  );
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      subscription_plans (
        name,
        price,
        interval,
        features
      )
    `)
    .eq('user_id', session.user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!subscription) {
    return NextResponse.json(null);
  }

  return NextResponse.json({
    status: subscription.status,
    current_period_end: subscription.current_period_end,
    plan: subscription.subscription_plans
  });
}