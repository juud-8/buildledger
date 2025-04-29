import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { subscriptionService } from '@/lib/services/subscription-service';

export async function GET(
  request: Request,
  { params }: { params: { subscriptionId: string } }
) {
  try {
    const supabase = supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const metrics = await subscriptionService.getUsageMetrics(params.subscriptionId);
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching usage metrics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { subscriptionId: string } }
) {
  try {
    const supabase = supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { feature, increment } = await request.json();
    if (!feature) {
      return NextResponse.json({ error: 'Feature name is required' }, { status: 400 });
    }

    const usage = await subscriptionService.updateUsage(
      params.subscriptionId,
      feature,
      increment
    );
    return NextResponse.json(usage);
  } catch (error) {
    console.error('Error updating usage:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 