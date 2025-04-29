import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { subscriptionService } from '@/lib/services/subscription-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await subscriptionService.getCurrentSubscription();
    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 