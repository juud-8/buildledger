import { NextResponse } from 'next/server';
import { subscriptionService } from '@/lib/services/subscription-service';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await subscriptionService.getSubscription(user.id);
    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 