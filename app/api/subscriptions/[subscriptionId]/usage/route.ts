import { NextResponse } from 'next/server';
import { subscriptionService } from '@/lib/services/subscription-service';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { subscriptionId: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the subscription belongs to the user
    const subscription = await subscriptionService.getSubscription(user.id);
    if (!subscription || subscription.id !== params.subscriptionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usage = await subscriptionService.getUsageMetrics(params.subscriptionId);
    return NextResponse.json(usage);
  } catch (error) {
    console.error('Error fetching usage metrics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 